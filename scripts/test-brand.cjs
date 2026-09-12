/* Presentation regression suite. Existing workspace behavior is untouched. */
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const app=process.env.PREPARE_ROOT||'/Users/goni/Prepare';
const {chromium}=require(path.join(app,'portable/node_modules/playwright'));
const base=process.argv[2]||'http://127.0.0.1:8892';
const out=path.join(__dirname,'../build/brand-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();let checks=0;try{
for(const width of [320,390,768,1440])for(const colorScheme of ['light','dark'])for(const locale of ['','fr/','es/']){
 const c=await b.newContext({viewport:{width,height:1000},colorScheme,reducedMotion:'reduce'}),p=await c.newPage();const errors=[],external=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
 const response=await p.goto(base+'/'+locale);assert.equal(response.status(),200);
 assert.equal(await p.locator('html').getAttribute('lang'),locale.slice(0,2)||'en');
 assert.equal(await p.locator('h1').count(),1);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${locale} ${width}`);
 await p.locator('.workspace-feature').scrollIntoViewIfNeeded();
 await p.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await p.locator('img:not([alt])').count(),0);
 const image=await p.locator('.workspace-feature img').evaluate(i=>({real:i.naturalWidth/i.naturalHeight,declared:Number(i.width)/Number(i.height)}));assert(Math.abs(image.real-image.declared)<.02);
 await p.locator('.scene-tab[data-scene="2"]').click();assert.equal(await p.locator('.paper-scene').getAttribute('data-step'),'2');assert.equal(await p.locator('.scene-tab[aria-pressed="true"]').count(),1);
 await p.locator('.scene-tab[data-scene="3"]').click();assert.equal(await p.locator('.paper-scene').getAttribute('data-step'),'3');
 assert(await p.locator('.sheet-front').evaluate(el=>getComputedStyle(el).animationName==='none'),'reduced motion');
 await p.locator('.theme-toggle').click();assert.equal(await p.locator('html').getAttribute('data-theme'),colorScheme==='dark'?'light':'dark');
 await p.locator('.languages summary').click();assert(await p.locator('.language-menu').isVisible());await p.keyboard.press('Escape');assert(!(await p.locator('.language-menu').isVisible()));
 await p.locator('.faq-section summary').first().click();assert(await p.locator('.faq-section details').first().getAttribute('open')!==null);
 assert.equal((await c.cookies()).length,0);assert.equal(await p.evaluate(()=>localStorage.length),0);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});if(locale===''&&[390,1440].includes(width))await p.screenshot({path:path.join(out,`home-${width}-${colorScheme}.png`),fullPage:true});
 checks++;await c.close();
}
const c=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),p=await c.newPage();await p.goto(base+'/');await p.locator('.languages summary').click();await p.locator('.language-menu a[lang="fr"]').click();assert.equal(await p.locator('html').getAttribute('lang'),'fr');await p.locator('.languages summary').click();await p.locator('.language-menu a[lang="es"]').click();assert.equal(await p.locator('html').getAttribute('lang'),'es');assert.equal(await p.locator('.scene-tabs').isVisible(),false);await c.close();
const motion=await b.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),mp=await motion.newPage();await mp.goto(base+'/');
await mp.locator('.sheet-front').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished))});
const before=await mp.locator('.sheet-front').evaluate(el=>getComputedStyle(el).transform);
await mp.locator('.scene-tab[data-scene="3"]').click();
await mp.waitForFunction(()=>{const m=new DOMMatrix(getComputedStyle(document.querySelector('.sheet-front')).transform);return Math.abs(m.b)<.001&&Math.abs(m.a-1)<.001;},{},{timeout:2500});
const after=await mp.locator('.sheet-front').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(before,after,'normal-motion controls must change actual sheet transform');await motion.close();
console.log(JSON.stringify({normalMotionSceneControls:true,localizedLayoutChecks:checks,noJSLanguageNavigation:true,loadedImages:true,sceneControls:true,reducedMotion:true,themeToggle:true,zeroCookies:true,zeroExternalRequests:true}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
