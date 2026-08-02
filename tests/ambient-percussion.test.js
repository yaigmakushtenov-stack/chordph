const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('ambient percussion has usable chart controls and three distinct grooves', () => {
  assert.match(app, /aria-label="Pad and percussion"/);
  assert.match(app, /id="percussion-toggle"/);
  assert.match(app, /id="percussion-style"[^>]+aria-label="Percussion style"/);
  assert.match(app, /id="percussion-vol"[^>]+aria-label="Percussion volume"/);
  for (const style of ['gentle', 'pulse', 'build']) assert.match(app, new RegExp(`value="${style}"`));
});

test('percussion is synthesized locally without bundled audio samples', () => {
  assert.match(app, /function percussionNoiseBuffer/);
  assert.match(app, /function percussionNoiseAt/);
  assert.match(app, /function percussionKickAt/);
  assert.match(app, /function percussionTomAt/);
  assert.doesNotMatch(app, /percussion[^\n]+\.(mp3|wav|ogg)/i);
});

test('percussion follows chart tempo zones and survives navigation or wake-up', () => {
  assert.match(app, /function syncPercussionToTempoZone/);
  assert.match(app, /percussion\.bpm = target\.bpm/);
  assert.match(app, /percussion\.beatsPerBar = target\.beats \|\| 4/);
  assert.match(app, /buildTempoZones[\s\S]*syncPercussionToTempoZone\(true\)/);
  assert.match(app, /visibilitychange[\s\S]*revivePercussion\(\)/);
  assert.match(app, /wakeLockNeeded[\s\S]*percussion\.playing/);
  assert.match(app, /secondsPerBeat = 60 \/ percussion\.bpm/);
  assert.match(app, /stepsPerBar = Math\.max\(1, percussion\.beatsPerBar\)/);
});

test('global sound-bed control represents pad, percussion, or both', () => {
  assert.match(app, /id="pad-chip-label"/);
  assert.match(app, /function stopSoundBed/);
  assert.match(app, /pad\.playing && percussionOn/);
  assert.match(app, /chip\.style\.display = \(pad\.playing \|\| percussionOn\)/);
});
