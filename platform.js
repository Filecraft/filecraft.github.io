(function(){'use strict';
function detectPlatform(ua,platform,touch=0){if(/Android/i.test(ua))return'android';if(/iPad|iPhone|iPod/i.test(ua)||(/Mac/i.test(platform)&&touch>1))return'unknown';if(/Windows/i.test(ua)||/Win/i.test(platform))return'windows';if(/Mac/i.test(ua+' '+platform))return'macos';if(/Linux/i.test(ua+' '+platform))return'linux';return'unknown';}
// Which macOS build to offer. The GPU renderer is a direct signal; the client-hint
// architecture is trusted only when it reports arm, because a withheld hint set reports
// the default x86 and is indistinguishable from a real Intel Mac averaged over nothing.
// Apple Silicon is the stated fallback, and every label names the architecture it offers.
function selectMacArchitecture(renderer,hintArchitecture){
  if(/Apple M|Apple GPU|Apple Silicon/i.test(renderer||''))return'macos-arm64';
  if(/Intel|AMD|Radeon|NVIDIA/i.test(renderer||''))return'macos-x86';
  if(/^arm$/i.test(hintArchitecture||''))return'macos-arm64';
  return'macos-arm64';
}
if(typeof module!=='undefined')module.exports={detectPlatform,selectMacArchitecture};
if(typeof document==='undefined')return;
const buttons=[...document.querySelectorAll('[data-platform]')],cards=[...document.querySelectorAll('[data-download]')],note=document.getElementById('platform-note');
function select(key){const available=key==='all'||cards.some(c=>c.dataset.download===key);const effective=available?key:'all';buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===effective)));cards.forEach(c=>{c.hidden=effective!=='all'&&c.dataset.download!==effective;});if(note)note.textContent=!available?`No ${key} package in this release inventory. Showing all downloads; see Platforms for historical/mobile guidance.`:key==='all'?'All published packages. Choose your architecture and read installation limits.':`Showing ${key==='macos'?'macOS':key} packages. Choose your architecture; detection cannot confirm CPU compatibility.`;}
buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.platform)));
const detected=detectPlatform(navigator.userAgent,navigator.platform,navigator.maxTouchPoints);select(detected==='unknown'?'all':detected);
// The landing page's hero offers one installer. It carries the per-platform targets
// generated from the published inventory, so the visitor is offered their own build
// instead of the Windows one. Windows remains the static default for no-JS visitors.
const hero=document.querySelector('[data-download-urls]');
if(hero){
  const urls=JSON.parse(hero.dataset.downloadUrls||'{}'),labels=JSON.parse(hero.dataset.downloadLabels||'{}'),label=hero.querySelector('.hero-download-label');
  const apply=key=>{if(!key||!urls[key])return;hero.setAttribute('href',urls[key]);if(label&&labels[key])label.textContent=labels[key];};
  const rendererString=()=>{try{const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl'),info=gl&&gl.getExtension('WEBGL_debug_renderer_info');return info?String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)||''):'';}catch(error){return'';}};
  const hintArchitecture=()=>{const data=navigator.userAgentData;if(!data||!data.getHighEntropyValues)return Promise.resolve('');return data.getHighEntropyValues(['architecture']).then(values=>String(values.architecture||'')).catch(()=>'');};
  const detected=detectPlatform(navigator.userAgent,navigator.platform,navigator.maxTouchPoints);
  if(detected==='windows'||detected==='linux')apply(detected);
  else if(detected==='macos')hintArchitecture().then(hint=>apply(selectMacArchitecture(rendererString(),hint)));
}
})();
