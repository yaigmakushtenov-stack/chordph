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

test('stage mode hides expanded media without destroying playback', () => {
  const setStage = app.match(/function setStage\(on\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(setStage, /mediaOpen = false|practice\.open = false|practice\.el\.pause/);
  assert.match(app, /body\.stage-mode #chart-media/);
  assert.match(app, /id="stage-now-playing"/);
  assert.match(app, /Now playing · Practice track/);
});

test('chart rendering preserves the existing media component and iframe nodes', () => {
  assert.match(app, /function ensureMediaPanel/);
  assert.match(app, /box\.dataset\.songId !== String\(currentSongId\)/);
  const chartStart = app.indexOf('function renderChart()');
  const chartEnd = app.indexOf('/* ---- "Listen & learn"', chartStart);
  const renderChart = app.slice(chartStart, chartEnd);
  assert.match(renderChart, /ensureMediaPanel\(\)/);
  assert.doesNotMatch(renderChart, /renderMediaPanel\(\)/);
});

test('autoscroll remains in floating controls but is removed from the function toolbar', () => {
  assert.match(app, /id="scroll-fab"/);
  assert.match(app, /id="stage-speed"/);
  assert.doesNotMatch(app, /id="ctl-scroll"|id="layer-scroll"|id="scroll-toggle"/);
});
