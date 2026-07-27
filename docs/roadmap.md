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
Big text, minimal chrome, and ideally **band-follows-leader** sync across
devices. A key OnSong differentiator.

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

- **APK / iOS packaging** — *to discuss.*
  - Free today: **Add to Home Screen** runs it standalone and kills the
    browser's back-swipe gesture.
  - Android: **PWABuilder** wraps the existing PWA into a signed APK/AAB
    (one-time $25 Play fee). No rewrite needed.
  - iOS: needs a **$99/yr Apple Developer account** + a Mac; Apple scrutinises
    thin web wrappers.

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

## Monetisation

- Paid tier anchored on **ambient pads** (above).
- Other paid ideas: batch analysis + CSV export, ID3 tag writing, energy
  rating, harmonic set planner.
- **Chord & lyric detection from audio** — heavy ML, future paid feature.
- Requires payment infrastructure (Stripe) and the NC-licence isolation noted
  above.

---

## Parked features (soon)

- **Nashville number trainer** — a practice/learn mode for the number system.
- **Chord detection from audio** — premium; heavy ML (audio → chords).
- **Premium metronome redesign** — the standalone Metronome view looks generic;
  make it feel premium (big animated beat/pendulum, nicer BPM dial, polished
  time-sig chips, tactile Start/Stop). Engine already works — this is visual.
- **Notification center** — full in-app list ("your chart was edited", "band
  setlist updated", invite accepted) + optional email (needs SMTP). The red
  gear/hamburger dot for pending band invites is the first piece, already live.
- ✅ **Edit song from the setlist view** — DONE. Personal local override
  (`state.overrides`), "Reset to original", and "Submit to library" (prefills the
  Submit sheet, linked by `song_id`, for review — no duplicate custom).
- **Connect to Spotify** — auto-detect the practised song and play in-app
  (Premium + Web Playback SDK), or play from a provided Spotify link.
- **Tap-tempo / BPM-linked auto-scroll** — scroll speed derived from the song's
  BPM (needs a words-per-beat calibration; BPM alone doesn't map to scroll rate).
- **Floating play/scroll button** — quick-access scroll toggle (bottom-right).
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
