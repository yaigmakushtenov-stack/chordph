-- Require every private-beta invitation to be bound to one Google email.
-- This replaces the existing function without changing its public signature.

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
    if v_email is null then
        raise exception 'invite_email_required' using errcode = '22023';
    end if;

    v_expires := now() + make_interval(hours => p_expires_in_hours);
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

revoke all on function public.create_beta_invite(text, text, integer, integer)
    from public, anon;
grant execute on function public.create_beta_invite(text, text, integer, integer)
    to authenticated;

comment on function public.create_beta_invite(text, text, integer, integer) is
    'Creates an admin-only, email-bound private-beta invitation.';
