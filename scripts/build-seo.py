"""Generate crawl files from published HTML canonical URLs, stdlib only."""
from pathlib import Path
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://filecraft.github.io/'
class Canonical(HTMLParser):
    url=''
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='link' and a.get('rel')=='canonical':self.url=a.get('href') or ''
ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9')
ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
sitemap=ET.Element(ns+'urlset')
urls=[]
for file in [ROOT/'index.html',*sorted((ROOT/'documentation').glob('*.html')),*sorted(p for p in ROOT.glob('*/index.html') if p.parent.name!='documentation')]:
    page=Canonical();page.feed(file.read_text());assert page.url.startswith(BASE)
    assert page.url not in urls;urls.append(page.url)
    ET.SubElement(ET.SubElement(sitemap,ns+'url'),ns+'loc').text=page.url
ET.indent(sitemap)
ET.ElementTree(sitemap).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'sitemap.xml\n')
print('Generated sitemap:',len(urls),'canonical URLs')
