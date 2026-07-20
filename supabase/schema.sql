-- Chord.ph cloud sync — run this once in the Supabase SQL Editor.
-- Model: one JSONB document per user (mirrors the local storage shape and
-- the export/import backup). Offline-first; the client merges, then writes.

create table if not exists public.user_data (
    user_id    uuid primary key references auth.users(id) on delete cascade,
    data       jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

-- Row Level Security: each user can only ever touch their own row.
alter table public.user_data enable row level security;

drop policy if exists "own_data_select" on public.user_data;
create policy "own_data_select" on public.user_data
    for select using (auth.uid() = user_id);

drop policy if exists "own_data_insert" on public.user_data;
create policy "own_data_insert" on public.user_data
    for insert with check (auth.uid() = user_id);

drop policy if exists "own_data_update" on public.user_data;
create policy "own_data_update" on public.user_data
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
