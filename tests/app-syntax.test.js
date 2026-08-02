const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('all inline app scripts parse as JavaScript', () => {
  const scripts = [...app.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  assert.ok(scripts.length > 0, 'expected at least one inline script');
  scripts.forEach((source, index) => assert.doesNotThrow(
    () => new vm.Script(source, { filename: `app-inline-${index}.js` }),
  ));
});
