from pathlib import Path
import html,re
import markdown
ROOT=Path(__file__).resolve().parents[1]
BASE='https://filecraft.github.io/'
names=['ARCHITECTURE','RELEASING','VERIFICATION','VERIFICATION-0.4','PERFORMANCE','WEBSITE-QA','ACKNOWLEDGMENTS','DOMAIN','ROADMAP-100','VERIFICATION-0.5','STORE-FOUNDATIONS','GOVERNANCE','ENGINE-ARCHITECTURE','IDENTITY-RESEARCH','PRODUCT-ROADMAP','CLI','PDF-WORKFLOWS','DEPENDENCIES','DESIGN-SYSTEM','PLATFORM-QUALIFICATION','DESKTOP-SUITE']
import runpy
layout=runpy.run_path(str(ROOT/'scripts/build-product-pages.py'))['shell']
def shell(title,body,url):
    historical='<p class="fine">Versioned reports retain historical scope and licenses. Current capabilities and license: <a href="/features/">features</a> · <a href="/licensing/">licensing</a>.</p>'
    return layout(title,'Technical documentation and evidence. Older versioned reports retain their original scope.',historical+'<article class="technical">'+body+'</article>',url.removeprefix(BASE))
out=ROOT/'documentation';out.mkdir(exist_ok=True)
links=[]
for name in names:
    text=(ROOT/(name+'.md')).read_text()
    title=text.splitlines()[0].lstrip('# ')
    body=markdown.markdown('\n'.join(text.splitlines()[1:]),extensions=['tables','fenced_code'])
    def target(m):
        url=m.group(1)
        if url.startswith(('https://','http://','#','mailto:')):return m.group(0)
        path,sep,fragment=url.partition('#')
        base=Path(path).stem
        if base in names and path.endswith('.md'):url=base+'.html'+(sep+fragment if sep else '')
        elif path.endswith('.md'):url='https://github.com/Filecraft/Filecraft/blob/main/'+path.removeprefix('../')+(sep+fragment if sep else '')
        else:url='../'+url
        return 'href="'+url+'"'
    body=re.sub(r'href="([^"]+)"',target,body)
    (out/(name+'.html')).write_text(shell(title,body,BASE+'documentation/'+name+'.html'))
    links.append(f'<li><a href="{name}.html">{html.escape(title)}</a></li>')
(out/'index.html').write_text(shell('Documentation','<p>Technical notes and release evidence. Older versioned reports describe their original releases, not new guarantees.</p><ul>'+''.join(links)+'</ul>',BASE+'documentation/'))
print('Generated',len(names),'documentation pages and index')
