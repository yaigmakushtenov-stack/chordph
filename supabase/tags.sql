-- Chord.ph — song tags for search/filter. Run once in the Supabase SQL Editor.

alter table public.songs       add column if not exists tags text[] not null default '{}';
alter table public.submissions add column if not exists tags text[] not null default '{}';

-- Seed tags on the built-in library (language + energy + genre).
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'glorious';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'way-maker';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'presence';
update public.songs set tags = '{Worship,Filipino,Mellow}' where id = 'lilim';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'heart-of-worship';
update public.songs set tags = '{Worship,English,Upbeat}'  where id = 'take-it-all';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'god-is-here';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'lead-me-to-the-cross';
update public.songs set tags = '{Worship,English,Mellow}'  where id = 'oceans';
update public.songs set tags = '{Worship,English,Upbeat}'  where id = 'endless-praise';
update public.songs set tags = '{Worship,English,Upbeat}'  where id = 'this-is-our-time';
update public.songs set tags = '{Worship,English,Upbeat}'  where id = 'turn-it-up';
update public.songs set tags = '{Worship,English,Upbeat}'  where id = 'dance';
