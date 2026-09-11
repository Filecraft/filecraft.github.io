const path=require('node:path');
const root=process.env.PREPARE_ROOT||path.resolve(__dirname,'../../Filecraft');
const {chromium}=require(path.join(root,'portable/node_modules/playwright'));
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();
 const base=process.argv[2]||'http://127.0.0.1:8892';const requests=[];
 page.on('request',r=>requests.push(r.url()));
 try{
  await page.goto(base+'/');await page.waitForLoadState('networkidle');
  assert.deepEqual(await context.cookies(),[],'Site must not set cookies');
  assert.equal(await page.locator('img:not([alt])').count(),0,'Every image must have alt text');
  assert.equal(await page.evaluate(()=>localStorage.length),0,'Marketing site must not create local storage');
  assert(requests.every(u=>new URL(u).origin===new URL(base).origin),'No third-party page resources');
  await page.goto(base+'/workspace/');await page.waitForLoadState('networkidle');
  await context.setOffline(true);const offlineRequests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))offlineRequests.push(r.url())});
  await page.locator('#sample').click();await page.waitForFunction(()=>document.querySelectorAll('#pages li').length===1);
  await page.locator('#prepare').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Output parsed'));
  await page.locator('#reviewed').check();const event=page.waitForEvent('download');await page.locator('#download').click();
  const download=await event;assert(await download.path());assert.deepEqual(offlineRequests,[]);
  console.log(JSON.stringify({cookies:0,thirdPartyResources:0,missingAlt:0,hostedThenOfflineExport:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
