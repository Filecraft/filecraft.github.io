"""Offline SEO regressions; no fabricated ratings or ranking promises."""
from pathlib import Path
from html.parser import HTMLParser
import json
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://filecraft.github.io/'
class SEO(HTMLParser):
    def __init__(self):
        super().__init__();self.meta={};self.schemas=[];self.capture=False;self.buffer='';self.h1=0;self.images=[];self.scripts=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='h1':self.h1+=1
        if tag=='img':self.images.append(a)
        if tag=='script':
            self.scripts.append(a)
            if a.get('type')=='application/ld+json':self.capture=True;self.buffer=''
    def handle_data(self,data):
        if self.capture:self.buffer+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.capture:self.schemas.append(json.loads(self.buffer));self.capture=False
files=[ROOT/'index.html',*sorted((ROOT/'documentation').glob('*.html')),*sorted(p for p in ROOT.glob('*/index.html') if p.parent.name!='documentation')]
expected=[]
for f in files:
    p=SEO();p.feed(f.read_text());url=BASE+str(f.relative_to(ROOT)).removesuffix('index.html');expected.append(url)
    assert p.h1==1,f
    for key in ['description','og:title','og:description','og:url','og:image','twitter:card','twitter:title','twitter:description','twitter:image']:
        assert p.meta.get(key),(f,key)
    assert p.meta['og:url']==url
    assert 50<=len(p.meta['description'])<=180,(f,len(p.meta['description']))
    assert all('alt' in a for a in p.images)
    allowed=['site.js','/site.js','platform.js','/platform.js']
    if f.parent.name=='workspace':allowed+=['document-engine.js','readiness-ui.js','worker-bundle.js','app.js']
    assert all(a.get('src') in allowed or a.get('type')=='application/ld+json' for a in p.scripts)
    if f.name=='index.html' and f.parent==ROOT:
        app=p.schemas[0];assert app['@type']=='SoftwareApplication'
        assert app['operatingSystem']=='Windows, Linux, macOS; browser workspace'
        assert 'softwareVersion' not in app  # multiple independently versioned distributions
        assert app['url']==BASE and app['license'].endswith('/LICENSE')
        assert 'downloadUrl' not in app  # platform choice belongs on the download page
        assert not any(k in app for k in ['aggregateRating','review'])
robot=(ROOT/'robots.txt').read_text()
assert 'User-agent: *' in robot and 'Allow: /' in robot
assert 'Sitemap: '+BASE+'sitemap.xml' in robot
sitemap=ET.parse(ROOT/'sitemap.xml')
locations=[e.text or '' for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert sorted(locations)==sorted(expected)
assert len(locations)==len(set(locations))
assert (ROOT/'assets/social-preview.png').is_file()
assert sum((ROOT/p).stat().st_size for p in ['index.html','style.css','site.js','platform.js'])<50_000
assert (ROOT/'site.js').stat().st_size<5_000
print('PASS SEO:',len(files),'pages, unique sitemap URLs, metadata, truthful SoftwareApplication JSON-LD and page byte budgets')
