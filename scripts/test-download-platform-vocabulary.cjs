/* Regression: the download page's filter vocabulary, the inventory card keys and
   the values platform.js can detect must all use one canonical set of keys.
   A `mac`/`macos` split shipped to production and made the macOS filter dead. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { detectPlatform } = require('../platform.js');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'download/index.html'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'downloads.json'), 'utf8'));

const buttonKeys = [...page.matchAll(/data-platform="([^"]+)"/g)].map((m) => m[1]);
const cardKeys = [...new Set([...page.matchAll(/data-download="([^"]+)"/g)].map((m) => m[1]))];
const inventoryKeys = [...new Set(inventory.map((item) => item.platform))];

assert.ok(cardKeys.length && buttonKeys.length, 'download page must expose filter buttons and cards');
assert.deepEqual(
  cardKeys.slice().sort(),
  inventoryKeys.slice().sort(),
  'every inventory platform must render a card, and every card must come from the inventory',
);
for (const key of inventoryKeys) {
  assert.ok(buttonKeys.includes(key), `inventory platform "${key}" has no matching filter button`);
}

// Detection must speak the same vocabulary as the cards, not a synonym of it.
const cases = [
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32', 0, 'windows'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0, 'macos'],
  ['Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64', 0, 'linux'],
];
for (const [ua, platform, touch, expected] of cases) {
  const detected = detectPlatform(ua, platform, touch);
  assert.equal(detected, expected, `${platform} must detect as "${expected}", got "${detected}"`);
  assert.ok(
    cardKeys.includes(detected),
    `detected platform "${detected}" matches no card, so the filter silently shows everything`,
  );
}

// A device with no current package must stay explicitly unsupported, never mis-suggested.
for (const [ua, platform, touch] of [
  ['Mozilla/5.0 (Linux; Android 14; Pixel 8)', 'Linux armv8l', 5],
  ['Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', 'MacIntel', 5],
]) {
  const detected = detectPlatform(ua, platform, touch);
  assert.ok(
    ['android', 'unknown'].includes(detected) && !cardKeys.includes(detected),
    `unsupported device detected as "${detected}" and must not match a consumer card`,
  );
}

console.log(
  `PASS download platform vocabulary is canonical across buttons (${buttonKeys.length}), ` +
    `cards (${cardKeys.length}) and detection`,
);
