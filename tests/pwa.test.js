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

test('service worker rejects cross-origin and analyzer caching', () => {
  assert.match(sw, /url\.origin !== self\.location\.origin/);
  assert.match(sw, /url\.pathname\.indexOf\('\/analyzer'\)/);
});

test('offline app shell includes the app and its local runtime files', () => {
  for (const resource of ['/app/', '/app/index.html', '/app/lib/supabase.js', '/app/lib/music-engine.js']) {
    assert.ok(sw.includes(`'${resource}'`), `${resource} should be precached`);
  }
});

test('installed app does not force portrait orientation', () => {
  assert.equal(manifest.orientation, undefined);
});
