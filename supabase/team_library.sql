-- Chord.ph — shared BAND song library. Run once in the Supabase SQL Editor
-- (after teams.sql). A band can build its own set of songs that every member
-- can browse, separate from the public library and each person's own customs.

create table if not exists public.team_songs (
    id         uuid primary key default gen_random_uuid(),
    team_id    uuid not null references public.teams(id) on delete cascade,
    title      text not null,
    artist     text,
    key        text,
    tempo      int,
    feel       text,
    tags       text[],
    chart      text not null,
    added_by   uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.team_songs enable row level security;

-- members read the band's songs; the owner (admin) manages them.
-- (Member editing rights come later — this is owner-writes for now.)
drop policy if exists "tsongs_select" on public.team_songs;
create policy "tsongs_select" on public.team_songs for select using (public.is_team_member(team_id));
drop policy if exists "tsongs_owner_write" on public.team_songs;
create policy "tsongs_owner_write" on public.team_songs for all
    using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- live updates for the shared library too
alter publication supabase_realtime add table public.team_songs;
