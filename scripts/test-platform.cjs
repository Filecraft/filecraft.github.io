const assert=require('node:assert/strict');const {detectPlatform}=require('../platform.js');
for(const [ua,platform,touch,want] of [['Mozilla Android Linux','Linux armv8',5,'android'],['Mozilla Windows NT','Win32',0,'windows'],['Mozilla Macintosh','MacIntel',0,'macos'],['Mozilla Linux','Linux x86_64',0,'linux'],['Mozilla iPad','MacIntel',5,'unknown'],['Mozilla iPhone','iPhone',5,'unknown'],['','',0,'unknown']])assert.equal(detectPlatform(ua,platform,touch),want);
console.log('PASS OS detection with Android precedence, iPad exclusion and unknown fallback');
