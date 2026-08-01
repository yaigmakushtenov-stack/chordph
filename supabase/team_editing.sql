-- Chord.ph — band member editing rights. Run once in the Supabase SQL Editor
-- (after teams.sql + team_library.sql). Lets the admin grant a member permission
-- to edit the band (publish setlists, add/remove band songs), not just view.

alter table public.team_members add column if not exists can_edit boolean not null default false;

-- owner OR a member the owner marked can_edit
create or replace function public.can_edit_team(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.teams where id = t and owner_id = auth.uid())
        or exists (select 1 from public.team_members where team_id = t and user_id = auth.uid() and can_edit = true);
$$;

-- team_setlists: editors (owner or granted members) can write; members still read
drop policy if exists "ts_owner_write" on public.team_setlists;
drop policy if exists "ts_editor_write" on public.team_setlists;
create policy "ts_editor_write" on public.team_setlists for all
    using (public.can_edit_team(team_id)) with check (public.can_edit_team(team_id));

-- team_songs: editors can write
drop policy if exists "tsongs_owner_write" on public.team_songs;
drop policy if exists "tsongs_editor_write" on public.team_songs;
create policy "tsongs_editor_write" on public.team_songs for all
    using (public.can_edit_team(team_id)) with check (public.can_edit_team(team_id));

-- only the owner may grant/revoke edit rights (update a member row)
drop policy if exists "tm_update" on public.team_members;
create policy "tm_update" on public.team_members for update
    using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));
