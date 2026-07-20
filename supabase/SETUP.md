# Chord.ph cloud sync — setup

One-time setup. Takes ~5 minutes. You need a (free) Supabase account.

## 1. Create the project
1. Go to https://supabase.com → sign in → **New project**.
2. Name it (e.g. `chordph`), set a database password (save it), pick a region
   near your users (Southeast Asia / Singapore for PH), create.

## 2. Create the table
1. In the project, open **SQL Editor** → **New query**.
2. Paste the entire contents of `schema.sql` (in this folder) and **Run**.
3. You should see "Success. No rows returned."

## 3. Enable email sign-in
1. **Authentication → Providers → Email**: make sure it's **enabled**.
   (Magic-link / OTP works out of the box — no external setup.)
2. **Authentication → URL Configuration**: add your app URLs to
   **Redirect URLs**, e.g. `https://chord.ph/app/` and, for local testing,
   `http://localhost:8322/app/`.

## 4. Give me the two keys
**Project Settings → API**, copy:
- **Project URL** (looks like `https://xxxx.supabase.co`)
- **anon public** key (a long JWT — the *public* one, NOT `service_role`)

Paste both to me. They're safe to embed in the app — Row Level Security
(from `schema.sql`) ensures each signed-in user can only read/write their
own row.

## Later: Google sign-in
Requires a Google Cloud OAuth client (consent screen + client ID/secret) added
under **Authentication → Providers → Google**, and Google's verification review
for public use. We'll do this after email sync is proven.
