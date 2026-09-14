/* Regression: the landing page hero used to hand every visitor the Windows build,
   so a Mac or Linux user's most prominent button fetched an .exe. The hero now carries
   per-platform targets generated from the published inventory and platform.js swaps to
   the detected platform, while the static default keeps the page working without JS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { detectPlatform, selectMacArchitecture } = require('../platform.js');

const ROOT = path.resolve(__dirname, '..');
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'downloads.json'), 'utf8'));
const asset = (match) => inventory.find(match);
const expected = {
  windows: asset((a) => a.platform === 'windows'),
  linux: asset((a) => a.platform === 'linux'),
  'macos-arm64': asset((a) => a.platform === 'macos' && /arm64/.test(a.name)),
  'macos-x86': asset((a) => a.platform === 'macos' && /x86_64/.test(a.name)),
};
for (const [key, record] of Object.entries(expected)) {
  assert.ok(record, `the published inventory has no asset for "${key}", so the hero cannot offer it`);
}

const unescapeAttr = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

for (const page of ['index.html', 'fr/index.html', 'es/index.html']) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const match = html.match(
    /<a class="button" href="([^"]+)" data-download-urls="([^"]*)" data-download-labels="([^"]*)">([\s\S]*?)<\/a>/,
  );
  assert.ok(match, `${page}: the hero download carries no per-platform targets`);
  const [, href, urlsRaw, labelsRaw, inner] = match;
  const urls = JSON.parse(unescapeAttr(urlsRaw));
  const labels = JSON.parse(unescapeAttr(labelsRaw));

  // Without JavaScript the page must still work, exactly as it did before.
  assert.equal(href, expected.windows.url, `${page}: the no-JS hero default must stay the Windows build`);
  assert.match(inner, /class="hero-download-label"/, `${page}: the swap needs a label to rewrite`);

  assert.deepEqual(
    Object.keys(urls).sort(),
    Object.keys(expected).sort(),
    `${page}: the hero must offer every platform the inventory publishes`,
  );
  for (const [key, record] of Object.entries(expected)) {
    assert.equal(urls[key], record.url, `${page}: hero target for "${key}" is not the published asset`);
    const label = labels[key];
    assert.ok(label && label.length, `${page}: hero label for "${key}" is missing`);
    if (key !== 'windows') {
      // The Windows label is the existing localised string; the other labels are
      // composed here, so they are the ones that must name their architecture.
      assert.ok(
        label.includes(record.architecture),
        `${page}: hero label for "${key}" must name its architecture ("${record.architecture}"), got "${label}"`,
      );
    }
  }
  assert.ok(
    /Windows/.test(labels.windows) && /Linux/.test(labels.linux) && /macOS/.test(labels['macos-arm64']),
    `${page}: hero labels must name the platform`,
  );
}

// The behaviour must actually be wired, in the same vocabulary the cards use.
const platformJs = fs.readFileSync(path.join(ROOT, 'platform.js'), 'utf8');
assert.match(platformJs, /data-download-urls/, 'platform.js does not participate in the hero swap');
assert.match(platformJs, /hero-download-label/, 'platform.js cannot rewrite the hero label');
for (const [ua, platform, touch, key] of [
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32', 0, 'windows'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0, 'macos'],
  ['Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64', 0, 'linux'],
]) {
  const detected = detectPlatform(ua, platform, touch);
  assert.ok(
    detected === key || detected === 'macos',
    `${platform}: detection drifted away from the hero vocabulary (got "${detected}")`,
  );
}
// The macOS build choice must never be driven by a withheld client hint. Chromium reports
// the default architecture "x86" on a plain-HTTP origin even on Apple Silicon, which would
// have handed Apple Silicon visitors the Intel build.
for (const [renderer, hint, expected] of [
  ['ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Unspecified Version)', '', 'macos-arm64'],
  ['ANGLE (Intel, Intel(R) Iris(TM) Plus Graphics, OpenGL 4.1)', 'x86', 'macos-x86'],
  ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device)), SwiftShader driver', 'arm', 'macos-arm64'],
  ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device)), SwiftShader driver', 'x86', 'macos-arm64'],
  ['', '', 'macos-arm64'],
]) {
  assert.equal(
    selectMacArchitecture(renderer, hint),
    expected,
    `renderer ${JSON.stringify(renderer.slice(0, 30))} with hint "${hint}" must offer ${expected}`,
  );
}

// Unsupported devices must be left on the safe static default, never mis-suggested.
for (const [ua, platform, touch] of [
  ['Mozilla/5.0 (Linux; Android 14; Pixel 8)', 'Linux armv8l', 5],
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5],
]) {
  const detected = detectPlatform(ua, platform, touch);
  assert.ok(
    detected !== 'macos' && detected !== 'windows' && detected !== 'linux',
    `unsupported device detected as "${detected}" must not be offered a desktop installer`,
  );
}

console.log('PASS landing hero offers the visitor their own installer, with the Windows default kept for no-JS visitors');
