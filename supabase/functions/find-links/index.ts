// Chord.ph — Edge Function: find a song's Spotify track + YouTube video by
// title + artist. Keys stay server-side (set as function secrets).
//
// Deploy:   supabase functions deploy find-links
// Secrets:  supabase secrets set SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... YOUTUBE_API_KEY=...
//   - Spotify: create an app at developer.spotify.com/dashboard -> Client ID/Secret
//   - YouTube: a Google Cloud API key with "YouTube Data API v3" enabled
//
// The client calls it with supa.functions.invoke('find-links', { body: { title, artist } }).

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { authorizeAndConsume, jsonResponse, preflightResponse } from "../_shared/security.ts";

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
  // Try a strict field-filtered search first, then fall back to progressively
  // looser free-text queries — Spotify's `track:`/`artist:` filters are very
  // literal, so an exact-spelling miss should not mean "no result".
  const queries = [
    `track:${title}${artist ? ` artist:${artist}` : ""}`,
    artist ? `${title} ${artist}` : title,
    title,
  ];
  for (const raw of queries) {
    const q = encodeURIComponent(raw.trim());
    const r = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1&market=PH`,
      { headers: { "Authorization": `Bearer ${token}` } },
    );
    if (!r.ok) continue;
    const j = await r.json();
    const url = j.tracks?.items?.[0]?.external_urls?.spotify;
    if (url) return url;
  }
  return null;
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
  if (req.method === "OPTIONS") return preflightResponse(req);
  if (req.method !== "POST") return jsonResponse(req, { error: "method_not_allowed" }, 405);
  try {
    const access = await authorizeAndConsume(req, "find-links", 10);
    if (access instanceof Response) return access;

    const { title, artist } = await req.json();
    const clean = (value: unknown) => String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
    const cleanTitle = clean(title);
    const cleanArtist = clean(artist);
    if (!cleanTitle) return jsonResponse(req, { error: "title_required" }, 400);
    const [spotify, youtube] = await Promise.all([
      findSpotify(cleanTitle, cleanArtist).catch(() => null),
      findYouTube(cleanTitle, cleanArtist).catch(() => null),
    ]);
    return jsonResponse(req, { spotify, youtube });
  } catch (e) {
    console.error("find-links internal failure", e);
    return jsonResponse(req, { error: "internal_error" }, 500);
  }
});
