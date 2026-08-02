-- Public musician credit must never expose a contributor's email address.
alter table public.submissions
    add column if not exists submitter_name text;

alter table public.song_versions
    add column if not exists contributor_name text;

update public.song_versions
   set contributor_name = 'Community musician'
 where contributor_name is null or btrim(contributor_name) = '';

-- RLS controls rows, not columns. Replace table-wide SELECT privileges with an
-- explicit public column allow-list that omits contributor_email.
revoke select on table public.song_versions from anon, authenticated;
grant select (id, song_id, created_at, "key", type, instrument,
              reference_url, chart, votes, contributor_name)
    on table public.song_versions to anon, authenticated;
