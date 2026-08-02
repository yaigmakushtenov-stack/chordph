-- Chord.ph v2 product foundation. Review in staging before running in production.

-- A ministry can own multiple teams while personal teams continue to work.
create table if not exists public.organizations (
    id         uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name       text not null check (char_length(btrim(name)) between 2 and 100),
    slug       text unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
    owner_id   uuid not null references auth.users(id) on delete restrict
);

create table if not exists public.organization_members (
    organization_id uuid not null references public.organizations(id) on delete cascade,
    user_id          uuid not null references auth.users(id) on delete cascade,
    role             text not null default 'member' check (role in ('owner','admin','member')),
    created_at       timestamptz not null default now(),
    primary key (organization_id, user_id)
);

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
    select 1 from public.organization_members
     where organization_id = p_organization_id and user_id = auth.uid()
) $$;

create or replace function public.can_manage_organization(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
    select 1 from public.organization_members
     where organization_id = p_organization_id and user_id = auth.uid()
       and role in ('owner','admin')
) $$;

create or replace function public.is_organization_owner(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
    select 1 from public.organizations
     where id = p_organization_id and owner_id = auth.uid()
) $$;

create or replace function public.add_organization_owner()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
    insert into public.organization_members (organization_id, user_id, role)
    values (new.id, new.owner_id, 'owner');
    return new;
end $$;

drop trigger if exists organizations_add_owner on public.organizations;
create trigger organizations_add_owner after insert on public.organizations
for each row execute function public.add_organization_owner();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "organizations_create" on public.organizations;
create policy "organizations_create" on public.organizations for insert
    with check (owner_id = auth.uid());
drop policy if exists "organizations_read" on public.organizations;
create policy "organizations_read" on public.organizations for select
    using (public.is_organization_member(id));
drop policy if exists "organizations_manage" on public.organizations;
create policy "organizations_manage" on public.organizations for update
    using (public.can_manage_organization(id)) with check (public.can_manage_organization(id));
revoke update on public.organizations from anon, authenticated;
grant update (name, slug) on public.organizations to authenticated;
drop policy if exists "organization_members_read" on public.organization_members;
create policy "organization_members_read" on public.organization_members for select
    using (public.is_organization_member(organization_id));
drop policy if exists "organization_members_manage" on public.organization_members;
drop policy if exists "organization_members_add" on public.organization_members;
create policy "organization_members_add" on public.organization_members for insert
    with check (public.can_manage_organization(organization_id) and role <> 'owner');
drop policy if exists "organization_members_update" on public.organization_members;
create policy "organization_members_update" on public.organization_members for update
    using (public.can_manage_organization(organization_id) and role <> 'owner')
    with check (public.can_manage_organization(organization_id) and role <> 'owner');
drop policy if exists "organization_members_remove" on public.organization_members;
create policy "organization_members_remove" on public.organization_members for delete
    using (public.can_manage_organization(organization_id) and role <> 'owner');

alter table public.teams add column if not exists organization_id uuid
    references public.organizations(id) on delete set null;

-- Billing state is written only by a verified payment webhook/service role.
create table if not exists public.subscriptions (
    id                        uuid primary key default gen_random_uuid(),
    user_id                   uuid references auth.users(id) on delete cascade,
    organization_id           uuid references public.organizations(id) on delete cascade,
    tier                      text not null default 'free' check (tier in ('free','pro','premium')),
    status                    text not null default 'inactive' check (status in ('inactive','trialing','active','past_due','cancelled')),
    provider                  text,
    provider_customer_ref     text,
    provider_subscription_ref text unique,
    current_period_end        timestamptz,
    updated_at                timestamptz not null default now(),
    check ((user_id is not null)::int + (organization_id is not null)::int = 1)
);

alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_read_owner" on public.subscriptions;
create policy "subscriptions_read_owner" on public.subscriptions for select
    using (user_id = auth.uid() or
           (organization_id is not null and public.can_manage_organization(organization_id)));

-- Metadata for private practice audio. Binary files live in a private Storage
-- bucket and are not embedded in user_data JSON or shared chart payloads.
insert into storage.buckets (id, name, public)
values ('practice-tracks', 'practice-tracks', false)
on conflict (id) do update set public = false;

create table if not exists public.practice_tracks (
    id              uuid primary key default gen_random_uuid(),
    created_at      timestamptz not null default now(),
    owner_id        uuid not null references auth.users(id) on delete cascade,
    organization_id uuid references public.organizations(id) on delete cascade,
    song_id         text,
    storage_path    text not null unique,
    filename        text not null,
    mime_type       text not null check (mime_type in ('audio/mpeg','audio/mp4','audio/wav','audio/x-wav')),
    bytes           bigint not null check (bytes between 1 and 524288000),
    duration_seconds numeric check (duration_seconds is null or duration_seconds between 0 and 21600)
);

alter table public.practice_tracks enable row level security;
drop policy if exists "practice_tracks_create" on public.practice_tracks;
drop policy if exists "practice_tracks_read" on public.practice_tracks;
create policy "practice_tracks_read" on public.practice_tracks for select
    using (owner_id = auth.uid() or
           (organization_id is not null and public.is_organization_member(organization_id)));
drop policy if exists "practice_tracks_delete" on public.practice_tracks;
create policy "practice_tracks_delete" on public.practice_tracks for delete
    using (owner_id = auth.uid() or
           (organization_id is not null and public.can_manage_organization(organization_id)));

-- Uploads have no authenticated INSERT policy: a server function first checks
-- subscription/quota, then issues a short-lived signed upload token.
drop policy if exists "practice_audio_upload_own_folder" on storage.objects;
drop policy if exists "practice_audio_read_authorized" on storage.objects;
create policy "practice_audio_read_authorized" on storage.objects for select to authenticated
    using (bucket_id = 'practice-tracks' and exists (
        select 1 from public.practice_tracks p
         where p.storage_path = name and
              (p.owner_id = auth.uid() or
               (p.organization_id is not null and public.is_organization_member(p.organization_id)))
    ));
drop policy if exists "practice_audio_delete_authorized" on storage.objects;
create policy "practice_audio_delete_authorized" on storage.objects for delete to authenticated
    using (bucket_id = 'practice-tracks' and exists (
        select 1 from public.practice_tracks p
         where p.storage_path = name and
              (p.owner_id = auth.uid() or
               (p.organization_id is not null and public.can_manage_organization(p.organization_id)))
    ));

-- Audio transcription is asynchronous: uploads become jobs, and only a worker
-- using the service role may change provider state or write generated drafts.
create table if not exists public.audio_to_chart_jobs (
    id                 uuid primary key default gen_random_uuid(),
    created_at         timestamptz not null default now(),
    requested_by       uuid not null references auth.users(id) on delete cascade,
    practice_track_id  uuid not null references public.practice_tracks(id) on delete cascade,
    status             text not null default 'queued' check (status in ('queued','processing','needs_review','completed','failed','cancelled')),
    progress           integer not null default 0 check (progress between 0 and 100),
    provider_job_ref   text,
    result_draft       jsonb,
    error_code         text,
    tier_snapshot      text not null check (tier_snapshot in ('premium','trial')),
    started_at         timestamptz,
    completed_at       timestamptz
);

alter table public.audio_to_chart_jobs enable row level security;
drop policy if exists "audio_jobs_request_own_track" on public.audio_to_chart_jobs;
drop policy if exists "audio_jobs_read_own" on public.audio_to_chart_jobs;
create policy "audio_jobs_read_own" on public.audio_to_chart_jobs for select
    using (requested_by = auth.uid());
revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke insert, update on public.practice_tracks from anon, authenticated;
revoke insert on public.audio_to_chart_jobs from anon, authenticated;
revoke update, delete on public.audio_to_chart_jobs from anon, authenticated;
