from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.ids=set();self.canonical=''
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
        if tag=='img':assert 'alt' in a
        if tag in ['a','link','script','img']:
            u=a.get('href',a.get('src'))
            if u:self.links.append(u)
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
files=[ROOT/'index.html',*sorted((ROOT/'documentation').glob('*.html'))]
assert len(files)==10
count=0
for f in files:
    p=Page();p.feed(f.read_text());expected='https://gonisulaimann.github.io/'+str(f.relative_to(ROOT)).removesuffix('index.html');assert p.canonical==expected,(f,p.canonical,expected)
    for u in p.links:
        parts=urlsplit(u)
        if parts.scheme:assert parts.scheme=='https';continue
        if parts.path:
            target=f.parent/parts.path
            assert target.is_file() or (target/'index.html').is_file(),(f,u)
        elif parts.fragment:assert parts.fragment in p.ids,(f,u)
        count+=1
text=(ROOT/'index.html').read_text()
assert '/v0.4.0/Prepare-0.4.0-arm64.zip' in text
assert '/v0.5.0-portable-preview.1/Prepare-0.5.0-portable.zip' in text
assert 'https://gonisulaimann.github.io/Prepare/' not in text
print('PASS',len(files),'pages,',count,'local references, canonical URLs and both release downloads')
