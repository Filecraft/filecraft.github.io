(function(){'use strict';
function detectPlatform(ua,platform,touch=0){if(/Android/i.test(ua))return'android';if(/iPad|iPhone|iPod/i.test(ua)||(/Mac/i.test(platform)&&touch>1))return'unknown';if(/Windows/i.test(ua)||/Win/i.test(platform))return'windows';if(/Mac/i.test(ua+' '+platform))return'mac';if(/Linux/i.test(ua+' '+platform))return'linux';return'unknown';}
if(typeof module!=='undefined')module.exports={detectPlatform};
if(typeof document==='undefined')return;
const buttons=[...document.querySelectorAll('[data-platform]')],cards=[...document.querySelectorAll('[data-download]')],note=document.getElementById('platform-note');
function select(key){const available=key==='all'||cards.some(c=>c.dataset.download===key);const effective=available?key:'all';buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===effective)));cards.forEach(c=>{c.hidden=effective!=='all'&&c.dataset.download!==effective;});if(note)note.textContent=!available?`No ${key} package in this release inventory. Showing all downloads; see Platforms for historical/mobile guidance.`:key==='all'?'All published packages. Choose your architecture and read installation limits.':`Showing ${key==='mac'?'macOS':key} packages. Choose your architecture; detection cannot confirm CPU compatibility.`;}
buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.platform)));
const detected=detectPlatform(navigator.userAgent,navigator.platform,navigator.maxTouchPoints);select(detected==='unknown'?'all':detected);
})();
