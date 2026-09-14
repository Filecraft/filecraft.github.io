(function(){'use strict';
function detectPlatform(ua,platform,touch=0){if(/Android/i.test(ua))return'android';if(/iPad|iPhone|iPod/i.test(ua)||(/Mac/i.test(platform)&&touch>1))return'unknown';if(/Windows/i.test(ua)||/Win/i.test(platform))return'windows';if(/Mac/i.test(ua+' '+platform))return'macos';if(/Linux/i.test(ua+' '+platform))return'linux';return'unknown';}
// Which macOS build to offer. The GPU renderer is a direct signal; the client-hint
// architecture is trusted only when it reports arm: a withheld hint set reports the default
// x86, which cannot be told apart from a genuine Intel answer. Apple Silicon is the stated
// fallback, every label names the architecture it offers, and the visitor can switch the
// chosen build in one click, so the guess is never a dead end.
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
const detected=detectPlatform(navigator.userAgent,navigator.platform,navigator.maxTouchPoints);
select(detected==='unknown'?'all':detected);
// The landing page's hero offers one installer and the download page lists the macOS builds.
// Both carry per-platform targets generated from the published inventory, so a visitor is
// offered their own build and can switch architecture in one click. The static markup keeps
// the Windows build as the default for visitors without JavaScript.
const rendererString=()=>{try{const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl'),info=gl&&gl.getExtension('WEBGL_debug_renderer_info');return info?String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)||''):'';}catch(error){return'';}};
const hintArchitecture=()=>{const data=navigator.userAgentData;if(!data||!data.getHighEntropyValues)return Promise.resolve('');return data.getHighEntropyValues(['architecture']).then(values=>String(values.architecture||'')).catch(()=>'');};
const macArchitecture=()=>hintArchitecture().then(hint=>selectMacArchitecture(rendererString(),hint));
const hero=document.querySelector('[data-download-urls]');
const choosers=[...document.querySelectorAll('[data-arch-chooser]')],choices=[...document.querySelectorAll('[data-arch-choice]')];
function pointHeroAt(key){if(!hero)return;const urls=JSON.parse(hero.dataset.downloadUrls||'{}'),labels=JSON.parse(hero.dataset.downloadLabels||'{}'),label=hero.querySelector('.hero-download-label');if(urls[key])hero.setAttribute('href',urls[key]);if(label&&labels[key])label.textContent=labels[key];}
function showArchitecture(key){
  choices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.archChoice===key)));
  pointHeroAt(key);
  const macs=cards.filter(card=>card.dataset.architecture),chosen=macs.find(card=>card.dataset.architecture===key);
  if(!macs.length)return;
  macs.forEach(card=>{const marker=card.querySelector('.arch-recommended');if(card===chosen){if(!marker&&card.querySelector('div')){const line=document.createElement('p');line.className='fine arch-recommended';line.textContent='Recommended for your Mac.';card.querySelector('div').appendChild(line);}}else if(marker)marker.remove();});
  // Lead with the visitor's own build in every view, including "All"; the other macOS
  // build stays one click away in the same list.
  if(chosen){const list=chosen.parentNode,first=list&&list.firstElementChild;if(first&&first!==chosen)list.insertBefore(chosen,first);}
}
choices.forEach(button=>button.addEventListener('click',()=>showArchitecture(button.dataset.archChoice)));
if(detected==='windows'||detected==='linux')pointHeroAt(detected);
if(detected==='macos')macArchitecture().then(key=>{choosers.forEach(box=>{box.hidden=false;});showArchitecture(key);});
})();
