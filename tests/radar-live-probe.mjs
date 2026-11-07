// Best-effort live CORS/API probe from a browser origin.
// Uses public Geesthacht city-centre coordinates, never the user's private GPS.
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{
  const loc={lat:53.4400,lon:10.3600}; // illustrative city centre, not any user's position
  const query='[out:json][timeout:10];node(around:800,'+loc.lat+','+loc.lon+')['+
   '"amenity"~"^(restaurant|fast_food|cafe)$"'+']['+'"name"'+'];out 50;';
  const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter'];
  const attempts=[];
  for(const provider of endpoints){
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),14000);
   try{
    const response=await fetch(provider+'?data='+encodeURIComponent(query),{
     headers:{'Accept':'application/json'},signal:controller.signal
    });
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json();
    if(!Array.isArray(data.elements))throw new Error('Invalid JSON response shape');
    return {ok:true,provider,count:data.elements.length,attempts};
   }catch(error){attempts.push({provider,error:String(error.message||error)});}
   finally{clearTimeout(timer);}
  }
  return {ok:false,attempts};
 });
 if(result.ok){
  console.log('LIVE API PASS: browser CORS request succeeded via '+result.provider+
   ', named restaurant nodes returned: '+result.count);
  if(result.attempts.length)console.log('Previous provider errors:',JSON.stringify(result.attempts));
 }else{
  console.warn('LIVE API WARNING: both public Overpass endpoints failed this probe: '+
   JSON.stringify(result.attempts));
  process.exitCode=1;
 }
}finally{await browser.close();}
