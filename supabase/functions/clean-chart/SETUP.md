# Turn on "Clean up chart" (AI formatter)

This lets Chord.ph reformat messy pasted song text into a tidy chord chart.
It reformats only — it never changes your chords or lyrics. ~5 minutes, do it on a computer.

## Part 1 — 1 key from Anthropic (Claude)
1. Open **console.anthropic.com** and log in (or sign up).
2. Go to **API Keys** → **Create Key**. Name it `Chord.ph`. Copy the key (starts with `sk-ant-`). Keep it safe — it's a password.
3. Add a little credit under **Billing** if the account has none (usage is a fraction of a cent per clean-up).

## Part 2 — Add the function to Supabase
4. Open **supabase.com/dashboard** → your Chord.ph project → **Edge Functions**.
5. Click **Deploy a new function** (via editor). Name it **exactly** `clean-chart`.
6. Delete any sample code, paste the contents of `index.ts` (in this folder), then **Deploy**.

## Part 3 — Paste the key (Secret)
7. In **Edge Functions → Secrets**, add one secret, name **exactly**:
   - `ANTHROPIC_API_KEY` → your `sk-ant-...` key
   Save.

## Part 4 — Test
8. In the app, sign in, open **Add song** (or edit a song), paste some messy chord/lyric text into the chart box, and tap **✨ Clean up chart**. A tidied version appears. Tap **↶ Undo clean** to get your original back.

**If the button says "not set up yet":** the function name must be exactly `clean-chart` and the secret must be named exactly `ANTHROPIC_API_KEY`.

Cost: each clean-up is a small Claude request (typically well under a cent). The model is set to `claude-sonnet-5` in `index.ts` — you can switch it to a cheaper model there later if you want.
