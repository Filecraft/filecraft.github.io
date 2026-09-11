from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
PAGES=['download','features','platforms','getting-started','privacy','terms','security','faq','accessibility','about','community','contributing','changelog','releases','roadmap','licensing','contact']
class Links(HTMLParser):
    def __init__(self):super().__init__();self.h1=0;self.canonical=[];self.links=[]
    def handle_starttag(self,tag,attrs):
        t=tag;d=dict(attrs)
        if t=='h1':self.h1+=1
        if t=='link' and d.get('rel')=='canonical':self.canonical.append(d['href'])
        if t=='a':self.links.append(d.get('href',''))
for name in PAGES:
    p=ROOT/name/'index.html';assert p.is_file(),name
    h=Links();h.feed(p.read_text());assert h.h1==1 and h.canonical==['https://filecraft.github.io/'+name+'/'],name
    for url in h.links:
        if url.startswith('/'):
            target=ROOT/url.split('#')[0].lstrip('/');assert target.is_file() or (target/'index.html').is_file(),(name,url)
assert (ROOT/'404.html').is_file()
assert 'noindex' in (ROOT/'404.html').read_text()
print('PASS required product pages, canonicals, internal links and 404')
