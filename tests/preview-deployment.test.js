const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

test('Vercel preview is visibly marked and cannot initialize production cloud writes', () => {
  assert.match(app, /id="preview-banner"/);
  assert.match(app, /\.vercel\\\.app/);
  assert.match(app, /function syncEnabled\(\) \{ return !IS_PREVIEW_DEPLOYMENT/);
  assert.match(app, /applyDeploymentMode\(\)/);
});

test('static preview keeps canonical trailing-slash routes and refreshes service workers', () => {
  assert.equal(config.trailingSlash, true);
  const swRule = config.headers.find((rule) => rule.source === '/sw.js');
  assert.ok(swRule);
  assert.match(swRule.headers.find((header) => header.key === 'Cache-Control').value, /no-cache/);
});
