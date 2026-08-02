const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('library transpose working values are not written to local storage', () => {
  assert.doesNotMatch(app, /localStorage\.setItem\(['"]chordph2_transpose/);
  assert.match(app, /localStorage\.removeItem\(['"]chordph2_transpose/);
});

test('cloud and backup snapshots do not persist the session transpose map', () => {
  const localSnapshot = app.match(/function localSnapshot\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  const exportBackup = app.match(/function exportBackup\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(localSnapshot, /transpose:\s*state\.transpose/);
  assert.doesNotMatch(exportBackup, /transpose:\s*state\.transpose/);
});

test('opening a library or favorite chart resets its working transpose', () => {
  assert.match(app, /state\.chartFrom === 'songs' \|\| state\.chartFrom === 'favorites'\) state\.transpose\[songId\] = 0/);
});

test('setlist transpose remains durable inside its owning setlist', () => {
  assert.match(app, /sl\.transposes\[currentSongId\] = state\.transpose\[currentSongId\] \|\| 0/);
});
