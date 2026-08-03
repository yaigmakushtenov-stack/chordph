-- Chord.ph private-beta access foundation.
-- Additive and dormant until the web gate calls has_beta_access().
-- Run after community_schema.sql because it reuses public.is_admin().

create extension if not exists pgcrypto;

create table if not exists public.beta_invites (
    id             uuid primary key default gen_random_uuid(),
    code_hash      text not null unique,
    label          text,
    allowed_email  text,
    max_uses       integer not null default 1 check (max_uses between 1 and 100),
    use_count      integer not null default 0 check (use_count >= 0),
    expires_at     timestamptz not null,
    created_by     uuid not null references auth.users(id) on delete restrict,
    created_at     timestamptz not null default now(),
    revoked_at     timestamptz,
    constraint beta_invites_email_normalized
        check (allowed_email is null or allowed_email = lower(trim(allowed_email))),
    constraint beta_invites_use_count_valid check (use_count <= max_uses)
);

create table if not exists public.beta_access (
    user_id        uuid primary key references auth.users(id) on delete cascade,
    invite_id      uuid references public.beta_invites(id) on delete set null,
    email          text not null,
    granted_at     timestamptz not null default now(),
    granted_by     uuid references auth.users(id) on delete set null,
    revoked_at     timestamptz,
    constraint beta_access_email_normalized check (email = lower(trim(email)))
);

create index if not exists beta_invites_active_idx
    on public.beta_invites (expires_at)
    where revoked_at is null;

create index if not exists beta_access_active_idx
    on public.beta_access (user_id)
    where revoked_at is null;

alter table public.beta_invites enable row level security;
alter table public.beta_access enable row level security;

revoke all on public.beta_invites from anon, authenticated;
revoke all on public.beta_access from anon, authenticated;

drop policy if exists "beta_invites_admin_read" on public.beta_invites;
create policy "beta_invites_admin_read" on public.beta_invites
    for select to authenticated using (public.is_admin());

drop policy if exists "beta_access_self_or_admin_read" on public.beta_access;
create policy "beta_access_self_or_admin_read" on public.beta_access
    for select to authenticated
    using (auth.uid() = user_id or public.is_admin());

grant select on public.beta_invites to authenticated;
grant select on public.beta_access to authenticated;

create or replace function public.has_beta_access()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
    select coalesce(public.is_admin(), false)
        or exists (
            select 1
            from public.beta_access a
            where a.user_id = auth.uid()
              and a.revoked_at is null
        );
$$;

create or replace function public.create_beta_invite(
    p_label text default null,
    p_allowed_email text default null,
    p_max_uses integer default 1,
    p_expires_in_hours integer default 168
)
returns table (invite_id uuid, invite_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_code text;
    v_id uuid;
    v_expires timestamptz;
    v_email text;
begin
    if not public.is_admin() then
        raise exception 'admin_required' using errcode = '42501';
    end if;

    if p_max_uses < 1 or p_max_uses > 100 then
        raise exception 'invalid_max_uses' using errcode = '22023';
    end if;

    if p_expires_in_hours < 1 or p_expires_in_hours > 2160 then
        raise exception 'invalid_expiry' using errcode = '22023';
    end if;

    v_email := nullif(lower(trim(p_allowed_email)), '');
    v_expires := now() + make_interval(hours => p_expires_in_hours);

    -- 96 bits of randomness, grouped for phone sharing. The raw code is returned
    -- once; only its SHA-256 digest is stored.
    v_code := upper(encode(gen_random_bytes(12), 'hex'));
    v_code := 'CHORD-' || substr(v_code, 1, 4) || '-' ||
              substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4) || '-' ||
              substr(v_code, 13, 4) || '-' || substr(v_code, 17, 4) || '-' ||
              substr(v_code, 21, 4);

    insert into public.beta_invites (
        code_hash, label, allowed_email, max_uses, expires_at, created_by
    ) values (
        encode(digest(lower(v_code), 'sha256'), 'hex'),
        nullif(trim(p_label), ''),
        v_email,
        p_max_uses,
        v_expires,
        auth.uid()
    ) returning id into v_id;

    return query select v_id, v_code, v_expires;
end;
$$;

create or replace function public.redeem_beta_invite(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_invite public.beta_invites%rowtype;
    v_email text;
begin
    if auth.uid() is null then
        raise exception 'sign_in_required' using errcode = '42501';
    end if;

    v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
    if v_email = '' then
        raise exception 'verified_email_required' using errcode = '42501';
    end if;

    select * into v_invite
    from public.beta_invites
    where code_hash = encode(digest(lower(trim(p_code)), 'sha256'), 'hex')
    for update;

    if not found
       or v_invite.revoked_at is not null
       or v_invite.expires_at <= now()
       or v_invite.use_count >= v_invite.max_uses then
        raise exception 'invalid_or_expired_invite' using errcode = '22023';
    end if;

    if v_invite.allowed_email is not null and v_invite.allowed_email <> v_email then
        raise exception 'invite_email_mismatch' using errcode = '42501';
    end if;

    insert into public.beta_access (user_id, invite_id, email, granted_by)
    values (auth.uid(), v_invite.id, v_email, v_invite.created_by)
    on conflict (user_id) do update
        set invite_id = excluded.invite_id,
            email = excluded.email,
            granted_at = now(),
            granted_by = excluded.granted_by,
            revoked_at = null;

    update public.beta_invites
    set use_count = use_count + 1
    where id = v_invite.id;

    return true;
end;
$$;

create or replace function public.revoke_beta_invite(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_required' using errcode = '42501';
    end if;

    update public.beta_invites
    set revoked_at = coalesce(revoked_at, now())
    where id = p_invite_id;

    return found;
end;
$$;

create or replace function public.revoke_beta_access(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_required' using errcode = '42501';
    end if;

    if p_user_id = auth.uid() then
        raise exception 'owner_self_revoke_blocked' using errcode = '22023';
    end if;

    update public.beta_access
    set revoked_at = coalesce(revoked_at, now())
    where user_id = p_user_id;

    return found;
end;
$$;

revoke all on function public.has_beta_access() from public, anon;
revoke all on function public.create_beta_invite(text, text, integer, integer) from public, anon;
revoke all on function public.redeem_beta_invite(text) from public, anon;
revoke all on function public.revoke_beta_invite(uuid) from public, anon;
revoke all on function public.revoke_beta_access(uuid) from public, anon;

grant execute on function public.has_beta_access() to authenticated;
grant execute on function public.create_beta_invite(text, text, integer, integer) to authenticated;
grant execute on function public.redeem_beta_invite(text) to authenticated;
grant execute on function public.revoke_beta_invite(uuid) to authenticated;
grant execute on function public.revoke_beta_access(uuid) to authenticated;

comment on table public.beta_invites is
    'Private-beta invitations. Raw codes are never stored.';
comment on table public.beta_access is
    'Account-bound private-beta access grants.';
comment on function public.has_beta_access() is
    'True for platform admins or users with an active beta grant.';
