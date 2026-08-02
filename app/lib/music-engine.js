(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.ChordMusic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    var NASH_SHARP = ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', '#6', '7'];
    var NASH_FLAT  = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    var NASH_MIN_SHARP = ['1', '#1', '2', '3', '#3', '4', '#4', '5', '6', '#6', '7', '#7'];
    var NASH_MIN_FLAT  = ['1', 'b2', '2', '3', 'b4', '4', 'b5', '5', '6', 'b7', '7', '#7'];

    function getNoteIndex(note) {
        var idx = SHARPS.indexOf(note);
        return idx !== -1 ? idx : FLATS.indexOf(note);
    }

    function noteName(index, useFlats) {
        var normalized = ((index % 12) + 12) % 12;
        return (useFlats ? FLATS : SHARPS)[normalized];
    }

    function transposeNoteBySteps(note, steps, useFlats) {
        var index = getNoteIndex(note);
        return index === -1 ? note : noteName(index + steps, useFlats);
    }

    function transposeChordText(text, steps, useFlats) {
        return String(text || '').replace(/\b([A-G][b#]?)((?:m|maj|min|sus|add|dim|aug|[0-9])*)(\/([A-G][b#]?))?(?=\s|\[|[|,:;)\]}-]|$)/gm,
            function(match, chordRoot, quality, slash, bass) {
                return transposeNoteBySteps(chordRoot, steps, useFlats) + (quality || '') +
                    (bass ? '/' + transposeNoteBySteps(bass, steps, useFlats) : '');
            });
    }

    function keyRoot(key) { return String(key || '').replace(/m$/, ''); }
    function isMinorKey(key) { return /m$/.test(String(key || '')); }
    function keyLabel(index, minor, useFlats) { return noteName(index, useFlats) + (minor ? 'm' : ''); }

    function getStepsToReach(fromKey, toKey) {
        var from = getNoteIndex(keyRoot(fromKey));
        var to = getNoteIndex(keyRoot(toKey));
        return from === -1 || to === -1 ? 0 : (to - from + 12) % 12;
    }

    function nashDegree(note, keyIndex, minor, useFlats) {
        var interval = (getNoteIndex(note) - keyIndex + 120) % 12;
        var sharp = note.indexOf('#') !== -1 ? true : note.indexOf('b') !== -1 ? false : !useFlats;
        var table = minor ? (sharp ? NASH_MIN_SHARP : NASH_MIN_FLAT) : (sharp ? NASH_SHARP : NASH_FLAT);
        return table[interval];
    }

    function toNashville(text, keyIndex, minor, useFlats) {
        return String(text || '').replace(/\b([A-G][b#]?)((?:m|maj|min|sus|add|dim|aug|[0-9])*)(\/([A-G][b#]?))?(?=\s|\[|[|,:;)\]}-]|$)/gm,
            function(match, chordRoot, quality, slash, bass) {
                return nashDegree(chordRoot, keyIndex, minor, useFlats) + (quality || '') +
                    (bass ? '/' + nashDegree(bass, keyIndex, minor, useFlats) : '');
            });
    }

    function parseSections(chart) {
        var sections = [], current = null;
        String(chart || '').split('\n').forEach(function(line) {
            if (/^\s*\[.*\]\s*$/.test(line)) {
                if (current) sections.push(current);
                current = { label: line.trim().replace(/^\[|\]$/g, ''), lines: [line] };
            } else {
                if (!current) current = { label: 'Intro', lines: [] };
                current.lines.push(line);
            }
        });
        if (current) sections.push(current);
        return sections.map(function(section) {
            return { label: section.label, text: section.lines.join('\n').replace(/^\n+|\n+$/g, '') };
        });
    }

    function medleyChartText(song, indices) {
        if (!indices) return song.chart;
        var sections = parseSections(song.chart);
        return indices.filter(function(index) { return sections[index]; })
            .map(function(index) { return sections[index].text; }).join('\n\n');
    }

    function escapeHtml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function isChordToken(token) {
        var cleaned = String(token || '').replace(/^[|:]+|[|:;,]+$/g, '');
        if (!cleaned || cleaned === '-' || cleaned === 'N.C.' || cleaned === 'x2' || cleaned === 'x4') return true;
        // Charts copied from other tools commonly attach measure bars or join a
        // progression with dashes: |G|, D/F#| and G-D/F#-Em. Treat the joined
        // token as music only when every part is independently a valid chord.
        var parts = cleaned.split(/[-–—]/).filter(Boolean);
        var chord = /^\(?[A-G][b#]?(?:(?:(?:maj|min|dim|aug|sus|add|no|m)\d*)|(?:[#b]?\d+)|[+°ø])*(?:\((?:(?:(?:maj|min|dim|aug|sus|add|no|m)\d*)|(?:[#b]?\d+)|[+°ø])+\))*(?:\/[A-G][b#]?)?\)?[,.]?$/;
        return parts.length > 0 && parts.every(function(part) { return chord.test(part); });
    }

    function isChordLine(line) {
        var tokens = String(line || '').trim().split(/\s+/).filter(Boolean);
        if (!tokens.length) return false;
        var hits = tokens.filter(isChordToken).length;
        return hits / tokens.length >= 0.7;
    }

    function stripChords(text) {
        var output = [];
        String(text || '').split('\n').forEach(function(line) {
            if (!/^\s*\[.*\]\s*$/.test(line) && isChordLine(line)) return;
            if (!line.trim() && output.length && !output[output.length - 1].trim()) return;
            output.push(line);
        });
        return output.join('\n').replace(/^\n+|\n+$/g, '');
    }

    function formatChart(text, options) {
        options = options || {};
        return String(text || '').split('\n').map(function(line) {
            if (/^\s*\[.*\]\s*$/.test(line)) return '<div class="sec-head">' + escapeHtml(line) + '</div>';
            if (!line.trim()) return '<div class="chart-gap"></div>';
            if (isChordLine(line)) {
                var chordText = options.nashville ? toNashville(line, options.keyIndex, options.minor, options.useFlats) : line;
                return '<div class="chord-line">' + escapeHtml(chordText) + '</div>';
            }
            return '<div class="lyric-line">' + escapeHtml(line) + '</div>';
        }).join('');
    }

    return {
        SHARPS: SHARPS, FLATS: FLATS,
        getNoteIndex: getNoteIndex, noteName: noteName,
        transposeNoteBySteps: transposeNoteBySteps, transposeChordText: transposeChordText,
        keyRoot: keyRoot, isMinorKey: isMinorKey, keyLabel: keyLabel, getStepsToReach: getStepsToReach,
        nashDegree: nashDegree, toNashville: toNashville,
        parseSections: parseSections, medleyChartText: medleyChartText,
        escapeHtml: escapeHtml, isChordToken: isChordToken, isChordLine: isChordLine, stripChords: stripChords, formatChart: formatChart
    };
});
