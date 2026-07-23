# Chord.ph — roadmap & parked work

Everything discussed but not yet built. Kept here so nothing gets lost.
Last updated: 2026-07-24.

---

## Next up (committed)

### 1. Ambient pads & ambient percussion 🎹
Sustained atmospheric pads in the song's key that play under a set — the thing
worship teams currently pay Pad / Loop Community / Sunday Sounds for — plus
ambient percussion beds.

- **Planned as the anchor paid feature.**
- Build path A (first): **synthesised** pads via Web Audio — oscillators +
  filter + reverb, generated in the current key, auto-following the chart's key.
  Zero licensing, zero asset weight, works offline.
- Build path B (later): **sampled** pads for premium quality — needs licensed or
  self-produced audio, tens of MB of assets.
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

### 4. Team / band private libraries
A church-private library, separate from the public community one.

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
- **Delete tombstones** — the union-merge sync can resurrect a delete if the
  same account edits offline on two devices. Known limitation.

---

## Monetisation

- Paid tier anchored on **ambient pads** (above).
- Other paid ideas: batch analysis + CSV export, ID3 tag writing, energy
  rating, harmonic set planner.
- **Chord & lyric detection from audio** — heavy ML, future paid feature.
- Requires payment infrastructure (Stripe) and the NC-licence isolation noted
  above.

---

## Smaller open questions

- **Capo scoping** — transpose is now per-setlist (library opens reset). Capo is
  still global per song. Decide whether capo should match.
- **Spotify Connect** — listen while practising. Needs Premium + OAuth; a
  YouTube embed is the cheaper first step.
