from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
home=(ROOT/'index.html').read_text()
assets=json.loads((ROOT/'downloads.json').read_text());urls={a['url'] for a in assets}
links=re.findall(r'href="([^"]+)"',home)
release_links=[u for u in links if '/releases/download/' in u]
assert release_links and set(release_links)<=urls,'Home must offer only actual current artifacts'
assert any('windows' in u for u in release_links),'Windows download must be directly available'
assert '>P</span>Filecraft' not in home,'Stale brand mark'
assert '/releases/' in links and '/cookies/' in links
archive=(ROOT/'releases/index.html').read_text()
records=json.loads((ROOT/'releases.json').read_text())
assert sum(r['current'] for r in records)==1
for r in records:
 assert r['tag'] in archive
 for a in r['assets']:assert a['url'] in archive
print('PASS current-only home downloads, Windows CTA, brand, cookies and full release archive')
