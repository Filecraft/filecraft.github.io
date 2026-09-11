from pathlib import Path
import html,re
import markdown
ROOT=Path(__file__).resolve().parents[1]
BASE='https://gonisulaimann.github.io/'
names=['ARCHITECTURE','RELEASING','VERIFICATION','VERIFICATION-0.4','PERFORMANCE','WEBSITE-QA','ACKNOWLEDGMENTS','DOMAIN','ROADMAP-100','VERIFICATION-0.5','STORE-FOUNDATIONS','GOVERNANCE','ENGINE-ARCHITECTURE','IDENTITY-RESEARCH','PRODUCT-ROADMAP','CLI','PDF-WORKFLOWS','DEPENDENCIES','DESIGN-SYSTEM','PLATFORM-QUALIFICATION']
def shell(title,body,url):
    description=html.escape(f'{title}: Prepare documentation, local processing and release evidence. Versioned reports retain their original scope.')
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(title)} — Prepare docs</title><link rel="canonical" href="{url}"><meta name="description" content="{description}"><meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title)} — Prepare docs"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/social-preview.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{html.escape(title)} — Prepare docs"><meta name="twitter:description" content="{description}"><meta name="twitter:image" content="{BASE}assets/social-preview.png"><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="docs.css"></head><body><main class="doc"><nav><a href="../">Prepare</a> / <a href="./">Documentation</a></nav>{body}<footer><a href="https://github.com/gonisulaimann/Prepare">Application source and releases</a></footer></main></body></html>'''
out=ROOT/'documentation';out.mkdir(exist_ok=True)
links=[]
for name in names:
    text=(ROOT/(name+'.md')).read_text()
    title=text.splitlines()[0].lstrip('# ')
    body=markdown.markdown(text,extensions=['tables','fenced_code'])
    def target(m):
        url=m.group(1)
        if url.startswith(('https://','http://','#','mailto:')):return m.group(0)
        path,sep,fragment=url.partition('#')
        base=Path(path).stem
        if base in names and path.endswith('.md'):url=base+'.html'+(sep+fragment if sep else '')
        elif path.endswith('.md'):url='https://github.com/gonisulaimann/Prepare/blob/main/'+path.removeprefix('../')+(sep+fragment if sep else '')
        else:url='../'+url
        return 'href="'+url+'"'
    body=re.sub(r'href="([^"]+)"',target,body)
    (out/(name+'.html')).write_text(shell(title,body,BASE+'documentation/'+name+'.html'))
    links.append(f'<li><a href="{name}.html">{html.escape(title)}</a></li>')
(out/'index.html').write_text(shell('Documentation','<h1>Documentation</h1><p>Technical notes and release evidence. Older versioned reports describe their original releases, not new guarantees.</p><ul>'+''.join(links)+'</ul>',BASE+'documentation/'))
print('Generated',len(names),'documentation pages and index')
