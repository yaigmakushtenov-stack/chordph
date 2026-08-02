// Chord.ph — Edge Function: find a song's Spotify track + YouTube video by
// title + artist. Keys stay server-side (set as function secrets).
//
// Deploy:   supabase functions deploy find-links --no-verify-jwt
// Secrets:  supabase secrets set SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... YOUTUBE_API_KEY=...
//   - Spotify: create an app at developer.spotify.com/dashboard -> Client ID/Secret
//   - YouTube: a Google Cloud API key with "YouTube Data API v3" enabled
//
// The client calls it with supa.functions.invoke('find-links', { body: { title, artist } }).

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function spotifyToken(): Promise<string | null> {
  const id = Deno.env.get("SPOTIFY_CLIENT_ID");
  const secret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!id || !secret) return null;
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${id}:${secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.access_token ?? null;
}

async function findSpotify(title: string, artist: string): Promise<string | null> {
  const token = await spotifyToken();
  if (!token) return null;
  const q = encodeURIComponent(`track:${title}${artist ? ` artist:${artist}` : ""}`);
  const r = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.tracks?.items?.[0]?.external_urls?.spotify ?? null;
}

async function findYouTube(title: string, artist: string): Promise<string | null> {
  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (!key) return null;
  const q = encodeURIComponent(`${artist} ${title} official`.trim());
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=1&q=${q}&key=${key}`,
  );
  if (!r.ok) return null;
  const j = await r.json();
  const v = j.items?.[0]?.id?.videoId;
  return v ? `https://youtu.be/${v}` : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { title, artist } = await req.json();
    if (!title || !String(title).trim()) return json({ error: "title required" }, 400);
    const [spotify, youtube] = await Promise.all([
      findSpotify(String(title).trim(), String(artist || "").trim()).catch(() => null),
      findYouTube(String(title).trim(), String(artist || "").trim()).catch(() => null),
    ]);
    return json({ spotify, youtube });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
