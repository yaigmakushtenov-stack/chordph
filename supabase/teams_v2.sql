-- Chord.ph — Bands v2. Run once in the Supabase SQL Editor (after teams.sql).
-- Two changes for the invite accept/decline flow:
--   1. An invited person must be able to read the band's NAME before joining,
--      so the app can show "Sunday Team invited you" instead of a bare id.
--   2. Store WHO sent the invite so the card can say "Ben invited you".

alter table public.team_invites add column if not exists invited_by text;

-- Let an invitee SELECT the team row while they hold an invite for it.
drop policy if exists "teams_select" on public.teams;
create policy "teams_select" on public.teams for select
    using (owner_id = auth.uid() or public.is_team_member(id) or public.has_team_invite(id));
