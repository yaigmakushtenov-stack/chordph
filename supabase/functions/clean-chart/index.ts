// Chord.ph — Edge Function: turn messy pasted song text into a clean chord
// chart in Chord.ph's native format (section headers + chords on their own
// line above the lyrics). The AI reformats only — it must NOT invent, change,
// or remove chords or lyrics.
//
// Deploy:   supabase functions deploy clean-chart
// Secret:   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   - Get a key at console.anthropic.com -> API Keys
//
// The client calls it with:
//   supa.functions.invoke('clean-chart', { body: { text, key } })

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "claude-sonnet-5";
const MAX_INPUT = 8000; // characters — chord charts are small; guard cost/abuse

const SYSTEM = `You format worship song chord charts for the Chord.ph app. You are given messy pasted text (often copied from a chord/tab website, notes, or an OCR) and you reformat it into a clean, consistent chord chart.

STRICT RULES:
- NEVER invent, add, remove, or change chords. Keep the exact chords from the input.
- NEVER change, add, or remove lyrics. Keep the exact words from the input.
- Only reformat: fix spacing, alignment, structure, and remove junk.

OUTPUT FORMAT (plain text only, no markdown, no code fences, no commentary):
- Mark each section with a header in square brackets on its own line: [Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Bridge], [Instrumental], [Outro], [Tag]. Use the section labels present in the input; only infer an obvious one if clearly implied.
- Put chords on their OWN line, positioned with spaces so each chord sits directly above the word/syllable it changes on. The line below it is the lyric line.
- If the input uses inline chords like [G]Amazing [C]grace, convert them to the two-line (chords-above-lyrics) form.
- A chord-only passage (like an intro or instrumental) is just a line of chords with no lyric line under it.
- Use single spaces between words in lyric lines; use spaces (never tabs) for chord alignment.
- Preserve the natural order of the song. Keep one blank line between sections. No trailing spaces.

REMOVE this kind of junk if present: website navigation, ads, "Tabs by", capo/tuning banners that aren't part of the song, view counts, difficulty ratings, comment threads, and duplicated headers. Keep a genuine "Capo" or "Key" note only if it appears to belong to the song, placing it as a short line at the very top.

Return ONLY the finished chart text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "not_configured" }, 501);

    const { text, key } = await req.json();
    const raw = String(text || "").trim();
    if (!raw) return json({ error: "text required" }, 400);
    if (raw.length > MAX_INPUT) return json({ error: "too_long" }, 413);

    const userMsg =
      (key ? `Song key: ${String(key)}\n\n` : "") +
      "Reformat this into a clean Chord.ph chord chart:\n\n" + raw;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return json({ error: "ai_failed", status: r.status, detail: detail.slice(0, 300) }, 502);
    }

    const j = await r.json();
    const chart = (j.content?.[0]?.text ?? "").trim();
    if (!chart) return json({ error: "empty" }, 502);

    return json({ chart });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
