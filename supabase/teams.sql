-- Chord.ph — Bands (team sync). Run once in the Supabase SQL Editor.
-- A band owner invites members by email; the band's setlists sync to everyone.

create table if not exists public.teams (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    owner_id   uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.team_members (
    team_id   uuid not null references public.teams(id) on delete cascade,
    user_id   uuid not null references auth.users(id) on delete cascade,
    email     text,
    role      text not null default 'member',   -- 'owner' | 'member'
    joined_at timestamptz not null default now(),
    primary key (team_id, user_id)
);

create table if not exists public.team_invites (
    team_id    uuid not null references public.teams(id) on delete cascade,
    email      text not null,
    created_at timestamptz not null default now(),
    primary key (team_id, email)
);

create table if not exists public.team_setlists (
    id         uuid primary key default gen_random_uuid(),
    team_id    uuid not null references public.teams(id) on delete cascade,
    name       text not null,
    data       jsonb not null,       -- { songs:[{title,artist,key,tempo,chart,...}] }
    updated_by uuid,
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Security-definer helpers (avoid RLS recursion on team_members)
-- ---------------------------------------------------------------------------
create or replace function public.is_team_member(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.team_members where team_id = t and user_id = auth.uid());
$$;
create or replace function public.is_team_owner(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.teams where id = t and owner_id = auth.uid());
$$;
create or replace function public.has_team_invite(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.team_invites
                   where team_id = t and lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.teams          enable row level security;
alter table public.team_members   enable row level security;
alter table public.team_invites   enable row level security;
alter table public.team_setlists  enable row level security;

-- teams: create your own; read teams you belong to; owner updates/deletes
drop policy if exists "teams_insert" on public.teams;
create policy "teams_insert" on public.teams for insert with check (auth.uid() = owner_id);
drop policy if exists "teams_select" on public.teams;
create policy "teams_select" on public.teams for select using (owner_id = auth.uid() or public.is_team_member(id));
drop policy if exists "teams_owner_update" on public.teams;
create policy "teams_owner_update" on public.teams for update using (owner_id = auth.uid());
drop policy if exists "teams_owner_delete" on public.teams;
create policy "teams_owner_delete" on public.teams for delete using (owner_id = auth.uid());

-- team_members: members read the roster; owner adds anyone; a user may add
-- THEMSELVES only if they hold an invite; owner or the member can remove
drop policy if exists "tm_select" on public.team_members;
create policy "tm_select" on public.team_members for select using (public.is_team_member(team_id));
drop policy if exists "tm_insert" on public.team_members;
create policy "tm_insert" on public.team_members for insert
    with check (public.is_team_owner(team_id) or (user_id = auth.uid() and public.has_team_invite(team_id)));
drop policy if exists "tm_delete" on public.team_members;
create policy "tm_delete" on public.team_members for delete
    using (public.is_team_owner(team_id) or user_id = auth.uid());

-- team_invites: owner manages; the invited person can see/accept (delete) their own
drop policy if exists "ti_owner_all" on public.team_invites;
create policy "ti_owner_all" on public.team_invites for all
    using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));
drop policy if exists "ti_invitee_select" on public.team_invites;
create policy "ti_invitee_select" on public.team_invites for select
    using (lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "ti_invitee_delete" on public.team_invites;
create policy "ti_invitee_delete" on public.team_invites for delete
    using (lower(email) = lower(auth.jwt() ->> 'email'));

-- team_setlists: members read; owner writes (the admin publishes the week's set)
drop policy if exists "ts_select" on public.team_setlists;
create policy "ts_select" on public.team_setlists for select using (public.is_team_member(team_id));
drop policy if exists "ts_owner_write" on public.team_setlists;
create policy "ts_owner_write" on public.team_setlists for all
    using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));
