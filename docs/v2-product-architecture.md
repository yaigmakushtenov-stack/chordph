# Chord.ph v2 product architecture

This is the implementation boundary for subscriptions, ministries, cloud practice tracks, and MP3-to-chart. It prevents paid audio work and private files from leaking into the current local-storage sync model.

## Product model

- A personal musician remains the simplest free account.
- A team remains a playable band unit with its own songs and setlists.
- A ministry is an organization above teams. It owns billing, admins, storage allowance, and one or more teams.
- A subscription belongs to exactly one person or one ministry. The client may display entitlements, but only the server may authorize paid work.
- Existing personal and team features continue working when no organization exists.

Recommended roles:

| Scope | Role | Abilities |
|---|---|---|
| Ministry | Owner | Billing, admins, all teams, deletion |
| Ministry | Admin | Members, teams, shared tracks; no ownership transfer |
| Ministry | Member | Read ministry resources assigned to their teams |
| Team | Owner | Current team owner behavior |
| Team | Editor | Current `can_edit` behavior |
| Team | Member | Read and perform |

Do not overload “admin”: platform-library admins, ministry admins, and team editors are separate authorities.

## Subscriptions and entitlements

Keep one app. Resolve a signed-in account to an entitlement object such as:

```json
{
  "tier": "premium",
  "source": "organization",
  "organization_id": "...",
  "features": ["team_sync", "cloud_tracks", "audio_to_chart"],
  "limits": { "storage_bytes": 10737418240, "audio_minutes_monthly": 300 }
}
```

The payment provider webhook is the only writer of subscription state. Verify its signature, make events idempotent, preserve the raw provider event ID, and never unlock a feature from a success redirect in the browser. A server function must re-check entitlement before issuing an upload URL or creating an AI job.

Start with three capability groups rather than scattering tier-name checks through the UI:

- Free: charts, personal setlists, transpose/capo/Nashville, offline and analyzer.
- Pro: team sync, ministry workspace, cloud practice tracks, pads/percussion.
- Premium: MP3-to-chart and other metered AI/audio processing.

Pricing and gateway selection are intentionally outside the schema. They require a product decision and a current review of Philippine and app-store payment rules.

## Private practice-track storage

Local MP3 practice continues to work offline. Cloud storage is an optional Pro feature.

Upload flow:

1. Client asks a server function for authorization and quota.
2. Function checks membership, subscription, file size/type, and remaining bytes.
3. Client uploads into the private `practice-tracks` bucket under its user-ID folder.
4. Client creates the matching metadata row. Failed uploads and orphaned objects are cleaned by a scheduled job.
5. Playback uses short-lived signed URLs; no bucket is public.

Never put audio bytes, permanent public URLs, or provider keys in `user_data`, shared setlist JSON, or a chart. Default retention should be user-controlled for practice tracks and short (for example seven days) for raw AI uploads unless the user explicitly keeps the track.

## MP3-to-chart pipeline

Treat this as a job system, not a long-running browser request:

```text
private upload -> entitlement/quota check -> queued job -> provider worker
 -> normalized draft -> musician review -> save as personal chart
 -> optional community submission through existing human review
```

Required behaviors:

- Accept only supported audio MIME types and validate actual file signatures server-side.
- Store provider job IDs only on the server-facing job row.
- Normalize output into sections, timed chord events, detected key/BPM, confidence, and optional lyric timings.
- Always open generated work as a draft. Never publish directly to the community library.
- Highlight low-confidence chords and let the musician audition/correct them.
- Charge quota when processing starts, then credit back automatically for provider failures.
- Make webhook processing idempotent and reject unsigned callbacks.
- Delete raw provider artifacts according to a documented retention policy.
- Use a commercially licensed recognition provider/model; do not reuse the analyzer's non-commercial models for a paid tier.

Suggested `result_draft` shape:

```json
{
  "version": 1,
  "key": "G",
  "tempo": 72,
  "sections": [{
    "label": "Verse 1",
    "lines": [{ "lyrics": "...", "chords": [{ "at": 0, "name": "G", "confidence": 0.93 }] }]
  }],
  "warnings": ["lyrics_unavailable"]
}
```

## Release sequence

1. Run current regression tests and stage the privacy/PWA migrations.
2. Apply `privacy_v2.sql`, then deploy the authenticated AI functions and `ai_security.sql`.
3. Apply `product_foundation_v2.sql` in a staging Supabase project and test every role with separate accounts.
4. Build ministry admin screens without billing first.
5. Add private cloud-track upload/play/delete plus quota and orphan cleanup.
6. Integrate a payment provider in sandbox mode and expose server-resolved entitlements.
7. Integrate one audio-recognition provider behind an adapter and run a closed musician beta.
8. Add usage/cost dashboards, alerts, retention jobs, audit logs, backup/restore tests, and incident procedures before public launch.

## Non-negotiable launch checks

- No API key or service-role key in browser code, storage, logs, or shared JSON.
- No contributor email in public queries.
- AI functions reject signed-out, over-quota, wrong-origin, and wrong-method requests.
- Storage access is tested for owner, ministry member, outsider, removed member, and cancelled subscription.
- Paid entitlement remains correct after refunds, failed renewals, cancellation, webhook replay, and delayed webhook delivery.
- Generated charts cannot bypass musician review or the existing community approval process.
- Local/offline charts remain usable when Supabase, payments, or the AI provider is unavailable.
