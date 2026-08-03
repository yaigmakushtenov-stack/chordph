# Chord.ph shipped work

Completed roadmap entries are archived here. This is a product history, not an
active backlog. Move an entry here only after implementation and proportionate
verification; if a regression is found, create a specific bug in the active
roadmap rather than moving the whole feature back.

Last reorganized: 2026-08-03.

## Private-beta access

- Server-enforced invitation-only gate across the production domain.
- Hashed, email-bound invitation codes with expiry, usage limits and revocation.
- Phone-friendly administrator invitation manager with Copy and Share.
- Platform-owner recovery bypass, expiring access cookie, `noindex` and retired
  public PWA caches.

## Chart and performance

- Synthesized ambient pad with persistent playback.
- Generated ambient percussion beds: Gentle, Pulse and Build.
- Per-chart time signatures across editor, imports, submissions and team data.
- Stage mode with hidden chrome, larger text, keep-awake and swipe navigation.
- Stage-view floating controls for transpose, Nashville, chords, lyrics and text.
- ChordPro/text import.
- Premium metronome redesign.
- Floating chart autoscroll button.
- Function dock no longer duplicates the chart-integrated autoscroll control.
- Stage mode collapses Listen & Learn and configuration panels while retaining
  the compact performance-critical Now Playing strip.
- Original slim keyboard chord diagrams and focused guitar/keyboard chord popup.
- Medley entry restored to the chart controls and made discoverable outside an
  existing setlist; new setlists open immediately after creation.
- Edit a song from a setlist using a personal override, reset and library-submit
  flow.

## Team and synchronization

- Create bands and invite members with accept/decline.
- Roster and pending-invitation management.
- Admin remove-member and cancel-invite controls.
- Live Supabase setlist updates.
- Shared band song library.
- Member editing permissions.
- Multi-band switcher.
- Band setlists grouped by band.
- Delete tombstones preventing synchronized items from being resurrected.
- Notification center for invites, shared setlists and reviewed submissions.

## Practice workspace

- Persistent native-audio player that survives chart controls, editor actions and
  app navigation, with compact Now Playing controls and per-song state.
- Decoded waveform, touch/keyboard scrubbing, progress and visible A/B markers.
- Multiple saved and named A/B loops per song.
- Playback speed control with pitch preservation.
- Optional audio pitch/key shifting without changing playback speed.
- Optional one-bar count-in before loop restart.
- Per-song Spotify link and embedded reference playback.
- Unified collapsible Listen & Learn panel for Spotify, YouTube and personal local
  audio, with a visible source count.
- Spotify expectation copy and an Open in Spotify path.
- Auto-find Spotify/YouTube reference links through the configured Supabase Edge
  Function and provider APIs. Suggestions remain user-reviewed.
- Auto-find refreshes immediately when either provider link is added or removed.
- Practice-track replacement clears stale loop/count-in state, uses the uploaded
  filename, and exposes play/pause, ten-second seek, restart and stop controls.
- Waveform analysis provides a best-effort automatic BPM for tempo-aware count-in.

## Library, navigation and settings

- Local-library duplicate cleanup with reference remapping.
- In-app Back handling for views and overlays.
- OAuth callback cleanup and post-Google-login Back isolation.
- Google sign-in UI and Supabase authentication flow.
- Settings categories for Profile, Appearance, Account, Band and Backup.
- Landing navigation restructure.

## Landing page

- About Chord.ph section.
- Initial plain-language Terms & Privacy and copyright/takedown copy. Formal
  commercial legal review remains an active release gate.
- Chord-chart community-contribution disclaimer.
- Facebook, Instagram and TikTok links using the owner's real profiles.
- Working contact form connected to Supabase.

## Community

- Chart submission, administrator review, approved versions and thumbs-up voting.

## Notes

- V2 is deployed to the invitation-only production site. Real-device failures
  create focused stabilization bugs in the active roadmap; they do not erase the
  feature's implementation history.
- Ambient percussion is shipped but currently parked from further investment at
  the owner's request while practice and team workflows are prioritized.
