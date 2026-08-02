const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'product_foundation_v2.sql'), 'utf8');
const architecture = fs.readFileSync(path.join(__dirname, '..', 'docs', 'v2-product-architecture.md'), 'utf8');

test('ministry foundation separates organizations, members, teams, and billing', () => {
  assert.match(sql, /create table if not exists public\.organizations/i);
  assert.match(sql, /create table if not exists public\.organization_members/i);
  assert.match(sql, /alter table public\.teams add column if not exists organization_id/i);
  assert.match(sql, /create table if not exists public\.subscriptions/i);
  assert.match(sql, /check \(\(user_id is not null\)::int \+ \(organization_id is not null\)::int = 1\)/i);
});

test('private tracks have no direct authenticated upload or metadata insert grant', () => {
  assert.match(sql, /values \('practice-tracks', 'practice-tracks', false\)/i);
  assert.doesNotMatch(sql, /storage\.objects for insert to authenticated/i);
  assert.match(sql, /revoke insert, update on public\.practice_tracks from anon, authenticated/i);
  assert.match(sql, /storage_path\s+text not null unique/i);
});

test('audio-to-chart is an asynchronous, review-first job', () => {
  assert.match(sql, /create table if not exists public\.audio_to_chart_jobs/i);
  assert.match(sql, /'queued','processing','needs_review','completed','failed','cancelled'/i);
  assert.match(sql, /revoke insert on public\.audio_to_chart_jobs from anon, authenticated/i);
  assert.match(architecture, /Always open generated work as a draft/i);
  assert.match(architecture, /Never publish directly to the community library/i);
});

test('paid authorization stays server-side and local charts remain resilient', () => {
  assert.match(architecture, /only the server may authorize paid work/i);
  assert.match(architecture, /payment provider webhook is the only writer/i);
  assert.match(architecture, /Local\/offline charts remain usable/i);
});
