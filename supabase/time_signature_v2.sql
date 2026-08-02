-- Chord.ph V2: preserve a time signature on every chart.
-- Run this migration before deploying the matching app build.

begin;

alter table public.songs
    add column if not exists timesig text not null default '4/4';

alter table public.submissions
    add column if not exists timesig text not null default '4/4';

alter table public.song_versions
    add column if not exists timesig text not null default '4/4';

alter table public.team_songs
    add column if not exists timesig text not null default '4/4';

commit;
