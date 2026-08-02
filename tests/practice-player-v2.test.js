const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('native practice playback is not destroyed when another chart opens', () => {
  const openChart = app.match(/function openChart\(songId, from\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(openChart, /stopPractice\(\)|practice\.open = false/);
  assert.match(app, /practice\.songId/);
  assert.match(app, /function returnToNowPlaying/);
  assert.match(app, /id="stage-now-playing-toggle"/);
  assert.match(app, /id="stage-now-playing-time"/);
  assert.match(app, /renderAudioPanel\(\); updateStageNowPlaying\(\)/);
});

test('waveform is decoded from the user audio and supports touch and keyboard scrubbing', () => {
  assert.match(app, /function decodePracticeWaveform/);
  assert.match(app, /decodeAudioData/);
  assert.match(app, /getChannelData/);
  assert.match(app, /id="audio-wave"[^>]+role="slider"/);
  assert.match(app, /pointerdown/);
  assert.match(app, /pointermove/);
  assert.match(app, /ArrowLeft/);
  assert.match(app, /ArrowRight/);
  assert.match(app, /\.wave-bars span, \.wave-played-bars span \{[^}]*min-width: 0/);
});

test('A and B markers have a visible loop range and a precise playback guard', () => {
  assert.match(app, /id="wave-marker-a"/);
  assert.match(app, /id="wave-marker-b"/);
  assert.match(app, /id="wave-loop-range"/);
  assert.match(app, /setInterval\(enforcePracticeLoop, 25\)/);
  assert.match(app, /practice\.b - practice\.a >= 0\.25/);
});

test('named rehearsal loops are saved per song and can be recalled or removed', () => {
  assert.match(app, /function saveNamedPracticeLoop/);
  assert.match(app, /function loadNamedPracticeLoop/);
  assert.match(app, /function removeNamedPracticeLoop/);
  assert.match(app, /s\.loops = practice\.loops\.slice\(\)/);
  assert.match(app, /practice\.a = item\.a; practice\.b = item\.b; practice\.loop = true/);
  assert.match(app, />Saved loops</);
  assert.match(app, /aria-label="Delete saved loop/);
});

test('position, loop and speed persist per song without storing the audio in localStorage', () => {
  assert.match(app, /chordph2_practice_sessions/);
  assert.match(app, /s\.position = practice\.el\.currentTime/);
  assert.match(app, /s\.a = practice\.a; s\.b = practice\.b; s\.loop = practice\.loop; s\.countIn = practice\.countIn; s\.rate = practice\.rate/);
  assert.match(app, /s\.pitch = practice\.pitch/);
  assert.match(app, /idbPut\('song:' \+ id, f\)/);
  assert.doesNotMatch(app, /localStorage\.setItem\([^\n]+practice\.url/);
});

test('slower playback asks the browser to preserve pitch and exposes media controls', () => {
  assert.match(app, /preservesPitch = true/);
  assert.match(app, /webkitPreservesPitch = true/);
  assert.match(app, /function setupPracticeMediaSession/);
  assert.match(app, /setActionHandler\('seekto'/);
  assert.match(app, /setPositionState/);
});

test('audio key shifting is independent from playback speed and is locally processed', () => {
  assert.match(app, /function ensurePracticePitchGraph/);
  assert.match(app, /createMediaElementSource\(practice\.el\)/);
  assert.match(app, /dry\.gain\.value = practice\.pitch \? 0 : 1; wet\.gain\.value = 0/);
  assert.match(app, /function rebuildPracticePitchPath/);
  assert.match(app, /Math\.pow\(2, practice\.pitch \/ 12\)/);
  assert.match(app, /createDelay\(0\.12\)/);
  assert.match(app, /Lower audio by one semitone/);
  assert.match(app, /Raise audio by one semitone/);
  assert.match(app, /Practice audio only; chart stays unchanged/);
  assert.match(app, /Math\.max\(-6, Math\.min\(6/);
  assert.doesNotMatch(app, /setPracticePitch[\s\S]{0,500}playbackRate\s*=/);
});

test('loop count-in pauses at B and counts one tempo-aware bar before A', () => {
  assert.match(app, /function startPracticeCountIn/);
  assert.match(app, /if \(practice\.countIn\) startPracticeCountIn\(\)/);
  assert.match(app, /parseInt\(song && song\.timesig, 10\) \|\| 4/);
  assert.match(app, /60 \/ \(bpm \* practice\.rate\)/);
  assert.match(app, /practice\.el\.pause\(\); practice\.el\.currentTime = practice\.a/);
  assert.match(app, /playPracticeAudio\(\)/);
  assert.match(app, /s\.countIn = practice\.countIn/);
  assert.match(app, /Play one bar of clicks before the loop restarts/);
  assert.match(app, /practice\.countInSources\.forEach/);
});
