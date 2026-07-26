-- Chord.ph — contact form messages. Run once in the Supabase SQL Editor.
-- Visitors submit from the landing page; you read them in the Supabase dashboard
-- (Table Editor → contact_messages).

create table if not exists public.contact_messages (
    id         uuid primary key default gen_random_uuid(),
    name       text,
    email      text,
    topic      text,
    message    text not null,
    created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone may send a message. Nobody can read them back through the API — there's
-- no select policy, so messages are only visible to you in the dashboard.
drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages
    for insert with check (true);
