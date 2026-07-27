-- Chord.ph — Bands v2. Run once in the Supabase SQL Editor (after teams.sql).
-- Adds the one thing invite accept/decline needs: an invited person must be
-- able to read the band's NAME before they've joined, so the app can show
-- "Sunday Team invited you" instead of a bare id. Everything else v2 needs
-- (self-join with an invite, invitee deletes their own invite = decline,
-- owner sees pending invites for the roster) is already covered by teams.sql.

-- Let an invitee SELECT the team row while they hold an invite for it.
drop policy if exists "teams_select" on public.teams;
create policy "teams_select" on public.teams for select
    using (owner_id = auth.uid() or public.is_team_member(id) or public.has_team_invite(id));
