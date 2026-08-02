const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');

test('Google OAuth return is sealed behind a fresh in-app history guard', () => {
  assert.match(app, /var oauthReturnPending = \/[\s\S]+location\.search \+ location\.hash/);
  assert.match(app, /getSession\(\)\.then\(function\(res\) \{\s*if \(oauthReturnPending\) sealOAuthReturnHistory\(\)/);
  assert.match(app, /event === 'SIGNED_IN' && oauthReturnPending/);
  const seal = app.match(/function sealOAuthReturnHistory\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(seal, /history\.replaceState\(\{ app: 1, authReturn: 1 \}, '', location\.pathname\)/);
  assert.match(seal, /history\.pushState\(\{ app: 1, authGuard: 1 \}, '', location\.pathname\)/);
});

test('app Back never deliberately returns to the OAuth account chooser', () => {
  const backHandler = app.match(/window\.addEventListener\('popstate',[\s\S]*?\n\}\);/)?.[0] || '';
  assert.match(backHandler, /location\.href = '\/'/);
  assert.doesNotMatch(backHandler, /^\s*history\.back\(/m);
  assert.match(backHandler, /var handled = appBack\(\)/);
});

test('mobile app gestures avoid the browser-owned screen edge', () => {
  assert.match(app, /t\.clientX >= 28 && t\.clientX <= 92/);
  assert.match(app, /if \(t\.clientX <= 96\) return/);
  assert.match(app, /\.audio-panel, button, input, textarea, a/);
  assert.match(app, /else if \(dx > 0\) chartBack\(\)/);
});
