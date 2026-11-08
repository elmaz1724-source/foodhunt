// FOODHUNT V18 visual/behavior smoke; uses real Chromium at desktop and mobile sizes.
// Network-dependent OSM, Google Maps, and actual iOS Safari are tested separately.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
await fs.mkdir('artifacts',{recursive:true});
const checkWidth=async(page,label)=>{
  const metrics=await page.evaluate(()=>({
    viewport:window.innerWidth,
    doc:document.documentElement.scrollWidth,
    body:document.body.scrollWidth,
    heading:document.querySelector('.hero h1')?.textContent?.trim()||'',
    navCount:document.querySelectorAll('.mobile-bottom-nav button').length,
    spotCount:document.querySelectorAll('#spotGrid .spot-card').length
  }));
  assert.ok(metrics.doc<=metrics.viewport+1,label+' horizontal overflow: '+JSON.stringify(metrics));
  console.log('VIEWPORT '+label+' '+JSON.stringify(metrics));
};
const setup=async(viewport,reducedMotion='no-preference')=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:2,reducedMotion});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e.message)));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('#spotGrid .spot-card').length>0,null,{timeout:15000});
 return{context,page};
};
try{
 const desktop=await setup({width:1440,height:900});
 await checkWidth(desktop.page,'desktop-1440-home');
 const skip=desktop.page.locator('.skip-to-content');
 assert.equal(await skip.count(),1);
 await desktop.page.keyboard.press('Tab');
 assert.equal(await desktop.page.evaluate(()=>document.activeElement?.classList.contains('skip-to-content')),true,
  'skip link must receive first keyboard focus');
 await desktop.page.keyboard.press('Enter');
 assert.equal(await desktop.page.evaluate(()=>document.activeElement?.id),'home',
  'skip link must target main landmark');
 await desktop.page.screenshot({path:'artifacts/foodhunt-desktop-1440.png'});
 console.log('PASS: desktop 1440px, visible skip-navigation and main landmark');
 await desktop.context.close();

 for(const width of [390,360]){
  const {context,page}=await setup({width,height:844});
  await checkWidth(page,'mobile-'+width+'-home');
  assert.equal(await page.locator('.mobile-bottom-nav button').count(),5);
  const img=page.locator('.hero-real-photo');
  assert.equal(await img.getAttribute('width'),'1100');
  assert.equal(await img.getAttribute('height'),'825');
  const font=await page.locator('.mobile-nav-link[data-view="discover"]').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  assert.ok(font>=10,'nav text below 10px at '+width+': '+font);
  await page.screenshot({path:'artifacts/foodhunt-mobile-'+width+'-home.png'});
  await page.locator('.mobile-nav-link[data-view="discover"]').click();
  await page.locator('#searchInput').fill('zzzz-no-such-restaurant-12345');
  await page.waitForFunction(()=>document.querySelectorAll('#spotGrid .spot-card').length===0,null,{timeout:10000});
  assert.match(await page.locator('#resultsLabel').innerText(),/0/);
  await page.locator('#searchInput').fill('');
  await page.waitForFunction(()=>document.querySelectorAll('#spotGrid .spot-card').length>0,null,{timeout:10000});
  await checkWidth(page,'mobile-'+width+'-browse');
  if(width===390)await page.screenshot({path:'artifacts/foodhunt-mobile-390-browse.png'});

  await page.locator('.mobile-nav-link[data-view="profile"]').click();
  await checkWidth(page,'mobile-'+width+'-profile');
  assert.equal(await page.locator('#profileSection').count(),1);
  if(width===390)await page.screenshot({path:'artifacts/foodhunt-mobile-390-profile.png'});
  await page.locator('#mobileCreateSpot').click();
  await page.locator('#modalBackdrop').waitFor({state:'visible'});
  assert.equal(await page.locator('#modalBackdrop [role="dialog"]').getAttribute('aria-modal'),'true');
  await checkWidth(page,'mobile-'+width+'-modal');
  if(width===390)await page.screenshot({path:'artifacts/foodhunt-mobile-390-modal.png'});
  await page.keyboard.press('Escape');
  await page.locator('#modalBackdrop').waitFor({state:'hidden'});
  await page.locator('.mobile-nav-link[data-view="nearby"]').click();
  await checkWidth(page,'mobile-'+width+'-radar');
  assert.equal(await page.locator('#radarProviderFoodhunt').getAttribute('aria-pressed'),'true');
  assert.ok((await page.locator('#radarGoogleOpen').getAttribute('href')).startsWith('https://www.google.com/maps/search/'));
  assert.equal(errors.length,0,'unexpected JS errors: '+errors.join(' | '));
  console.log('PASS: '+width+'px search/debounce, 5-nav, profile, modal, radar, no overflow');
  await context.close();
 }
 const reduced=await setup({width:390,height:844},'reduce');
 const dur=await reduced.page.locator('.spot-card').first().evaluate(e=>getComputedStyle(e).transitionDuration);
 assert.ok(dur.split(',').every(x=>parseFloat(x)===0),'reduced-motion transition not disabled: '+dur);
 console.log('PASS: reduced-motion card transitions disabled');
 await reduced.context.close();
 console.log('PASS: UI smoke clean, no runtime JS errors');
}catch(err){
 console.error('FOODHUNT UI QUALITY SMOKE FAILED',err);
 console.error('Page errors',errors);
 process.exitCode=1;
}finally{
 await browser.close();
}
