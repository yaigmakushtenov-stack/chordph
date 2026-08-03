const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'beta_access_v2.sql'), 'utf8');
const middleware = fs.readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8');
const session = fs.readFileSync(path.join(__dirname, '..', 'api', 'beta', 'session.ts'), 'utf8');
const gate = fs.readFileSync(path.join(__dirname, '..', 'beta', 'index.html'), 'utf8');

test('beta invitation codes are hashed and raw codes are returned only by creation', () => {
  assert.match(sql, /code_hash\s+text not null unique/i);
  assert.match(sql, /digest\(lower\(v_code\), 'sha256'\)/i);
  assert.doesNotMatch(sql, /invite_code\s+text[^)]*not null/i);
});

test('beta invite creation is admin-only with bounded expiry and usage', () => {
  assert.match(sql, /create or replace function public\.create_beta_invite/i);
  assert.match(sql, /if not public\.is_admin\(\)/i);
  assert.match(sql, /p_max_uses < 1 or p_max_uses > 100/i);
  assert.match(sql, /p_expires_in_hours < 1 or p_expires_in_hours > 2160/i);
});

test('redemption requires authentication and enforces expiry, usage, and email binding', () => {
  assert.match(sql, /if auth\.uid\(\) is null/i);
  assert.match(sql, /v_invite\.expires_at <= now\(\)/i);
  assert.match(sql, /v_invite\.use_count >= v_invite\.max_uses/i);
  assert.match(sql, /invite_email_mismatch/i);
  assert.match(sql, /for update/i);
});

test('owner access is recoverable and direct table mutation is denied', () => {
  assert.match(sql, /select coalesce\(public\.is_admin\(\), false\)/i);
  assert.match(sql, /revoke all on public\.beta_invites from anon, authenticated/i);
  assert.match(sql, /revoke all on public\.beta_access from anon, authenticated/i);
  assert.match(sql, /owner_self_revoke_blocked/i);
});

test('routing middleware protects the full site with a signed expiring cookie', () => {
  assert.match(middleware, /BETA_COOKIE_SECRET/);
  assert.match(middleware, /crypto\.subtle\.sign\('HMAC'/);
  assert.match(middleware, /Number\(expires\).*Date\.now/);
  assert.match(middleware, /Response\.redirect\(gate, 307\)/);
  assert.doesNotMatch(middleware, /BETA_COOKIE_SECRET\s*=\s*['"][^'"]+['"]/);
});

test('gate session revalidates Supabase identity and database access server-side', () => {
  assert.match(session, /\/auth\/v1\/user/);
  assert.match(session, /\/rest\/v1\/rpc\/has_beta_access/);
  assert.match(session, /HttpOnly; Secure; SameSite=Lax/);
  assert.match(session, /COOKIE_LIFETIME_SECONDS = 24 \* 60 \* 60/);
});

test('phone invitation manager creates, shares, lists, and revokes invites', () => {
  assert.match(gate, /create_beta_invite/);
  assert.match(gate, /navigator\.share/);
  assert.match(gate, /beta_invites/);
  assert.match(gate, /revoke_beta_invite/);
  assert.match(gate, /Codes are displayed only once/);
});
