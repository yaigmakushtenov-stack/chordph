-- Chord.ph — enable realtime for band sync. Run once in the Supabase SQL Editor.
-- Adds the band tables to the realtime publication so members get live updates
-- (published setlists, new invites) without reopening the app. RLS still applies:
-- a client only receives a change if its policies let it SELECT that row.

alter publication supabase_realtime add table public.team_setlists;
alter publication supabase_realtime add table public.team_invites;

-- If a table is already in the publication this errors harmlessly ("already
-- member of publication") — safe to ignore.
