# Turn on Auto-Find Links (no coding)

This lets Chord.ph automatically find a song's **Spotify** track and **YouTube** video.
You copy a few free "keys" and paste them into Supabase. ~20 minutes, free, do it on a computer.

A friendlier, click-by-click version is the published guide (ask Claude for the link).

## Part 1 — 2 keys from Spotify
1. Open **developer.spotify.com/dashboard** and log in.
2. Click **Create app**. Name: `Chord.ph`. Redirect URI: `https://chord.ph` (click Add). Tick **Web API**. Save.
3. Open the app → **Settings**. Copy the **Client ID** and (click *View client secret*) the **Client secret**. Keep them safe — the secret is a password.

## Part 2 — 1 key from Google (YouTube)
4. Open **console.cloud.google.com**, log in, create a **New Project** named `Chord.ph`, select it.
5. Search **YouTube Data API v3** → open it → click **Enable**.
6. Search **Credentials** → **+ Create Credentials** → **API key** → copy it.

You now have 3 keys: Spotify Client ID, Spotify Client secret, YouTube key.

## Part 3 — Add the function to Supabase
7. Open **supabase.com/dashboard** → your Chord.ph project → **Edge Functions**.
8. Click **Create a function** (via editor). Name it **exactly** `find-links`.
9. Delete any sample code, paste the contents of `index.ts` (in this folder), then **Deploy**.

## Part 4 — Paste the 3 keys (Secrets)
10. In **Edge Functions → Secrets** (or Project Settings → Edge Functions → Secrets), add three secrets, names **exactly**:
    - `SPOTIFY_CLIENT_ID` → your Spotify Client ID
    - `SPOTIFY_CLIENT_SECRET` → your Spotify Client secret
    - `YOUTUBE_API_KEY` → your YouTube key
    Save.

## Part 5 — Test
11. In the app, sign in, open a song with no links, tap **🎧 Listen & learn → ✨ Auto-find links**. Links should appear — check they're the right song.

**If the button says "not set up yet":** the function name must be exactly `find-links` and the 3 secret names must match exactly (all caps, underscores).

Both APIs have free tiers (YouTube ~100 searches/day; Spotify free), so this costs nothing at normal use.
