const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const app = read('app', 'index.html');
const shared = read('supabase', 'functions', '_shared', 'security.ts');
const cleanChart = read('supabase', 'functions', 'clean-chart', 'index.ts');
const findLinks = read('supabase', 'functions', 'find-links', 'index.ts');
const privacy = read('supabase', 'privacy_v2.sql');

test('public version UI requests only approved public columns', () => {
  assert.doesNotMatch(app, /from\('song_versions'\)\.select\('\*'\)/);
  assert.doesNotMatch(app, /v\.contributor_email/);
  assert.match(app, /contributor_name/);
});

test('privacy migration removes email from public selectable columns', () => {
  assert.match(privacy, /revoke select on table public\.song_versions from anon, authenticated/i);
  assert.match(privacy, /grant select \(id, song_id,[\s\S]*contributor_name\)/i);
  const grant = privacy.match(/grant select \(([\s\S]*?)\)\s+on table/i)?.[1] || '';
  assert.doesNotMatch(grant, /email/i);
});

test('AI endpoints authenticate and atomically consume server-side quota', () => {
  assert.match(shared, /\/auth\/v1\/user/);
  assert.match(shared, /rpc\/consume_ai_quota/);
  assert.doesNotMatch(shared, /Access-Control-Allow-Origin["']:\s*["']\*["']/);
  assert.match(cleanChart, /authorizeAndConsume\(req, "clean-chart", 20\)/);
  assert.match(findLinks, /authorizeAndConsume\(req, "find-links", 10\)/);
});

test('clean-chart uses supported sampling options and rejects chord changes', () => {
  assert.doesNotMatch(cleanChart, /temperature\s*:/);
  assert.match(cleanChart, /thinking:\s*\{ type: "disabled" \}/);
  assert.match(cleanChart, /chords_changed/);
  assert.match(cleanChart, /inputChords\.join/);
});

test('find-links deployment retains JWT verification and sanitizes query text', () => {
  assert.doesNotMatch(findLinks, /--no-verify-jwt/);
  assert.match(findLinks, /slice\(0, 200\)/);
  assert.match(findLinks, /method_not_allowed/);
});

test('client distinguishes quota, expired session, provider, and chord-safety errors', () => {
  assert.match(app, /function edgeErrorCode/);
  for (const code of ['daily_limit_reached', 'sign_in_required', 'service_unavailable', 'ai_failed', 'chords_changed']) {
    assert.ok(app.includes(`code === '${code}'`), `${code} should have client copy`);
  }
  assert.match(app, /Your original is safe/);
  assert.match(app, /AI changed a chord/);
});
