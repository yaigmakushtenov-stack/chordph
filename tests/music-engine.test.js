const test = require('node:test');
const assert = require('node:assert/strict');
const music = require('../app/lib/music-engine.js');

test('transposes extensions and slash bass notes with sharps or flats', () => {
  const chart = 'C G/B Am7 Fmaj7\nDm7 G7 C';
  assert.equal(music.transposeChordText(chart, 1, false), 'C# G#/C A#m7 F#maj7\nD#m7 G#7 C#');
  assert.equal(music.transposeChordText(chart, 1, true), 'Db Ab/C Bbm7 Gbmaj7\nEbm7 Ab7 Db');
});

test('converts major-key chords and inversions to Nashville numbers', () => {
  assert.equal(music.toNashville('C G/B Am7 Fmaj7 Dm7 G7 C', 0, false, false), '1 5/7 6m7 4maj7 2m7 57 1');
});

test('uses natural-minor scale degrees including the raised leading tone', () => {
  assert.equal(music.toNashville('Em B/D# C Am', music.getNoteIndex('E'), true, false), '1m 5/#7 6 4m');
});

test('recognizes chord lines without treating ordinary lyrics as chords', () => {
  assert.equal(music.isChordLine('C G/B Am7 Fmaj7'), true);
  assert.equal(music.isChordLine('|G| D/F#| Em7-Cadd9'), true);
  assert.equal(music.isChordLine('C#m7(b5) F#7sus4 Bm'), true);
  assert.equal(music.isChordLine('Amazing grace how sweet the sound'), false);
  assert.equal(music.isChordLine('Sa atin na tunay'), false);
});

test('parses chart sections and selects medley sections in order', () => {
  const song = { chart: '[Verse 1]\nC G\nLine one\n\n[Chorus]\nF G C\nLine two' };
  assert.deepEqual(music.parseSections(song.chart).map(section => section.label), ['Verse 1', 'Chorus']);
  assert.equal(music.medleyChartText(song, [1]), '[Chorus]\nF G C\nLine two');
});

test('escapes chart content before producing HTML', () => {
  assert.match(music.formatChart('[Verse]\n<script>alert(1)</script>'), /&lt;script&gt;/);
  assert.doesNotMatch(music.formatChart('[Verse]\n<script>alert(1)</script>'), /<script>/);
});

test('strips chord lines but preserves headers and lyrics', () => {
  assert.equal(music.stripChords('[Verse]\nC G\nAmazing grace\n\n[Chorus]\nF G\nSing'), '[Verse]\nAmazing grace\n\n[Chorus]\nSing');
  assert.equal(music.stripChords('[Chorus]\n|G| D/F#| Em7-Cadd9\nSa atin na tunay'), '[Chorus]\nSa atin na tunay');
});
