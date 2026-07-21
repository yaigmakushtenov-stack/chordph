-- Chord.ph community library — submissions, versions, voting.
-- Run once in the Supabase SQL Editor, AFTER songs_seed.sql.
--
-- Model: songs (catalog) → song_versions (many approved charts per song) → votes.
-- Users submit; the admin reviews; approved submissions become versions.

-- ---------------------------------------------------------------------------
-- Admin identity — an allowlist of emails who may review/approve/curate.
-- Add a reviewer later with:  insert into public.admins (email) values ('them@x.com');
-- They just sign in with that email (magic-link) — no passwords anywhere.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
    email    text primary key,
    added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- is_admin() runs as owner (security definer) so it can read the allowlist even
-- though normal users can't — this also avoids RLS recursion on public.admins.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'));
$$;

-- only admins can see (and, below, manage) the admin list
drop policy if exists "admins_read" on public.admins;
create policy "admins_read" on public.admins for select using (public.is_admin());
drop policy if exists "admins_manage" on public.admins;
create policy "admins_manage" on public.admins
    for all using (public.is_admin()) with check (public.is_admin());

-- seed the owner as the first admin
insert into public.admins (email) values ('yaigmakushtenov@gmail.com') on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 1. submissions — what users send in, awaiting review
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
    id              uuid primary key default gen_random_uuid(),
    created_at      timestamptz not null default now(),
    submitter_id    uuid not null references auth.users(id) on delete cascade,
    submitter_email text not null,
    song_id         text references public.songs(id) on delete set null, -- set when adding a version to an existing song; null = new song
    title           text not null,
    artist          text,
    "key"           text,
    tempo           int,
    feel            text,
    type            text not null default 'chord' check (type in ('chord','tab')),
    instrument      text,          -- for tabs: lead-guitar, rhythm-guitar, bass, keys...
    reference_url   text not null, -- YouTube/Spotify link, required
    chart           text not null,
    status          text not null default 'pending' check (status in ('pending','approved','rejected')),
    review_note     text,
    reviewed_at     timestamptz
);

alter table public.submissions enable row level security;

-- a signed-in user may submit as themselves
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own" on public.submissions
    for insert with check (auth.uid() = submitter_id);

-- a user sees their own submissions; the admin sees everything
drop policy if exists "submissions_select_own_or_admin" on public.submissions;
create policy "submissions_select_own_or_admin" on public.submissions
    for select using (auth.uid() = submitter_id or public.is_admin());

-- only the admin approves/rejects
drop policy if exists "submissions_admin_update" on public.submissions;
create policy "submissions_admin_update" on public.submissions
    for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. song_versions — approved charts. A song can have several.
-- ---------------------------------------------------------------------------
create table if not exists public.song_versions (
    id                uuid primary key default gen_random_uuid(),
    song_id           text not null references public.songs(id) on delete cascade,
    created_at        timestamptz not null default now(),
    contributor_email text,
    "key"             text,
    type              text not null default 'chord' check (type in ('chord','tab')),
    instrument        text,
    reference_url     text,
    chart             text not null,
    votes             int not null default 0   -- cached count (maintained by trigger below)
);

alter table public.song_versions enable row level security;

-- the version library is public (anyone can read, even signed out)
drop policy if exists "song_versions_public_read" on public.song_versions;
create policy "song_versions_public_read" on public.song_versions
    for select using (true);

-- only the admin creates/edits/removes versions (happens on approval)
drop policy if exists "song_versions_admin_write" on public.song_versions;
create policy "song_versions_admin_write" on public.song_versions
    for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. votes — one thumbs-up per user per version
-- ---------------------------------------------------------------------------
create table if not exists public.votes (
    version_id uuid not null references public.song_versions(id) on delete cascade,
    user_id    uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (version_id, user_id)
);

alter table public.votes enable row level security;

-- counts are public; each user manages only their own vote
drop policy if exists "votes_read" on public.votes;
create policy "votes_read" on public.votes for select using (true);
drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own" on public.votes for insert with check (auth.uid() = user_id);
drop policy if exists "votes_delete_own" on public.votes;
create policy "votes_delete_own" on public.votes for delete using (auth.uid() = user_id);

-- keep song_versions.votes in sync (security definer: bypasses the voter's RLS
-- so the cached count updates even though voters can't write song_versions)
create or replace function public.sync_version_votes() returns trigger
language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.song_versions set votes = votes + 1 where id = new.version_id;
  elsif (tg_op = 'DELETE') then
    update public.song_versions set votes = greatest(0, votes - 1) where id = old.version_id;
  end if;
  return null;
end; $$;

drop trigger if exists votes_count_ins on public.votes;
create trigger votes_count_ins after insert on public.votes
    for each row execute function public.sync_version_votes();
drop trigger if exists votes_count_del on public.votes;
create trigger votes_count_del after delete on public.votes
    for each row execute function public.sync_version_votes();

-- ---------------------------------------------------------------------------
-- 4. let the admin curate the songs catalog from the app (approving a brand-new
--    song creates its catalog row). Public read policy already exists from seed.
-- ---------------------------------------------------------------------------
drop policy if exists "songs_admin_write" on public.songs;
create policy "songs_admin_write" on public.songs
    for all using (public.is_admin()) with check (public.is_admin());
