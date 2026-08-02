# Chord.ph — roadmap & parked work

Everything discussed but not yet built. Kept here so nothing gets lost.
Last updated: 2026-08-02.

The implementation boundary for ministries, subscriptions, private practice-track storage, and MP3-to-chart is now documented in `docs/v2-product-architecture.md`; the staging-only schema is `supabase/product_foundation_v2.sql`.

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

### 4. Team / band sync — ✅ FULL SUITE DONE & live
- ✅ v1 + v2 — create band, invite (accept/decline), roster, publish setlists.
- ✅ **Live setlist updates** (Supabase realtime — `realtime.sql`).
- ✅ **Shared band song library** (`team_library.sql`).
- ✅ **Member editing rights** (`team_editing.sql` — admin grants editors).
- ✅ **Multi-band switcher** (focus one band's setlists + library).
- SQL to run: teams.sql, teams_v2.sql, realtime.sql, team_library.sql,
  team_editing.sql.
- ⏳ Later ideas: band-follows-leader stage sync; in-place editing of a band
  song's chart (today band songs are read-only in the chart; add/remove via the
  library manager).
- Monetisation: free personal sync + **paid team sync** (Pro) is the paywall.

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
control (see Spotify note); **private team practice-track storage** — a music
director uploads an MP3 once and assigns it to the team/setlist; keep-awake;
band roles. Cloud audio must have per-ministry storage quotas because its
subscription revenue pays for storage, bandwidth, backups and retention. This
is the paid-team-sync and rehearsal anchor.

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

### Practice workspace — product direction (agreed Aug 2)

The chart remains the main screen. “Separate playback from chart rendering” is
an internal component boundary, not a separate page: musicians still read the
chart while listening. Chart actions must never destroy or restart the player.
The expanded practice controls live inside the chart and can collapse to a
compact **Now playing** strip that keeps playback, elapsed time and play/pause
available without covering the music.

Build in this order:

1. **Persistent player** that survives transpose, Nashville numbers, lyrics
   mode, chord diagrams, text-size changes and editor actions.
2. **Waveform** with accurate scrubbing and visible A/B markers.
3. **Named loops**, such as “Bridge entrance” or “Chorus harmony”.
4. **Speed control without changing pitch**.
5. **Optional pitch/key shifting without changing speed**.
6. **Count-in before a loop restarts**.
7. **Chart-section bookmarks linked to audio positions**.
8. **Personal rehearsal notes and chart annotations**.
9. **Offline-downloadable setlist practice packs**, with explicit device-storage
   usage and removal controls.
10. **Team practice assignments**, such as “Learn Bridge by Friday”.
11. **Practice history** showing difficult or repeatedly looped sections.
12. **Foot-pedal/MIDI controls** for playback, loop markers and chart navigation.

**Team cloud workflow (paid):** a music director uploads a legally obtained
practice MP3 to a private ministry/team library, attaches it to a song or
setlist, optionally adds named loops/bookmarks and assigns it to members. Team
members stream it with short-lived authorization or download an encrypted/offline
practice copy where supported. Access ends when membership is removed. The plan
needs storage and monthly transfer allowances, visible usage meters, automatic
orphan cleanup, retention controls and an upgrade path instead of unlimited
storage. Raw audio is never public and never embedded in shared chart JSON.

Spotify and YouTube remain useful reference sources, but provider/browser rules
make them less dependable for background playback and precise looping. The
native local or private-cloud practice track is the reliable rehearsal source.

---

## Queued next (agreed July 28)

- ✅ **Stage-view floating controls — DONE** (☰ toggle above the speed dial reveals
  a vertical Transpose/Numbers/Chords/Lyrics/Text column; Numbers/Chords/Lyrics
  toggle+highlight, Transpose/Text slide options out horizontally; lyrics shift).
- ✅ **Landing nav restructure — DONE** (full menu = footer set; Open app + Hi/Login
  folded in; standalone button removed).
- **Payments / tiers — architecture (decided)**: **ONE app, not three.** Tier is a
  property of the account (a `subscription_tier` col / `subscriptions` table in
  Supabase); the app reads it and unlocks features. Sell upgrades **on the web**
  (chord.ph) via a **PH-friendly gateway (PayMongo → GCash/Maya/cards)** to avoid
  Google Play's 15–30% cut and serve local payment methods; the account carries the
  tier into the web app AND the APK. Publish the **APK to Play Store for reach**,
  but keep upgrades web-based (mind Play's billing/anti-steering policy — if we ever
  sell inside the Android app we'd need Google Play Billing). Do this LATER — user
  prefers building AI key-detection + AI chord-chart first.
- **Community credits — earning ideas** (user, Jul 28) — earn credits → redeem for
  free Pro time, to grow an active contributing community. Earn by: submitting an
  approved chart/tab; **adding a verified reference link (YouTube/Spotify) to a
  song**; your version getting upvotes (ongoing); fixing/improving an approved
  chart; correct tagging; referrals (invite a musician who joins); optional light
  streak/engagement bonus. Anti-abuse: credits only from **approved/vote-gated**
  contributions, daily caps, quality thresholds. Needs a credits ledger + redemption
  rule (e.g. X credits = 1 month Pro).

## AI features — architecture + candidates (starting July 28)

**How AI works in this app:** the app is a static PWA + Supabase. AI features run
through **Supabase Edge Functions** (serverless) that hold the API keys server-side
and call external services; the app just calls the Edge Function (works for web +
APK). User must provision keys / deploy functions. Costs vary by service.

Candidate features (rough feasibility):
- **Auto-find Spotify / YouTube links** (user, Jul 28) — when a song has no link,
  search by title + artist and fill them in. EASIEST + free: YouTube Data API +
  Spotify Web API search (free quotas) via an Edge Function; optional LLM to pick
  the best match. Good first AI feature (validates the pipeline). ⚠️ don't
  auto-write to the shared library without review — fill for the user, or gate
  cloud links behind admin approval.
- **AI chord-chart builder** — two very different things: (a) **messy text → clean
  chart** (LLM formats pasted lyrics/chords into sections + chord-over-lyric) =
  achievable via LLM Edge Function; (b) **audio → chords** (detect chords from an
  MP3) = HARD, needs a chord-recognition model / paid service (Klang.io, Music.ai,
  etc.) — the real "self-building chart from audio". Clarify which.
- **AI key/BPM** — the analyzer already does on-device key+BPM (free, Essentia).
  "AI key detection" could mean surfacing it inside the chord app, or a metadata
  lookup from a link. Cheap if metadata; already solved if on-device.
- **AI chord + lyric mapping from audio** (Premium) — the full audio→chart+lyrics
  pipeline; heaviest, paid model, later.

## Parked features (soon)

- **Android file picker opens a chooser, not Files** (user, Jul 28) — on Android,
  the analyzer + MP3-player file inputs show an intent chooser (voice recorder /
  photos). This is Android's OS picker driven by the `accept` MIME type; a web
  page can't force "Files only". Investigate: extension-only `accept`, or a custom
  "how to pick" hint. For now users tap Files/Browse in the chooser.
- **Analyzer: listen history + per-item clear** (user, Jul 28) — the Key & BPM
  Analyzer keeps a history of analysed songs; let users clear ONE entry or all
  (not just clear-all). Lives in the /analyzer app ([[key-bpm-detector-app]]).
- **AI chord + lyric mapping from uploaded audio** (user, Jul 28) — Premium:
  upload an MP3 → AI detects song structure + maps chords & lyrics automatically
  (audio→chart). Heavy ML; needs a commercially-licensed model (NOT the NC
  analyzer). Sits with Premium chord-detection.
- **AI note/tab transcriber** (user, Jul 28) — real-time transcription mapping,
  incl. guitar tab, AI-powered. A big adjacent product; possibly its own app.
- **Geo-based pricing** (user, Jul 28) — different price per country for a
  worldwide launch (Stripe/local gateways support region pricing + PPP tiers).
- **Translation / i18n** (user, Jul 28) — multi-language UI (start with the PH
  languages + English). Needs a string-extraction pass + locale files.
- **About Us** section on the landing page (user, Jul 28) — pair with legal +
  social links.
- **Ads — LANDING PAGE ONLY** (user, Jul 28, DECIDED) — the user is open to ads
  on the **landing page only**; the **app stays 100% ad-free** (no ads in the
  chart/library/stage — ever). Revenue mainly from the Pro/Premium tiers; landing
  ads are a secondary lane. Implement later with the payments/marketing round.
- **Contribution credits → free Pro** (user, Jul 28) — reward users who submit
  high-quality tabs/charts (via the existing thumbs-up voting): earn credits/points
  that unlock Pro-tier time for free. Gamifies the community library; needs a
  credits ledger + a rule for "high quality" (votes/approvals) + redemption.
- **Landing → social / marketplace (big vision)** (user, Jul 28) — the landing
  page evolves into a social surface: users post performances/videos; later a
  marketplace for second-hand instruments and new pro audio gear. Major separate
  build (feeds, uploads, listings, payments/escrow, moderation). Park as a
  long-term direction, not near-term.
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
