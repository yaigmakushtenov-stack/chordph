const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('app registers the service worker even when opened directly', () => {
  assert.match(app, /navigator\.serviceWorker\.register\('\/sw\.js'\)/);
});

test('private beta service worker removes the old public app shell', () => {
  assert.match(sw, /name\.indexOf\(CACHE_PREFIX\) === 0/);
  assert.match(sw, /caches\.delete\(name\)/);
  assert.match(sw, /self\.registration\.unregister\(\)/);
  assert.doesNotMatch(sw, /addAll\(APP_SHELL\)/);
});

test('installed app does not force portrait orientation', () => {
  assert.equal(manifest.orientation, undefined);
});
