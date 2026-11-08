/* FOODHUNT Google Maps Embed integration smoke test.
   Google HTTP responses and browser GPS are mocked; no billable Google requests.
   Test an actual restricted key in Google Cloud separately before calling it live. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const origin='http://127.0.0.1:4173/';
const fakeBrowserKey='AIza'+'A'.repeat(35);
const errors=[];
try{
 const context=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,
  geolocation:{latitude:53.44000,longitude:10.36000},
  permissions:['geolocation']
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 let googleRequests=0,osmRequests=0;
 const leafletCss=await fs.readFile('node_modules/leaflet/dist/leaflet.css');
 const leafletJs=await fs.readFile('node_modules/leaflet/dist/leaflet.js');
 await page.route(/https:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com)\/.*leaflet(?:@1\.9\.4)?\/dist\/leaflet\.(?:css|js)/,route=>{
  const url=route.request().url();
  return route.fulfill({
   status:200,
   body:url.endsWith('.css')?leafletCss:leafletJs,
   contentType:url.endsWith('.css')?'text/css':'text/javascript',
   headers:{'access-control-allow-origin':'*'}
  });
 });
 await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({status:204}));
 await page.route('https://overpass-api.de/api/interpreter?**',route=>{
  osmRequests++;
  return route.fulfill({
   status:200,contentType:'application/json',
   headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({elements:[{
    type:'node',id:99101,lat:53.4402,lon:10.3602,
    tags:{name:'Fixture Restaurant',amenity:'restaurant',cuisine:'burger'}
   }]})
  });
 });
 await page.route('https://www.google.com/maps/embed/v1/search?**',route=>{
  googleRequests++;
  return route.fulfill({
   status:200,contentType:'text/html',
   headers:{'access-control-allow-origin':'*'},
   body:'<!doctype html><html><body>Google Maps Embed mock only</body></html>'
  });
 });
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.locator('.mobile-nav-link[data-view="nearby"]').click();
 assert.equal(await page.locator('#radarProviderFoodhunt').getAttribute('aria-pressed'),'true');
 assert.ok((await page.locator('#radarGoogleOpen').getAttribute('href')).startsWith('https://www.google.com/maps/search/'));

 // Without billing/key, Google must never load. Offer explicit setup instead.
 await page.locator('#radarProviderGoogle').click();
 await page.locator('#radarGoogleSetup').waitFor({state:'visible'});
 assert.equal(googleRequests,0);
 assert.equal(await page.locator('#radarProviderFoodhunt').getAttribute('aria-pressed'),'true');
 await page.locator('#radarGoogleKeyInput').fill('wrong');
 await page.locator('#radarGoogleSave').click();
 assert.match(await page.locator('#radarGoogleSetupStatus').innerText(),/gültigen Google Maps API-Schlüssel/);
 assert.equal(googleRequests,0);

 // A valid-looking restricted test key switches to Google and stays browser-local.
 await page.locator('#radarGoogleKeyInput').fill(fakeBrowserKey);
 await page.locator('#radarGoogleSave').click();
 await page.locator('#radarGoogleSetup').waitFor({state:'hidden'});
 assert.equal(await page.locator('#radarProviderGoogle').getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>localStorage.getItem('foodhunt-google-embed-key-v1')),fakeBrowserKey);

 await page.locator('#radarLocate').click();
 await page.waitForFunction(()=>document.querySelector('#radarGoogleIframe')?.src.includes('maps/embed/v1/search'),null,{timeout:15000});
 await page.waitForTimeout(700);
 const src=await page.locator('#radarGoogleIframe').getAttribute('src');
 const url=new URL(src);
 assert.equal(url.origin,'https://www.google.com');
 assert.equal(url.pathname,'/maps/embed/v1/search');
 assert.equal(url.searchParams.get('key'),fakeBrowserKey);
 assert.equal(url.searchParams.get('center'),'53.44000,10.36000');
 assert.equal(url.searchParams.get('zoom'),'14');
 assert.ok(googleRequests>0,'Google iframe must be loaded with simulated request');
 assert.equal(osmRequests,0,'OSM discovery must not auto-run while Google is selected');
 assert.equal(await page.locator('.radar-google-active').count(),1);

 // Category and radius update Google's own search region without a page reload.
 await page.selectOption('#radarCategory','burger');
 await page.selectOption('#radarRadius','5');
 await page.waitForFunction(()=>new URL(document.querySelector('#radarGoogleIframe').src).searchParams.get('zoom')==='12',null,{timeout:10000});
 const updated=new URL(await page.locator('#radarGoogleIframe').getAttribute('src'));
 assert.match(updated.searchParams.get('q'),/Burger/);
 assert.equal(updated.searchParams.get('zoom'),'12');

 // External search always works without a billable Google API.
 const ext=await page.locator('#radarGoogleOpen').getAttribute('href');
 assert.match(ext,/google.com\/maps\/search/);
 assert.match(decodeURIComponent(ext),/Burger/);

 // Switching back restores the existing map and Overpass data.
 await page.locator('#radarProviderFoodhunt').click();
 await page.waitForFunction(()=>document.querySelectorAll('.radar-result-external').length>0,null,{timeout:20000});
 assert.ok(osmRequests>0,'FOODHUNT discovery resumes after switching from Google');
 assert.equal(await page.locator('#radarProviderFoodhunt').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#radarGoogleWrap').isVisible(),false);
 assert.equal(await page.locator('#radarGoogleIframe').getAttribute('src'),'about:blank');

 // Saved key persists after reload, so the preferred provider can be restored.
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('.mobile-nav-link[data-view="nearby"]').click();
 assert.equal(await page.locator('#radarProviderGoogle').getAttribute('aria-pressed'),'false',
  'Remembered preference is FOODHUNT after explicit switch');

 // Switching back to Google works without entering key again.
 await page.locator('#radarProviderGoogle').click();
 assert.equal(await page.locator('#radarProviderGoogle').getAttribute('aria-pressed'),'true');
 await page.locator('#radarLocate').click();
 await page.waitForFunction(()=>document.querySelector('#radarGoogleIframe')?.src.includes('embed/v1/search'),null,{timeout:15000});
 await page.locator('#radarGoogleSettings').click();
 await page.locator('#radarGoogleKeyRemove').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('foodhunt-google-embed-key-v1')),null);
 assert.equal(await page.locator('#radarProviderFoodhunt').getAttribute('aria-pressed'),'true');
 assert.equal(errors.length,0,'No uncaught page errors: '+errors.join(' | '));

 await fs.mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/google-radar-390.png'});
 console.log('PASS: Google Maps setup gated by restricted browser key, native search iframe, radius/cuisine and no OSM calls in Google mode');
 console.log('PASS: External Google Maps link, fallback to FOODHUNT map, local key save/remove and page reload');
 console.log('PASS: No uncaught browser errors');
 await context.close();
}catch(e){
 console.error('GOOGLE RADAR SMOKE FAILED',e);
 console.error('Browser errors:',errors);
 process.exitCode=1;
}finally{
 await browser.close();
}
