# Chord.ph — roadmap & parked work

Everything discussed but not yet built. Kept here so nothing gets lost.
Last updated: 2026-07-27.

---

## Next up (committed)

### 1. Ambient pads & ambient percussion 🎹
Sustained atmospheric pads in the song's key that play under a set — the thing
worship teams currently pay Pad / Loop Community / Sunday Sounds for — plus
ambient percussion beds.

- ✅ **Synthesised pad — DONE & live** (Web Audio, follows the song's key,
  plays across the whole app, floating stop chip). Free for now to validate;
  becomes the anchor paid feature once payments exist.
- ⏳ **Ambient percussion beds** — still to build (looped ambient percussion
  under the pad; likely a synth/noise-based groove or short sampled loops).
- ⏳ **Sampled pads** for premium quality — later; needs licensed or
  self-produced audio, tens of MB of assets.
- ⏳ Optional: make the pad follow each medley section's key while scrolling
  (today it follows the open song).
- ⚠️ Must stay isolated from the analyzer's Essentia/MTG models, which are
  **CC BY-NC-SA (non-commercial)** and cannot sit behind a paywall.

### 2. Per-chart time signature
The engine already reads `song.timesig` and the metronome already supports any
signature — remaining: a `timesig` column on `songs` + `submissions`, the field
on the add/submit forms, and showing it on the chart. Makes the drummer's Click
correct for 3/4 and 6/8 songs.

### 3. Stage / performance mode
- ✅ **DONE** — a Stage button on the chart hides all chrome and scales the text
  up ~1.6x; floating exit; keeps screen awake; swipe still changes songs.
- ⏳ Still to do: **band-follows-leader** sync across devices (ties into live band
  sync). A key OnSong differentiator.

### 4. Team / band sync
- ✅ **v1 + v2 DONE & live** — owner creates a band, invites by email (accept/
  decline, not auto-join), roster with remove/cancel, publishes setlists that
  members play in place. (`teams.sql` + `teams_v2.sql`)
- ⏳ Later: live 2-way sync, member editing rights, a shared band *song library*
  (not just setlists), multi-band active switcher.
- Monetisation: free personal sync + **paid team sync** is the intended paywall
  (so we don't need to cap devices per account).

---

## Competitor gaps (from the Ultimate Guitar / OnSong comparison)

| Gap | Status |
|---|---|
| ChordPro / text import | ✅ **Done** |
| PDF import | Parked — needs pdf.js (~1 MB) + fragile layout extraction |
| Stage mode | Parked (see above) |
| Team libraries | Parked (see above) |
| Catalogue size | Ongoing — the real moat; why submissions matter |
| Annotations (highlight / notes on a chart) | Parked |
| Bluetooth foot-pedal page turns (AirTurn) | Parked |
| Print / export to PDF | Parked |
| Per-performance arrangement editor (reorder sections) | Parked |

**We already beat them on:** on-device key & BPM analyzer, first-class Nashville
numbers, and the Filipino worship focus.

---

## Platform & distribution

- **Installers (parked, user requested July 27):**
  - **PC .exe installer** — wrap the PWA in a desktop shell (e.g. Tauri or
    Electron/PWABuilder) to produce a Windows `.exe`.
  - **Android .apk installer** — **PWABuilder** wraps the existing PWA into a
    signed APK/AAB (one-time $25 Play fee). No rewrite needed.
  - **iPhone iOS installer** — needs a **$99/yr Apple Developer account** + a
    Mac; Apple scrutinises thin web wrappers.
  - Free today without any of the above: **Add to Home Screen** runs it
    standalone and kills the browser's back-swipe gesture.

---

## Cloud / accounts

- **Email notifications to submitters** — needs custom SMTP so mail comes from
  `noreply@chord.ph` (Resend + domain verification). Template already written:
  `supabase/email-magic-link.html`. In-app notifications ship already.
- **Google sign-in** — after email sign-in is proven.
- **Admin: re-tag library songs in-app** — today tags are set at submission or
  via the Supabase table editor.
- ✅ **Delete tombstones — DONE** (`state.deleted`), so deleting a setlist/song
  syncs the delete instead of the union-merge resurrecting it.

---

## Monetisation — three tiers (decided Jul 27)

Prices are placeholders (localised PH pricing TBD). Payment infra (Stripe /
local gateway) still to build.

### FREE — "Musician" (solo essentials — generous on purpose)
Library + search + tags; transpose, capo shapes, Nashville numbers, chord
diagrams; personal setlists + medleys; autoscroll + floating button; premium
metronome; stage mode; light/dark/colour-blind themes + font sizes; offline PWA;
**personal** cloud sync (your own devices); submit charts + voting; **Key & BPM
Analyzer** (MUST stay free — CC BY-NC-SA models can't be paywalled); Spotify link
(preview); share links; notifications.

### PRO — "Worship Team" (~₱99–149/mo or annual) — the band + practice tier
Everything in Free, plus: **band/team sync** (live setlists, shared band song
library, member editing, multi-band switcher); **ambient pads** + percussion
beds; **audio practice player** — import your own MP3 + **A/B repeat** + speed
control (see Spotify note); keep-awake; band roles. This is the paid-team-sync
anchor; one Supabase Pro ($25/mo) comfortably covers many teams.

### PREMIUM — "Studio / Pro" (~₱249–349/mo) — heavy AI + audio
Everything in Pro, plus: **chord & lyric detection from audio** (needs
commercially-licensed models — NOT the NC analyzer); **Spotify full playback +
control** (Web Playback SDK, needs Spotify Premium + OAuth); batch analysis + CSV
export; ID3 tag writing; energy rating; harmonic set planner.

**Constraints:** analyzer + its models stay FREE (non-commercial licence);
Premium chord-detection needs a *different*, commercially-licensed model.

### Spotify vs MP3 practice player (decided Jul 27)
The Spotify embed can't do full playback or A/B repeat on mobile (no seek/loop
control, can't use the app's Premium session). The clean answer is the user's
idea: an **`<audio>` player that plays the user's own MP3** (local import or a
URL) with **A/B loop markers + speed control** — full control, no licensing/SDK
needed (user supplies audio they own; we never host/distribute it). Ship this as
the real "learn a section" tool (Pro). Keep Spotify link as a convenience only;
its full-playback/SDK path stays a later Premium extra.

---

## Parked features (soon)

- **Legal & disclaimers** (user, Jul 27) — a legal/disclaimer section on the
  landing page footer AND a small disclaimer under the chord chart (e.g. chords
  are user-submitted, fair-use for worship/practice, not official transcriptions).
- **Social media links** (user, Jul 27, soon) — social icons/links (FB, IG, etc.)
  on the landing page (footer) and possibly in-app.
- **Personalised / account-synced landing page** (user, Jul 27) — the landing page
  becomes a signed-in surface tied to the account: greet by name (basic version
  already live — reads the app's cached Supabase session from localStorage), and
  later a real logged-in home (their bands, recent setlists, quick "continue"),
  fully synced with the app. Details TBD; think of it as a lightweight dashboard.
- **Facebook (and more) sign-in** (user, Jul 27) — add Facebook as an OAuth
  provider alongside Google (Supabase supports it; needs a Facebook app + config).
- **Reference "learn the song" links** (user, Jul 27) — per-song YouTube (and
  other) reference links shown on the chart page (near the Spotify player). Note:
  `song_versions.reference_url` already exists from the submission flow; surface it
  on the chart + let users add one.
- **Spotify — full playback + A/B repeat** (user, Jul 27) — play the WHOLE song
  in-app and loop a section (A/B markers) so learners don't drag the scrubber.
  ⚠️ NOT possible with the current embed iframe (no seek/loop control); needs the
  **Spotify Web Playback SDK + Premium + OAuth**. Premium feature.
- **Spotify link review/approval** (user, Jul 27) — adding a link works locally
  now; to attach it to the *global* library song it should go through super-admin
  review (like the edit-submit flow). Store proposed links on `submissions`.
- **Spotify per-medley switching** (user, Jul 27) — when a chart medleys song A→B,
  switch the player to B's track as you scroll in. Needs the SDK (auto-play/seek);
  today the chart shows the host song's link only.
- ✅ **Clean-up / de-dupe local library — DONE** (Settings → Backup → "Clean up
  duplicates"; remaps custom dups onto library/first-custom, rewrites refs).
- **Android APK** (user, Jul 27, HIGH — most PH musicians are Android) — package
  via PWABuilder. ✅ **In-app back button handling DONE** (history.pushState +
  popstate: back navigates views / closes overlays; root = press-back-twice to
  exit). ⏳ still to do: build/sign the actual APK; confirm hardware-back exit on a
  real device.
- **Nashville number trainer** — a practice/learn mode for the number system.
- **Chord detection from audio** — premium; heavy ML (audio → chords).
- ✅ **Premium metronome redesign — DONE** (tempo dial, Italian tempo name, ring
  pulse per beat, beat pips that follow the time signature, gradient Start/Stop).
- ✅ **Notification center — DONE** (drawer item + badge; list of pending invites,
  shared band setlists, reviewed submissions; red gear/hamburger dot). ⏳ optional
  EMAIL notifications still need custom SMTP (Resend).
- ✅ **Edit song from the setlist view** — DONE. Personal local override
  (`state.overrides`), "Reset to original", and "Submit to library" (prefills the
  Submit sheet, linked by `song_id`, for review — no duplicate custom).
- ✅ **Connect to Spotify (link play) — DONE** — paste a Spotify link per song →
  embedded player (no API/OAuth; uses the listener's own Spotify). ⏳ Still parked:
  **auto-detect** the practised song + in-app control (needs Premium + Web
  Playback SDK + OAuth).
- **Floating play/scroll button** — ✅ **DONE** (round autoscroll FAB on the chart).
- **Tap-tempo / BPM-linked auto-scroll** — scroll speed derived from the song's
  BPM (needs a words-per-beat calibration; BPM alone doesn't map to scroll rate).
- ✅ **Band invites v2** — DONE. Accept/decline instead of auto-join; roster
  (members + pending) under each band; admin remove-member / cancel-invite;
  duplicate-invite guard. Setlists already group per band ("Band setlists").
  Needs `supabase/teams_v2.sql` run once (invitee reads band name pre-join).
- ✅ **Settings categories — DONE** (collapsible Profile / Appearance / Account /
  Band / Backup sections).

## Appearance settings (parked)

A UI/appearance settings panel: **light / dark / auto theme**, **font family**
choice, base **text size**, maybe accent colour. The app is dark-only today and
text size is per-chart (A−/A+); this would make it app-wide and user-chosen.

---

## Smaller open questions

- **Capo scoping** — transpose is now per-setlist (library opens reset). Capo is
  still global per song. Decide whether capo should match.
- **Spotify Connect** — listen while practising. Needs Premium + OAuth; a
  YouTube embed is the cheaper first step.
