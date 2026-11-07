// FOODHUNT Radar browser smoke test.
// Real Chromium DOM + Leaflet; geolocation/OSM data are controlled fixtures.
// The test does not claim that public live Overpass/OSM services are always up.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base='http://127.0.0.1:4173/';
const fixture={elements:[
 {type:'node',id:91001,lat:53.4401,lon:10.3602,tags:{name:'Fixture Burger',amenity:'restaurant',cuisine:'burger'}},
 {type:'node',id:91002,lat:53.4408,lon:10.3609,tags:{name:'Fixture Kebab',amenity:'fast_food',cuisine:'kebab'}},
 {type:'way',id:91003,center:{lat:53.4392,lon:10.3593},tags:{name:'Fixture Café',amenity:'cafe'}}
]};
const onePixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5VNd0AAAAASUVORK5CYII=','base64');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
async function setup(page,{manual=false}={}){
 page.on('pageerror',error=>errors.push(error.message));
 const css=await fs.readFile('node_modules/leaflet/dist/leaflet.css');
 const library=await fs.readFile('node_modules/leaflet/dist/leaflet.js');
 await page.route(/https:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com)\/.*leaflet(?:@1\.9\.4)?\/dist\/leaflet\.(?:css|js)/,route=>{
  const url=route.request().url();
  return route.fulfill({
   status:200,body:url.endsWith('.css')?css:library,
   contentType:url.endsWith('.css')?'text/css':'text/javascript',
   headers:{'access-control-allow-origin':'*'}
  });
 });
 await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({status:200,body:onePixel,contentType:'image/png'}));
 let secondaryHits=0;
 await page.route('https://overpass-api.de/api/interpreter?**',route=>route.fulfill({status:503,body:'rate limited',headers:{'access-control-allow-origin':'*'}}));
 await page.route('https://overpass.private.coffee/api/interpreter?**',route=>{
  secondaryHits++;
  return route.fulfill({status:200,body:JSON.stringify(fixture),contentType:'application/json',headers:{'access-control-allow-origin':'*'}});
 });
 if(manual){
  await page.route('https://nominatim.openstreetmap.org/search?**',route=>route.fulfill({
   status:200,
   body:JSON.stringify([{lat:'53.4400',lon:'10.3600',display_name:'Geesthacht, Schleswig-Holstein, Deutschland'}]),
   contentType:'application/json',headers:{'access-control-allow-origin':'*'}
  }));
 }
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 return ()=>secondaryHits;
}
async function expectRadar(page){
 await page.waitForFunction(()=>document.querySelectorAll('.radar-result-external').length===3,null,{timeout:30000});
 await page.waitForFunction(()=>document.querySelectorAll('.fh-radar-icon').length>=3,null,{timeout:30000});
 const isMapReady=await page.evaluate(()=>Boolean(window.L&&document.querySelector('#radarMap .leaflet-map-pane')));
 assert.ok(isMapReady,'Leaflet map must mount');
 assert.match(await page.locator('#radarDiscoveryStatus').innerText(),/3 Restaurants aus OpenStreetMap geladen/);
 assert.equal(await page.locator('.radar-result-external').count(),3);
}
try{
 const gpsContext=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,
  geolocation:{latitude:53.4400,longitude:10.3600},
  permissions:['geolocation']
 });
 const gps=await gpsContext.newPage();
 const secondaryHits=await setup(gps);
 await gps.locator('.mobile-nav-link[data-view="nearby"]').click();
 await gps.locator('#radarLocate').click();
 await expectRadar(gps);
 assert.ok(secondaryHits()>0,'fallback Overpass endpoint must be used after primary 503');
 await gps.locator('[data-discover-save]').first().click();
 const saved=await gps.evaluate(()=>JSON.parse(localStorage.getItem('foodhunt-spots-v1')||'[]'));
 assert.ok(saved.some(s=>s.name.startsWith('Fixture ')),'Discovered restaurant should be added to user list');
 await fs.mkdir('artifacts',{recursive:true});
 await gps.screenshot({path:'artifacts/radar-iphone-390.png'});
 console.log('PASS: iPhone 390px — GPS, Overpass fallback, map pins, save restaurant');
 await gpsContext.close();

 const manualContext=await browser.newContext({viewport:{width:360,height:780},deviceScaleFactor:2});
 const manual=await manualContext.newPage();
 await setup(manual,{manual:true});
 await manual.locator('.mobile-nav-link[data-view="nearby"]').click();
 await manual.locator('#radarPlaceInput').fill('Geesthacht');
 await manual.locator('#radarPlaceSearch').click();
 await expectRadar(manual);
 assert.match(await manual.locator('#radarStatus').innerText(),/Suchort: Geesthacht/);
 await manual.screenshot({path:'artifacts/radar-iphone-360-manual.png'});
 console.log('PASS: iPhone 360px — manual city search without geolocation permission');
 await manualContext.close();
 assert.equal(errors.length,0,'No page errors expected: '+errors.join(' | '));
 console.log('PASS: Browser runtime reports no uncaught JS errors');
}catch(error){
 console.error('RADAR SMOKE FAILED:',error);
 console.error('Page errors:',errors);
 process.exitCode=1;
}finally{
 await browser.close();
}
