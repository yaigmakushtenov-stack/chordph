const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const landing = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('landing page leads with the worship-team workflow rather than a feature dump', () => {
  assert.match(landing, /Prepare the songs\./);
  assert.match(landing, /Rehearse the set\./);
  assert.match(landing, /Play Sunday-ready\./);
  assert.match(landing, /id="workflow"/);
  assert.match(landing, />Prepare</);
  assert.match(landing, />Rehearse</);
  assert.match(landing, />Perform</);
  assert.doesNotMatch(landing, /Everything a worship team needs/);
});

test('landing page makes the first action and trust promises specific', () => {
  assert.match(landing, /Build this Sunday’s setlist/);
  assert.match(landing, /No sign-up to start/);
  assert.match(landing, /Works offline/);
  assert.match(landing, /Free for musicians/);
});

test('landing page explains the scattered-chart problem and practice positioning', () => {
  assert.match(landing, /Screenshots in Messenger/);
  assert.match(landing, /Practice with the track without leaving the chart/);
  assert.match(landing, /Spotify, YouTube or your own practice audio/);
  assert.match(landing, /Made in the Philippines/);
});
