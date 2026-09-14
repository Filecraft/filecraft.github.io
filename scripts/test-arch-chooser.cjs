/* The hero and the download page used to guess one macOS build from a best-effort signal
   (a client hint that reports "x86" whenever it is withheld, even on Apple Silicon), so a
   Mac visitor could be handed the wrong architecture with no way back. Both places now
   carry the visitor's likely build AND a two-button chooser, driven by one shared decision.

   This drives the real platform.js in a stubbed DOM and asserts the visitor can switch. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'platform.js'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'downloads.json'), 'utf8'));
const asset = (match) => inventory.find(match);
const arm = asset((a) => a.platform === 'macos' && /arm64/.test(a.name));
const intel = asset((a) => a.platform === 'macos' && /x86_64/.test(a.name));
assert.ok(arm && intel, 'the published inventory must offer both macOS architectures');

const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

function element(dataset = {}) {
  return {
    dataset,
    hidden: false,
    attrs: {},
    parentNode: null,
    text: null,
    setAttribute(name, value) { this.attrs[name] = value; },
    querySelector(selector) {
      if (selector === '.arch-recommended') return this._marker || null;
      if (selector === 'div') return this._text;
      return null;
    },
    addEventListener(event, fn) { this.click = fn; },
  };
}

function container() {
  const list = {
    items: [],
    get firstElementChild() { return this.items[0] || null; },
    insertBefore(node, ref) {
      const from = this.items.indexOf(node);
      if (from > -1) this.items.splice(from, 1);
      const at = this.items.indexOf(ref);
      this.items.splice(at < 0 ? this.items.length : at, 0, node);
    },
    appendChild(node) { this.items.push(node); node.parentNode = this; },
  };
  return list;
}

/* One page: a hero carrying the published targets, plus the download list and the chooser. */
function page(ua, renderer) {
  const list = container();
  const hero = element({ downloadUrls: JSON.stringify({ windows: 'w.exe', linux: 'l.deb', 'macos-arm64': arm.url, 'macos-x86': intel.url }), downloadLabels: JSON.stringify({ windows: 'Windows', linux: 'Linux', 'macos-arm64': 'macOS (Apple Silicon)', 'macos-x86': 'macOS (Intel)' }) });
  hero.setAttribute = function (name, value) { this.attrs[name] = value; };
  const label = { textContent: 'Download for Windows' };
  hero.querySelector = (selector) => (selector === '.hero-download-label' ? label : null);
  const cards = [];
  for (const [platform, architecture] of [['macos', 'macos-arm64'], ['macos', 'macos-x86'], ['windows', '']]) {
    const card = element({ download: platform, architecture });
    // Models the real DOM closely enough for the recommendation marker: appending the
    // element registers it, removing it deregisters, and querySelector finds it by class.
    card._text = {
      appended: [],
      appendChild(node) {
        this.appended.push(node);
        card._marker = node;
        node.remove = () => {
          card._marker = null;
          const at = card._text.appended.indexOf(node);
          if (at > -1) card._text.appended.splice(at, 1);
        };
      },
    };
    cards.push(card);
    list.appendChild(card);
  }
  const choices = ['macos-arm64', 'macos-x86'].map((key) => element({ archChoice: key }));
  const chooser = { hidden: true };
  const note = { textContent: '' };
  const doc = {
    querySelector: (selector) => (selector === '[data-download-urls]' ? hero : null),
    querySelectorAll: (selector) => {
      if (selector === '[data-download]') return cards;
      if (selector === '[data-arch-choice]') return choices;
      if (selector === '[data-arch-chooser]') return [chooser];
      return [];
    },
    getElementById: () => note,
    createElement: () => ({ className: '', textContent: '', getContext: () => ({ getExtension: () => ({}), getParameter: () => renderer }) }),
  };
  vm.runInNewContext(code, { navigator: { userAgent: ua, platform: 'MacIntel', maxTouchPoints: 0 }, document: doc, Promise });
  return { hero, label, cards, choices, chooser, list };
}

(async () => {
  // Apple Silicon, recognised from the GPU renderer.
  const mac = page(MAC_UA, 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Unspecified Version)');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(mac.chooser.hidden, false, 'a Mac visitor must be offered the architecture chooser');
  assert.equal(mac.hero.attrs.href, arm.url, 'the hero must lead with the likely Apple Silicon build');
  assert.match(mac.label.textContent, /Apple Silicon/, 'the hero label must name the architecture it offers');
  assert.equal(mac.choices.find((c) => c.dataset.archChoice === 'macos-arm64').attrs['aria-pressed'], 'true');

  // One click must switch both the advertised build and the recommended card.
  mac.choices.find((c) => c.dataset.archChoice === 'macos-x86').click();
  assert.equal(mac.hero.attrs.href, intel.url, 'choosing Intel must repoint the hero at the Intel build');
  assert.match(mac.label.textContent, /Intel/, 'choosing Intel must relabel the hero');
  assert.equal(mac.choices.find((c) => c.dataset.archChoice === 'macos-x86').attrs['aria-pressed'], 'true');
  assert.equal(mac.choices.find((c) => c.dataset.archChoice === 'macos-arm64').attrs['aria-pressed'], 'false');
  assert.deepEqual(
    mac.list.items.map((c) => c.dataset.architecture),
    ['macos-x86', 'macos-arm64', ''],
    'the chosen architecture must lead the download list',
  );
  const intelCard = mac.cards.find((c) => c.dataset.architecture === 'macos-x86');
  const armCard = mac.cards.find((c) => c.dataset.architecture === 'macos-arm64');
  assert.equal(intelCard._text.appended.length, 1, 'the chosen build must be marked as recommended');
  assert.match(intelCard._text.appended[0].textContent, /Recommended/i);
  assert.equal(armCard._text.appended.length, 0, 'the other build must not claim to be recommended');

  // A withheld client hint ("x86") must not override a renderer that says Apple Silicon.
  const trap = page(MAC_UA, 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Unspecified Version)');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(trap.hero.attrs.href, arm.url, 'an Apple GPU must win over a withheld "x86" hint');

  // Non-Mac visitors keep the plain platform default and are not shown the chooser.
  const win = page('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060)');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(win.chooser.hidden, true, 'the architecture chooser belongs to Mac visitors only');
  assert.equal(win.hero.attrs.href, 'w.exe', 'a Windows visitor keeps the Windows installer');
  assert.equal(win.list.items.map((c) => c.dataset.architecture)[0], 'macos-arm64', 'a non-Mac visitor must not have their list reordered');

  // The markup that carries all of this must exist on the landing pages and the download page.
  for (const file of ['index.html', 'fr/index.html', 'es/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const chooser = html.match(/data-arch-chooser hidden([^>]*)>([\s\S]*?)<\/span>/)
    assert.ok(chooser, `${file}: the hero carries no architecture chooser`);
    assert.match(chooser[1], /role="group"/, `${file}: the hero chooser needs a group role`);
    assert.match(chooser[1], /aria-label="[^"]+"/, `${file}: the hero chooser needs an accessible name`);
    assert.match(chooser[2], /data-arch-choice="macos-arm64"/, `${file}: the hero chooser offers no Apple Silicon option`);
    assert.match(chooser[2], /data-arch-choice="macos-x86"/, `${file}: the hero chooser offers no Intel option`);
  }
  const downloads = fs.readFileSync(path.join(ROOT, 'download', 'index.html'), 'utf8');
  assert.match(downloads, /data-arch-chooser hidden/, 'the download page carries no architecture chooser');
  assert.match(downloads, /data-architecture="macos-arm64"/, 'the download cards do not identify their architecture');
  assert.match(downloads, /data-architecture="macos-x86"/, 'the download cards do not identify their architecture');

  console.log('PASS the Mac architecture is a one-click choice, not a hidden best-effort guess');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
