const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('interactive list content is keyboard reachable and activatable', () => {
  assert.match(app, /function makeKeyboardAction/);
  assert.match(app, /setAttribute\('role', 'button'\)/);
  assert.match(app, /setAttribute\('tabindex', '0'\)/);
  assert.match(app, /e\.key === 'Enter' \|\| e\.key === ' '/);
  assert.match(app, /makeKeyboardAction\(main, 'Open '/);
  assert.match(app, /makeKeyboardAction\(row, 'Add '/);
  assert.match(app, /makeKeyboardAction\(row, 'Choose '/);
});

test('dynamic search controls and duplicate Hide buttons have distinct names', () => {
  assert.match(app, /aria-label="Search songs to add"/);
  assert.match(app, /aria-label="Search songs for medley"/);
  assert.match(app, /aria-label="Hide Listen and learn"/);
  assert.match(app, /aria-label="Hide practice player"/);
});

test('song editor keeps persistent labels after placeholder text disappears', () => {
  for (const id of ['sh-song-title', 'sh-song-artist', 'sh-song-key', 'sh-song-tempo', 'sh-song-feel', 'sh-song-tags', 'sh-song-chart']) {
    assert.ok(app.includes(`for="${id}"`), `${id} should have a persistent label`);
  }
});

test('stage mode collapses learning media and pauses practice playback', () => {
  const setStage = app.match(/function setStage\(on\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(setStage, /mediaOpen = false/);
  assert.match(setStage, /practice\.open = false/);
  assert.match(setStage, /practice\.el\.pause\(\)/);
});
