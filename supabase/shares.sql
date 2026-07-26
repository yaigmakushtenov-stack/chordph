-- Chord.ph — short share links. Run once in the Supabase SQL Editor.
-- Instead of packing a whole chart into the URL, we store it here and put only a
-- short id in the link (chord.ph/app/#s=<id>).

create table if not exists public.shares (
    id         text primary key,                 -- short random code that lives in the link
    data       jsonb not null,                   -- the shared song / setlist payload
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.shares enable row level security;

-- Anyone with the link can open it (that's the whole point of a share link).
drop policy if exists "shares_public_read" on public.shares;
create policy "shares_public_read" on public.shares for select using (true);

-- Only a signed-in user can create a share, and it's tied to them.
drop policy if exists "shares_insert_own" on public.shares;
create policy "shares_insert_own" on public.shares
    for insert with check (auth.uid() = created_by);
