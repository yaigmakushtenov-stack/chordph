# Chord.ph shipped work

Completed roadmap entries are archived here. This is a product history, not an
active backlog. Move an entry here only after implementation and proportionate
verification; if a regression is found, create a specific bug in the active
roadmap rather than moving the whole feature back.

Last reorganized: 2026-08-03.

## Chart and performance

- Synthesized ambient pad with persistent playback.
- Generated ambient percussion beds: Gentle, Pulse and Build.
- Per-chart time signatures across editor, imports, submissions and team data.
- Stage mode with hidden chrome, larger text, keep-awake and swipe navigation.
- Stage-view floating controls for transpose, Nashville, chords, lyrics and text.
- ChordPro/text import.
- Premium metronome redesign.
- Floating chart autoscroll button.
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

- Completed code still requires regression testing in the V2 preview before
  production. A failed verification creates a focused stabilization bug in the
  active roadmap; it does not erase the feature's implementation history.
- Ambient percussion is shipped but currently parked from further investment at
  the owner's request while practice and team workflows are prioritized.
