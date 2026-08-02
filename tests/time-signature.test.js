const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase', 'time_signature_v2.sql'), 'utf8');

test('time signature travels through editing, importing, display and click timing', () => {
  assert.match(app, /id="sh-song-timesig"/);
  assert.match(app, /timesig: document\.getElementById\('sh-song-timesig'\)/);
  assert.match(app, /timesig = p\.meta\.timesig \|\| '4\/4'/);
  assert.match(app, /esc\(song\.timesig \|\| '4\/4'\)/);
  assert.match(app, /function beatsForSong/);
  assert.match(app, /parseInt\(String\(ts\)\.split\('\/'\)\[0\]/);
});

test('time signature survives cloud, team and shared-song boundaries', () => {
  assert.match(app, /timesig: s\.timesig \|\| '4\/4'.*type: s\.type/s);
  assert.match(app, /team_songs'\)\.select\('id,team_id,title,artist,key,tempo,timesig/);
  assert.match(app, /function songSnapshot[\s\S]*timesig: s\.timesig \|\| '4\/4'/);
  assert.match(app, /function cloneSharedToCustom[\s\S]*timesig: s\.timesig \|\| '4\/4'/);
});

test('migration covers every persisted chart table', () => {
  for (const table of ['songs', 'submissions', 'song_versions', 'team_songs']) {
    assert.match(migration, new RegExp(`alter table public\\.${table}[\\s\\S]*?add column if not exists timesig`));
  }
});
