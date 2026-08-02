# V2 preview deployment

The v2 branch is designed to be published as a separate Vercel project before anything changes on `chord.ph`.

## Safety boundary

- Deploy the `v2-stabilization` branch to a new project such as `chordph-v2`.
- Do not attach the `chord.ph` domain to this project.
- Vercel preview hosts display a visible **V2 preview** banner.
- Sign-in, cloud writes, cloud sync, contribution actions, and paid AI are disabled on preview hosts.
- The public library remains readable from the current Supabase project so realistic charts can be tested.
- Personal test songs, setlists, preferences, links, and practice files remain in that browser's local device storage.

This prevents a preview tester from changing production accounts or community data. A separate staging Supabase project can be connected later when team, billing, upload, and AI workflows need end-to-end testing.

## Vercel project settings

1. Create a new Vercel project from the repository.
2. Set the production branch for that project to `v2-stabilization`.
3. Leave Framework Preset as **Other** and leave Build Command empty.
4. Use `.` as the output directory because this is a static site.
5. Do not add secret or service-role keys. The app only contains the existing browser-safe publishable key.
6. Deploy, then test both `/` and `/app/` on the generated `vercel.app` address.

## Before enabling cloud workflows

Create a separate Supabase staging project, apply the v2 migrations, deploy the Edge Functions to staging, set restrictive storage policies and quotas, and add the preview address to Supabase Auth redirect URLs. Only then should preview-mode cloud blocking be replaced with staging credentials.
