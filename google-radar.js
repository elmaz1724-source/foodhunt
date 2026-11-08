/* FOODHUNT V17 — Google Maps Embed adapter.
   Google controls its own Search iframe. We do not scrape or store Google's
   restaurant names, photos, ratings or reviews.
   A restricted Maps Embed API browser key is required for the in-app iframe.
   Without a key, the working FOODHUNT/OSM map remains available. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const radar=window.FOODHUNT_RADAR;
 const root=$('radarSection');
 if(!root||!radar)return;
 const storeKey='foodhunt-google-embed-key-v1';
 const preferenceKey='foodhunt-map-provider-v1';
 const browserKey=/^AIza[0-9A-Za-z_-]{25,80}$/;
 const read=(key)=>{try{return localStorage.getItem(key)||''}catch{return ''}};
 const write=(key,value)=>{try{if(value)localStorage.setItem(key,value);else localStorage.removeItem(key);return true}catch{return false}};
 const configuredKey=()=>{
   const deployed=String(window.FOODHUNT_GOOGLE_MAPS_EMBED_KEY||'').trim();
   if(browserKey.test(deployed))return deployed;
   const personal=String(read(storeKey)).trim();
   return browserKey.test(personal)?personal:'';
 };
 let provider='foodhunt',setupOpen=false,oldFrameUrl='';
 const googleButton=$('radarProviderGoogle');
 const foodhuntButton=$('radarProviderFoodhunt');
 const wrap=$('radarGoogleWrap'),frame=$('radarGoogleIframe'),setup=$('radarGoogleSetup');
 const setupStatus=$('radarGoogleSetupStatus');
 const categoryQueries={
  burger:'Burger',doener:'Döner',shawarma:'Shawarma',pizza:'Pizza',
  italian:'Italienisches Restaurant',steak:'Steakhouse',chicken:'Chicken',
  asian:'Asiatisches Restaurant',sushi:'Sushi',ramen:'Ramen',
  desserts:'Café und Desserts',street:'Street Food',
  balkan:'Balkan Restaurant',albanian:'Albanisches Restaurant'
 };
 const currentTerm=()=>categoryQueries[radar.getCategory()]||'Restaurants';
 const coords=()=>radar.getPosition();
 const searchPhrase=()=>{
   const p=coords();
   return p?currentTerm()+' near '+p.lat.toFixed(5)+','+p.lon.toFixed(5):currentTerm();
 };
 const zoom=()=>{
   const r=radar.getRadius();
   return r<=.5?16:r<=1?15:r<=2?14:r<=5?12:r<=10?11:10;
 };
 const googleSearchUrl=()=>{
   const url=new URL('https://www.google.com/maps/search/');
   url.searchParams.set('api','1');
   url.searchParams.set('query',searchPhrase());
   return url.toString();
 };
 const embedUrl=key=>{
   const p=coords();
   if(!p)return '';
   const url=new URL('https://www.google.com/maps/embed/v1/search');
   url.searchParams.set('key',key);
   url.searchParams.set('q',searchPhrase());
   url.searchParams.set('center',p.lat.toFixed(5)+','+p.lon.toFixed(5));
   url.searchParams.set('zoom',String(zoom()));
   url.searchParams.set('language','de');
   return url.toString();
 };
 function updateExternal(){
   const url=googleSearchUrl();
   $('radarGoogleOpen').href=url;
   $('radarExternalSearch').href=url;
 }
 function hideFrame(){
   wrap.classList.add('hidden');
   if(oldFrameUrl){
     frame.src='about:blank';
     oldFrameUrl='';
   }
 }
 function showSetup(){
   setupOpen=true;
   setup.classList.remove('hidden');
   setupStatus.textContent='';
   $('radarGoogleKeyInput').value='';
   $('radarGoogleKeyRemove').classList.toggle('hidden',!read(storeKey));
   googleButton.setAttribute('aria-pressed','false');
   foodhuntButton.setAttribute('aria-pressed','true');
   root.classList.remove('radar-google-active');
   hideFrame();
   $('radarGoogleKeyInput').focus({preventScroll:true});
 }
 function hideSetup(){
   setupOpen=false;
   setup.classList.add('hidden');
 }
 function updateProvider(){
   updateExternal();
   const googleActive=provider==='google'&&Boolean(configuredKey())&&!setupOpen;
   root.classList.toggle('radar-google-active',googleActive);
   googleButton.classList.toggle('selected',googleActive);
   googleButton.setAttribute('aria-pressed',String(googleActive));
   foodhuntButton.classList.toggle('selected',!googleActive);
   foodhuntButton.setAttribute('aria-pressed',String(!googleActive));
   if(!googleActive){hideFrame();return;}
   // Google renders its own embedded search, not FOODHUNT's scored result cards.
   const p=coords();
   if(!p){hideFrame();return;}
   const url=embedUrl(configuredKey());
   if(!url){hideFrame();return;}
   wrap.classList.remove('hidden');
   $('radarMapCover').classList.add('hidden');
   if(url!==oldFrameUrl){
     frame.src=url;
     oldFrameUrl=url;
   }
 }
 function setProvider(next){
   if(next==='google'&&!configuredKey()){
     provider='foodhunt';
     showSetup();
     return;
   }
   hideSetup();
   provider=next==='google'?'google':'foodhunt';
   write(preferenceKey,provider);
   updateProvider();
   if(provider==='foodhunt'&&radar.getPosition()){
     radar.refresh();
     document.dispatchEvent(new Event('foodhunt:radar-open'));
   }
 }
 function refresh(){
   updateProvider();
 }
 window.FOODHUNT_GOOGLE_RADAR={
   isActive:()=>provider==='google'&&!!configuredKey()&&!setupOpen,
   getProvider:()=>provider,
   refresh
 };
 googleButton.addEventListener('click',()=>setProvider('google'));
 foodhuntButton.addEventListener('click',()=>setProvider('foodhunt'));
 $('radarGoogleSettings').addEventListener('click',showSetup);
 $('radarGoogleCancel').addEventListener('click',()=>{
   hideSetup();
   if(provider==='google'&&configuredKey())updateProvider();
   else setProvider('foodhunt');
 });
 $('radarGoogleKeyForm').addEventListener('submit',e=>{
   e.preventDefault();
   const value=$('radarGoogleKeyInput').value.trim();
   if(!browserKey.test(value)){
     setupStatus.textContent='Bitte einen gültigen Google Maps API-Schlüssel (AIza…) eintragen.';
     return;
   }
   if(!write(storeKey,value)){
     setupStatus.textContent='Der Browser kann den Schlüssel nicht speichern. Bitte den privaten Modus prüfen.';
     return;
   }
   $('radarGoogleKeyInput').value='';
   hideSetup();
   provider='google';
   write(preferenceKey,provider);
   updateProvider();
   // An iframe load cannot confirm whether Google accepted credentials.
   $('radarGoogleKeyInput').value='';
 });
 $('radarGoogleKeyRemove').addEventListener('click',()=>{
   write(storeKey,'');
   write(preferenceKey,'foodhunt');
   provider='foodhunt';
   hideSetup();
   updateProvider();
   radar.refresh();
   if(radar.getPosition())document.dispatchEvent(new Event('foodhunt:radar-open'));
 });
 document.addEventListener('foodhunt:radar-position',refresh);
 document.addEventListener('foodhunt:radar-open',refresh);
 $('radarRadius').addEventListener('change',refresh);
 $('radarCategory').addEventListener('change',refresh);
 frame.addEventListener('error',()=>{
   $('radarGoogleFrameStatus').textContent='Google Maps konnte nicht geladen werden. Prüfe API-Schlüssel, Abrechnung und Website-Freigabe.';
 });
 // No API key is committed in source or sent to FOODHUNT servers.
 if(read(preferenceKey)==='google'&&configuredKey())provider='google';
 updateProvider();
})();