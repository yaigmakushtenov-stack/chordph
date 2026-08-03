# Chord.ph active roadmap

This roadmap is ordered by delivery sequence, not by feature category. The
immediate objective is to make V2 genuinely useful as a rehearsal tool within the
next few days, put it in the owner's hands, and use real practice sessions to
decide what deserves deeper investment.

Completed work belongs in `docs/completed/shipped-roadmap.md`. Technical
boundaries for ministries, subscriptions, private practice tracks and
audio-to-chart are in `docs/v2-product-architecture.md`.

Last reorganized: 2026-08-03.

---

## The near-term product outcome

A musician should be able to:

1. Open the team's lineup or a personal setlist.
2. Open the correct chart and reference recording.
3. Attach a personal local audio file when precise practice tools are needed.
4. Transpose, use Nashville, change instrument view or edit the chart without
   interrupting native practice playback.
5. Scrub accurately, slow the recording, shift its key, loop a difficult passage
   and use a count-in.
6. Link an audio position to a chart section and leave a rehearsal note.
7. Return later without losing the useful practice state.
8. Tell the director whether the assigned material is ready or needs help.

Anything that does not materially support this journey is deferred until the
practice preview is being tested.

## Sprint A - stabilize and publish the owner-only practice preview

Do these first because new practice features are not useful if the chart or
player behaves unpredictably.

- Fix Lyrics-only recognition for the reported `Sa atin na tunay` line in
  `Pusong Basag`, then add a regression case for chord-like lyric text.
- Test Spotify/YouTube behavior separately and show honest provider limitations;
  do not make the chart lifecycle recreate an embed unnecessarily.
- Verify tab/background behavior. Preserve native audio where the browser permits
  it; do not promise uninterrupted third-party embedded playback when the
  provider/browser suspends it.
- Test Google login and browser/hardware Back on a real Android device, including
  the previous return-to-Google-account-picker bug.
- Review the mobile action toolbar and tag row on real phones. Preserve the useful
  partial-item discovery cue, but add an edge fade or brief first-use motion and
  accessible helper text where the row still looks accidentally clipped.
- Regression-test the already-live Auto-find Spotify/YouTube feature against
  difficult titles, alternate versions and sparse artist data. Suggestions must
  remain reviewable and must never silently update the public library.
- Test the current practice journey on real Android and desktop devices, including
  offline installation, refresh/update behavior and storage recovery.
- Record preview issues as specific bugs and fix release blockers without taking
  the preview away from the owner.
- Move the Rehearsal workspace into its own focused home view instead of placing
  it above the song library. Songs should remain a clean, searchable catalogue.
- Redesign the synthesized ambient pad so it is warmer and less robotic or harsh.
  This is explicitly parked until the practice-player regressions are stable.

### Sprint A exit check

A ten-minute practice session on the live preview must survive repeated chart
controls, app navigation, phone locking/backgrounding where supported, and
returning to the song without losing the local track, position, loop, speed or
pitch setting.

## Sprint B - complete the personal rehearsal loop

Build in this order:

1. **Chart-section bookmarks linked to audio positions.** A musician can save the
   current playback time against Verse, Chorus, Bridge or a custom section, then
   jump in either direction between the chart and audio.
2. **Personal rehearsal notes and lightweight annotations.** Start with text notes
   attached to a song or section. Defer freehand drawing and complex markup until
   real usage proves it is needed.
3. **Expanded editor workspace.** Make the chart body near-full-screen and allow
   title, artist, key, BPM and feel to collapse after initial setup.
4. **Practice-state restoration audit.** Confirm bookmarks, notes, named loops,
   count-in, speed, pitch and last position restore predictably per song.

Provider links remain convenient reference recordings. Accurate waveform,
scrubbing, looping, speed and pitch processing use a personal file stored on the
device. The product must never instruct members to find or download an MP3.

### Sprint B exit check

The owner can rehearse one complete Sunday lineup using Chord.ph as the primary
practice screen without needing a separate notes app or repeatedly finding the
same sections in the recording.

## Sprint C - add the smallest useful team-practice layer to the preview

Use the already-shipped team, setlist and notification foundations. Avoid building
the full Ministry Hub before the rehearsal loop is validated.

- Treat a published team setlist as the upcoming lineup.
- Show chart readiness and whether each song has a Spotify/YouTube reference.
- Allow the director to assign a song or named section to a member with an
  optional due date.
- Give members four clear states: Not started, Practicing, Ready and Need help.
- Show the director a compact readiness summary for the lineup.
- Send focused in-app notifications for an assignment, changed arrangement,
  mention or approaching due date.
- Improve musician onboarding only as much as assignments require: display name,
  primary instrument/role and optional secondary instruments or vocal part.
- Keep discussion attached to a song, section or assignment. Do not build an
  unrestricted general-purpose chat system in this sprint.

### Sprint C exit check

A director can publish Sunday's lineup, attach reference links, assign the Bridge
to a musician and see whether the musician is Ready or Needs help.

---

## After the practice preview - deepen rehearsal value

Order these using evidence from the owner's preview sessions:

1. Offline-downloadable setlist practice packs with visible device-storage use
   and removal controls.
2. Practice history showing repeatedly looped or difficult sections.
3. Foot-pedal/MIDI controls for playback, loop markers and chart navigation.
4. Per-performance arrangement editor for reordering or omitting sections.
5. Better medley building: explicit song order and transition points, per-song
   key, tempo/time-signature zones, rehearsal navigation and stage transitions.
6. Decide whether capo should be scoped per setlist/performance like transpose.
7. Print and PDF export.
8. PDF import, with clear warnings about imperfect layout extraction.
9. BPM-linked autoscroll using arrangement calibration rather than BPM alone.
10. Band-follows-leader stage synchronization across devices.

## Full Team Hub and ministry workspace

Build after the small assignment/readiness layer proves valuable:

- Ministry home with the next service, lineup readiness and recent changes.
- Multiple teams under one ministry, with distinct owner, admin, editor and member
  permissions.
- Roster-aware assignments, availability and director views of incomplete work.
- Shared arrangement notes, acknowledgements and focused comments/mentions.
- Improved musician profiles: primary role, secondary instruments, vocal
  range/part and availability.
- Optional in-app recording of the band's own rehearsal take.
- Authorized team audio with short-lived access, quotas, usage meters, retention,
  deletion, orphan cleanup and membership revocation.
- In-place team-library chart editing with permission checks and history.
- Band-follows-leader performance controls.

Subscription direction: one ministry/team subscription pays for administration,
storage and paid capabilities. Invited members can view the hub, lineup, tasks and
reference links without each purchasing Premium. Individual Pro remains optional.

## Library, catalogue and community

- Continue human musical review for suspected public-library duplicates. Keep
  automatic deduplication limited to each user's local library.
- Grow and curate the catalogue; library quality remains a core moat.
- Admin tools for retagging public-library songs.
- Reference-link proposals through the existing review flow.
- Harden Auto-find links with match confidence and alternate-version handling.
- Community credits for approved charts, verified links, accepted corrections,
  useful tagging, upvotes and qualified referrals.
- Add review gates, caps, quality thresholds and a credit ledger before credits
  can be exchanged for Pro time.

## AI and advanced music tools

- Deploy the already-built Clean up chart Edge Function when it is ready, without
  making it a blocker for the practice preview. Verify Undo, chord preservation,
  failure states, usage limits and provider-cost handling.
- Harden Clean up chart with evaluation fixtures, cost monitoring and safeguards
  against changing correct chords.
- Surface the existing on-device key/BPM analyzer inside the chord workflow where
  it removes duplicate data entry; do not relabel existing analysis as a new paid
  AI capability.
- Audio-to-chart using a commercially licensed provider/model: chords, lyrics and
  structure open as an editable draft, never directly into the public library.
- Highlight low-confidence AI output and require musician review.
- Note and guitar-tab transcription as a later adjacent product.
- Batch analysis and CSV export.
- Optional studio tools: ID3 tag writing, arrangement energy rating and harmonic
  set planning. Validate musician demand before implementation.
- Nashville Number System trainer.
- Analyzer history with per-item deletion.

The existing analyzer's Essentia/MTG models are non-commercial and remain outside
paid features. Paid recognition needs a separate commercially licensed model.

## Accounts, payments and distribution

- Keep one app. Resolve server-authorized capabilities from the account or
  ministry subscription instead of creating separate applications.
- Select PH-friendly web payments supporting GCash, Maya and cards after a current
  review of gateway and app-store rules.
- Add signed payment webhooks, entitlements, refunds/cancellations and metered
  storage/processing quotas.
- Build/sign the Android APK/AAB and test hardware Back and audio file selection.
- Improve Android file-picker guidance; a web app cannot force the OS to open only
  the Files application.
- Windows installer later; evaluate iOS packaging after the web/PWA product is
  established.
- Custom SMTP/email notifications from the Chord.ph domain.
- Additional login providers after the main authentication flow is stable.
- Geographic pricing and internationalized UI.

## Landing page and signed-in home

- Refine the message around one shared, transposable, stage-ready rehearsal
  workflow rather than a long feature inventory.
- Explain the progression from solo musician to paid ministry workspace.
- Add a lightweight signed-in dashboard with the next lineup, recent setlists,
  team updates and Continue practicing.
- Keep the chart/library/stage application completely ad-free. Landing-page ads
  may be evaluated later as secondary revenue.
- Long-term performance posts and an instrument/pro-audio marketplace are separate
  products requiring moderation, payments and marketplace safeguards.

## Later experiments

- Sampled premium pads using licensed or self-produced audio.
- Make pads follow each medley section's key.
- Spotify Web Playback SDK exploration, subject to Spotify account, API,
  commercial-use and playback-policy requirements.
- Spotify per-medley switching if provider controls permit it.
- App-wide appearance settings: light/dark/auto, font, base size and accent.
- Broader public social/community surfaces only after the practice and team
  product is established.

## Product tier direction - not final pricing

- **Free musician:** charts, search, transpose, capo, Nashville, diagrams,
  personal setlists/medleys, stage mode, offline PWA, analyzer and reference links.
- **Team/Pro:** Team Hub, assignments, shared arrangements, ministry
  administration, authorized cloud rehearsal audio, quotas and synchronization.
- **Premium/Studio:** metered commercially licensed audio-to-chart and advanced
  audio workflows.

Cloud storage and AI processing must never be sold as unmetered unlimited
resources. Exact prices and boundaries are decided after practice usage is clear.

---

## Final commercial-release gates

These are intentionally placed after the product shape is stable so policies and
reviews describe what Chord.ph actually does. They block commercial release, not
the owner-only practice preview.

### Intellectual property and audio

- Obtain advice from a Philippine intellectual-property lawyer about chord-chart
  publication, user-supplied audio, team sharing, licensing, platform liability
  and takedowns.
- Document which audio may remain local, which may be uploaded, who may access it
  and how authorization is recorded.
- An "I have permission" checkbox is supporting evidence, not complete legal
  protection.
- Spotify/YouTube remain the default shared references. Do not enable commercial
  team cloud-audio storage until the upload policy passes review.

### Terms, privacy and operations

- Replace the initial plain-language copy with reviewed Terms, Privacy, upload,
  retention, deletion and takedown policies.
- Test authorization for owners, members, outsiders, removed members and cancelled
  subscriptions.
- Verify no API/service key, contributor email, private audio URL or sensitive
  provider response leaks into browser code, logs or shared chart/setlist data.
- Test refunds, failed renewals, cancellation, webhook replay, quota exhaustion,
  provider failure and deletion/restore procedures.
- Confirm local/offline charts remain usable when Supabase, payments or AI
  providers are unavailable.
- Complete production backup, monitoring, cost alerts and incident procedures.

Only after these checks pass should the preview be considered for a public paid
launch.
