(()=>{
'use strict';
const $=id=>document.getElementById(id);
const panel=$('radarSection');
if(!panel||!window.FOODHUNT_API)return;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const valid=(lat,lon)=>lat!==null&&lat!==undefined&&lon!==null&&lon!==undefined&&Number.isFinite(Number(lat))&&Number.isFinite(Number(lon))&&Number(lat)>=-90&&Number(lat)<=90&&Number(lon)>=-180&&Number(lon)<=180;
const rad=n=>n*Math.PI/180;
const distance=(a,b,c,d)=>{const dl=rad(c-a),do_=rad(d-b),h=Math.sin(dl/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(do_/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)))};
const meters=km=>km<1?Math.round(km*1000/10)*10+' m':km.toFixed(1).replace('.',',')+' km';
const rating=s=>(s.score!==null&&s.score!==undefined&&Number.isFinite(Number(s.score)))?Number(s.score):null;
const format=n=>Number(n).toFixed(1).replace('.',',');
const getData=()=>window.FOODHUNT_API.getSpots();
const getCategories=()=>window.FOODHUNT_API.getCategories();
let position=null,map=null,markerLayer=null,userMarker=null,radiusCircle=null,loadPromise=null,lastGeocode=0,geocoding=false,geocodeMatches=[];
let discovered=[],discoverLoading=false,lastDiscovery=null,discoverBackoffUntil=0,requestSerial=0,discoverTimer=null;
const status=(message,mode='')=>{const e=$('radarStatus');e.textContent=message;e.dataset.mode=mode};
const marked=s=>valid(s.latitude,s.longitude);
const radius=()=>Number($('radarRadius').value)||2;
const hasCoords=()=>getData().filter(marked);
function available(){
 const all=getData(),located=all.filter(marked);
 const missing=all.filter(s=>!marked(s));
 $('radarMissingInfo').textContent=located.length+' von '+all.length+' Spots mit bestätigtem Standort. '+missing.length+' warten noch auf eine Zuordnung.';
 const picker=$('radarSpotSelect');
 if(picker){
  const previous=picker.value;
  picker.replaceChildren();
  for(const item of missing){
   const option=document.createElement('option');
   option.value=item.id;
   option.textContent=item.name;
   picker.appendChild(option);
  }
  if(previous&&missing.some(s=>s.id===previous))picker.value=previous;
  picker.disabled=!missing.length;
 }
 $('radarAssignSpot').disabled=!missing.length;
}
/* V11: a light, user-triggered OpenStreetMap discovery layer. */
const sourceMode=()=>$('radarSource')?.value||'all';
const possibleSavedMatch=place=>{const matches=getData().filter(s=>!marked(s)&&normalizeName(s.name)===normalizeName(place.name));return matches.length===1?matches[0]:null;};
const normalizeName=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de').replace(/[^a-z0-9]/g,'');
const classify=tags=>{
 const c=String(tags.cuisine||'').toLowerCase(),amenity=String(tags.amenity||'').toLowerCase(),shop=String(tags.shop||'').toLowerCase();
 if(/burger|american/.test(c))return 'burger';
 if(/kebab|doner|turkish/.test(c))return 'doener';
 if(/shawarma|lebanese|arab/.test(c))return 'shawarma';
 if(/pizza|italian/.test(c))return 'pizza';
 if(/chicken|korean/.test(c))return 'chicken';
 if(/ramen/.test(c))return 'ramen';
 if(/sushi|japanese|thai|vietnamese|chinese|asian/.test(c))return 'asian';
 if(/steak|grill/.test(c))return 'steak';
 if(/albanian/.test(c))return 'albanian';
 if(/balkan|serbian|bosnian|croatian/.test(c))return 'balkan';
 if(/ice_cream|dessert|coffee|cake/.test(c)||shop==='pastry')return 'desserts';
 if(amenity==='cafe'||shop==='bakery')return 'desserts';
 if(amenity==='food_court')return 'street';
 return 'street';
};
const discoveryStatus=(message,mode='')=>{const e=$('radarDiscoveryStatus');if(e){e.textContent=message;e.dataset.mode=mode}};
function collectMatches(){
 if(!position)return [];
 const all=getData(),owned=all.filter(marked);
 const knownIds=new Set(owned.map(x=>String(x.osmId||'')));
 const fresh=discovered.filter(x=>{
  if(knownIds.has(x.osmId))return false;
  return !owned.some(y=>normalizeName(y.name)===normalizeName(x.name)&&distance(Number(y.latitude),Number(y.longitude),Number(x.latitude),Number(x.longitude))<.12);
 });
 let items=sourceMode()==='mine'?owned.map(spot=>({spot,external:false})):
 sourceMode()==='discover'?fresh.map(spot=>({spot,external:true})):
 [...owned.map(spot=>({spot,external:false})),...fresh.map(spot=>({spot,external:true}))];
 const selectedCategory=$('radarCategory').value,km=radius();
 items=items.map(x=>({...x,km:distance(position.lat,position.lon,Number(x.spot.latitude),Number(x.spot.longitude))})).filter(x=>x.km<=km&&(!selectedCategory||x.spot.category===selectedCategory));
 const sort=$('radarSort').value;
 const val=x=>x.external?-1:sort==='value'?Number(x.spot.valueScore??-1):rating(x.spot)??-1;
 items.sort((a,b)=>sort==='nearby'?a.km-b.km:val(b)-val(a)||a.km-b.km);
 return items.slice(0,110);
}
function showResults(){
 const list=$('radarResults'),mapped=getData().filter(marked),cats=new Map(getCategories().map(c=>[c.id,c]));
 if(!position){
  $('radarCount').textContent=mapped.length+' zugeordnet';
  list.innerHTML='<div class="radar-zero"><span aria-hidden="true">◎</span><strong>Wo bist du gerade?</strong><p>Tippe auf „Standort verwenden“. FOODHUNT findet dann auch Restaurants aus öffentlichen Kartendaten in deiner Nähe.</p></div>';
  available();return [];
 }
 const matches=collectMatches();
 $('radarCount').textContent=matches.length+(matches.length===110?'+':'')+' Spot'+(matches.length===1?'':'s');
 if(!matches.length){
  const hint=discoverLoading?'Restaurants in deiner Umgebung werden geladen …':sourceMode()==='mine'?'Du hast hier noch keine Restaurants mit gespeicherten Koordinaten. Wähle „Alle Food-Spots“, um öffentliche Restaurants zu sehen.':'Keine passenden Spots gefunden. Erhöhe den Radius, ändere die Kategorie oder probiere die Suche später erneut.';
  list.innerHTML='<div class="radar-zero"><span aria-hidden="true">⌖</span><strong>'+ (discoverLoading?'Die Food-Suche läuft':'Hier ist noch Platz für gutes Essen') +'</strong><p>'+safe(hint)+'</p></div>';
 }else{
  list.innerHTML=matches.map(({spot:s,km:d,external})=>{
   const category=cats.get(s.category)||{name:'Food',emoji:'🍽️'};
   const r=external?null:rating(s);
   const v=external||s.valueScore===null||s.valueScore===undefined?null:Number(s.valueScore);
   const products=external?[]:(Array.isArray(s.products)?s.products.filter(p=>p&&p.name&&p.score!==null&&p.score!==undefined&&Number.isFinite(Number(p.score))):[]);
   const best=products.length?[...products].sort((a,b)=>Number(b.score)-Number(a.score))[0]:null;
   const nav='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(Number(s.latitude)+','+Number(s.longitude));
   const linkCandidate=external?possibleSavedMatch(s):null;
   const detail=external?'<span class="radar-source-badge is-external">OPENSTREETMAP</span>':'<span class="radar-source-badge is-mine">MEINE LISTE</span>';
   const scoreLine=external?'<span>Keine FOODHUNT-Bewertung</span>':(r!==null?'<span>★ Meine Note: '+format(r)+'</span>':'<span>Noch nicht bewertet</span>')+(v!==null&&Number.isFinite(v)?'<span>◈ '+format(v)+'</span>':'');
   const action=external?(linkCandidate?'<button type="button" data-discover-link="'+safe(s.osmId)+'" data-target-spot="'+safe(linkCandidate.id)+'">↗ Zuordnen</button>':'<button type="button" data-discover-save="'+safe(s.osmId)+'">＋ Merken</button>'):'<button type="button" data-radar-spot="'+safe(s.id)+'">Details</button>';
   return '<article class="radar-result'+(external?' radar-result-external':'')+'"><div class="radar-result-icon">'+safe(category.emoji)+'</div><div class="radar-result-body"><div class="radar-result-topline">'+detail+'<span>'+meters(d)+'</span></div><strong>'+safe(s.name)+'</strong><div class="radar-result-ratings">'+scoreLine+'</div>'+ (linkCandidate?'<p class="radar-link-hint">Passt möglicherweise zu deinem gespeicherten Spot. Standort bestätigen.</p>':'')+(best?'<p class="radar-best">✦ Bester Bite: '+safe(best.name)+' · '+format(best.score)+'</p>':'')+'<div class="radar-result-actions">'+action+'<a href="'+safe(nav)+'" target="_blank" rel="noopener noreferrer">Route ↗</a></div></div></article>';
  }).join('');
 }
 available();return matches;
}
function parseOsmElements(data){
 const arr=Array.isArray(data?.elements)?data.elements:[];
 const seen=new Set();
 return arr.map(e=>{
  const t=e.tags||{},lat=Number(e.lat??e.center?.lat),lon=Number(e.lon??e.center?.lon),name=String(t.name||'').trim().slice(0,100);
  if(!name||!valid(lat,lon))return null;
  const osmId=String(e.type)+'/'+String(e.id);
  if(seen.has(osmId))return null;
  seen.add(osmId);
  return {id:'external-'+String(e.type)+'-'+String(e.id),osmId,name,category:classify(t),latitude:lat,longitude:lon,score:null,valueScore:null,external:true,source:'openstreetmap'};
 }).filter(Boolean);
}
async function fetchNearby({force=false}={}){
 if(!position||discoverLoading)return;
 const target=Math.min(radius(),5);
 if(!force&&lastDiscovery&&Date.now()-lastDiscovery.time<15*60*1000&&lastDiscovery.radius>=target&&distance(position.lat,position.lon,lastDiscovery.lat,lastDiscovery.lon)<.35){
  discoveryStatus(discovered.length+' neue Restaurants über OpenStreetMap gefunden (zwischengespeichert).','success');
  renderAll();return;
 }
 if(Date.now()<discoverBackoffUntil){
  discoveryStatus('Der kostenlose Kartendienst ist gerade ausgelastet. Bitte später erneut versuchen. Deine gespeicherten Spots bleiben verfügbar.','warning');return;
 }
 discoverLoading=true;
 $('radarRetry').disabled=true;
 const requestedAt={lat:position.lat,lon:position.lon};
 const ticket=++requestSerial;
 discoveryStatus('Suche Restaurants in deiner Umgebung …','loading');
 showResults();
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),22000);
 try{
  // Public Overpass is a small-use prototype source, not a production-grade backend.
  const query='[out:json][timeout:18];(nwr(around:'+Math.round(target*1000)+','+position.lat.toFixed(5)+','+position.lon.toFixed(5)+')['+'"amenity"~"^(restaurant|fast_food|cafe|food_court|ice_cream)$"'+']['+'"name"'+'];nwr(around:'+Math.round(target*1000)+','+position.lat.toFixed(5)+','+position.lon.toFixed(5)+')['+'"shop"~"^(bakery|pastry)$"'+']['+'"name"'+'];);out center 800;';
  const url='https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query);
  const response=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'}});
  if(response.status===429||response.status===503||response.status===504){discoverBackoffUntil=Date.now()+60000;throw new Error('OpenStreetMap ist zurzeit ausgelastet. Bitte in einer Minute erneut versuchen.')}
  if(!response.ok)throw new Error('Restaurants konnten gerade nicht geladen werden (HTTP '+response.status+').');
  const data=await response.json();
  if(ticket!==requestSerial)return;
  discovered=parseOsmElements(data);
  lastDiscovery={lat:requestedAt.lat,lon:requestedAt.lon,radius:target,time:Date.now()};
  const cap=radius()>5?' Für neue Restaurants ist die Suche vorerst auf 5 km begrenzt; deine eigenen Spots werden im gesamten gewählten Radius angezeigt.':'';
  discoveryStatus(discovered.length+' Restaurants aus OpenStreetMap gefunden. Öffentliche Bewertungen und Öffnungszeiten stehen noch nicht zur Verfügung.'+cap,'success');
 }catch(e){
  if(ticket!==requestSerial)return;
  discoveryStatus(e.name==='AbortError'?'Die Kartensuche hat zu lange gedauert. Bitte erneut versuchen.':(e.message||'Die Restaurant-Suche ist derzeit nicht verfügbar.')+' Deine eigenen Spots bleiben sichtbar.','warning');
 }finally{
  clearTimeout(timeout);
  discoverLoading=false;
  $('radarRetry').disabled=!position;
  if(ticket===requestSerial)renderAll();
 }
}
function mapLoad(){
 if(window.L)return Promise.resolve(window.L);
 if(loadPromise)return loadPromise;
 loadPromise=new Promise((resolve,reject)=>{
   const tag=document.createElement('script');
   tag.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
   tag.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
   tag.crossOrigin='anonymous';
   tag.onload=()=>window.L?resolve(window.L):reject(new Error('Kartenbibliothek fehlt'));
   tag.onerror=()=>reject(new Error('Kartenbibliothek konnte nicht geladen werden'));
   document.head.appendChild(tag);
 }).catch(e=>{loadPromise=null;throw e});
 return loadPromise;
}
async function displayMap(matches){
 if(!position)return;
 try{
  const L=await mapLoad();
  $('radarMapCover').classList.add('hidden');
  if(!map){
   map=L.map('radarMap',{zoomControl:false,scrollWheelZoom:false,tap:false,preferCanvas:true});
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,minZoom:3,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'}).addTo(map);
   L.control.zoom({position:'bottomright'}).addTo(map);
   markerLayer=L.layerGroup().addTo(map);
  }
  markerLayer.clearLayers();
  if(userMarker)map.removeLayer(userMarker);
  if(radiusCircle)map.removeLayer(radiusCircle);
  userMarker=L.circleMarker([position.lat,position.lon],{radius:9,fillColor:'#ffad85',fillOpacity:1,color:'#ffffff',weight:3}).addTo(map).bindPopup('Dein aktueller Standort');
  radiusCircle=L.circle([position.lat,position.lon],{radius:radius()*1000,color:'#efa878',weight:1.6,opacity:.65,fillColor:'#f7aa7d',fillOpacity:.06,interactive:false}).addTo(map);
  const categoryMap=new Map(getCategories().map(c=>[c.id,c]));
  for(const {spot:s} of matches){
   const c=categoryMap.get(s.category)||{emoji:'🍽️'};
   const icon=L.divIcon({className:'fh-radar-icon',html:'<span>'+safe(c.emoji)+'</span>',iconSize:[39,42],iconAnchor:[19,42],popupAnchor:[0,-35]});
   const pin=L.marker([Number(s.latitude),Number(s.longitude)],{icon}).addTo(markerLayer);
   pin.bindPopup('<strong>'+safe(s.name)+'</strong><br>'+ (rating(s)!==null?'★ '+format(rating(s))+'/10':'Keine eigene Bewertung'));
  }
  const zoom=radius()<=.5?15:radius()<=1?14:radius()<=2?13:radius()<=5?12:radius()<=10?11:10;
  map.setView([position.lat,position.lon],zoom,{animate:false});
  setTimeout(()=>map&&map.invalidateSize(),100);
 }catch(e){
  $('radarMapCover').classList.remove('hidden');
  $('radarMapCover').innerHTML='<span aria-hidden="true">🗺️</span><strong>Karte aktuell nicht verfügbar</strong><p>Deine Entfernungsliste funktioniert weiter. Prüfe bei Gelegenheit die Internetverbindung.</p>';
  status('Standort erkannt. Die Kartenanzeige ist gerade nicht verfügbar; die Ergebnisliste funktioniert trotzdem.','warning');
 }
}
function renderAll(){
 const matches=showResults();
 if(position)displayMap(matches);
}
function getGps(cb){
 if(!window.isSecureContext||!navigator.geolocation){$('radarLocate').disabled=false;status('Standortfreigabe ist hier nicht möglich. Öffne FOODHUNT über HTTPS und aktiviere die Standortdienste.','warning');return}
 navigator.geolocation.getCurrentPosition(p=>{
  const coords={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy};
  if(!valid(coords.lat,coords.lon)){status('Der Standort konnte nicht ermittelt werden.','warning');return}
  cb(coords);
 },e=>{
  const messages={1:'Standortzugriff abgelehnt. Du kannst ihn in den iPhone-Einstellungen oder Safari erneut erlauben.',2:'Dein Standort ist gerade nicht verfügbar.',3:'Die Standortabfrage hat zu lange gedauert.'};
  status(messages[e.code]||'Standort konnte nicht ermittelt werden.','warning');
  $('radarLocate').disabled=false;
 },{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}
$('radarLocate').addEventListener('click',()=>{
 const b=$('radarLocate');b.disabled=true;
 status('Standort wird abgefragt …');
 getGps(p=>{
  position=p;
  $('radarRetry').disabled=false;
  b.disabled=false;b.innerHTML='<span aria-hidden="true">◎</span> Standort aktualisieren';
  status('Standort erkannt · Genauigkeit etwa '+Math.round(p.accuracy)+' m. Wir suchen jetzt auch nach neuen Restaurants in der Umgebung.','success');
  renderAll();
  fetchNearby();
 });
});
for(const id of ['radarSort','radarCategory','radarSource'])$(id).addEventListener('change',renderAll);
$('radarRadius').addEventListener('change',()=>{renderAll();if(position)fetchNearby();});
$('radarResults').addEventListener('click',e=>{
 const spot=e.target.closest('[data-radar-spot]');
 if(spot){window.FOODHUNT_API.openSpot(spot.dataset.radarSpot);return;}
 const link=e.target.closest('[data-discover-link]');
 if(link){
  const place=discovered.find(x=>x.osmId===link.dataset.discoverLink),target=getData().find(x=>x.id===link.dataset.targetSpot);
  if(!place||!target)return;
  if(!window.confirm('Ist „'+place.name+'“ genau das Restaurant aus deiner Liste „'+target.name+'“? Nur bestätigen, wenn der Standort stimmt.'))return;
  const result=window.FOODHUNT_API.assignDiscoveredToSpot(place,target.id);
  discoveryStatus(result?.assigned?'Der Standort wurde deinem vorhandenen Restaurant zugeordnet. Deine Bewertungen bleiben erhalten.':'Der Standort konnte nicht zugeordnet werden.','success');
  renderAll();return;
 }
 const save=e.target.closest('[data-discover-save]');
 if(save){
  const place=discovered.find(x=>x.osmId===save.dataset.discoverSave);
  if(!place)return;
  const result=window.FOODHUNT_API.addDiscoveredSpot(place);
  if(result?.added){discoveryStatus('„'+place.name+'“ wurde zu deiner persönlichen Liste hinzugefügt. Du kannst es jetzt selbst bewerten.','success');renderAll()}
  else discoveryStatus('Dieser Spot ist bereits in deiner Liste vorhanden.','success');
 }
});
$('radarRetry').addEventListener('click',()=>fetchNearby({force:true}));
const catselect=$('radarCategory');
for(const cat of getCategories()){
 const o=document.createElement('option');o.value=cat.id;o.textContent=cat.emoji+' '+cat.name;catselect.appendChild(o);
}
const picker=document.createElement('select');
picker.id='radarSpotSelect';picker.className='radar-spot-select';picker.setAttribute('aria-label','Restaurant ohne Standort auswählen');
$('radarAssignSpot').insertAdjacentElement('beforebegin',picker);
$('radarAssignSpot').addEventListener('click',()=>{
 if(!picker.value)return;
 window.FOODHUNT_API.openSpot(picker.value);
 const details=$('spotAddress').closest('details');
 if(details)details.open=true;
 $('spotLocationStatus').textContent='Suche jetzt den Standort dieses Restaurants und wähle den passenden Treffer aus.';
});
function modalStatus(message,validPin=false){
 const lat=$('spotLat').value,lon=$('spotLon').value;
 const pinned=valid(lat===''?null:lat,lon===''?null:lon);
 const current=$('spotLocationStatus');current.textContent=message||(pinned?'✓ Verifizierter Kartenstandort gespeichert.':'Noch kein Kartenstandort. Ein Restaurant erscheint erst nach deiner Bestätigung auf dem Radar.');
 current.dataset.pinned=String(pinned||validPin);
 $('spotClearLocation').classList.toggle('hidden',!pinned);
}
function clearPin(message){
 $('spotLat').value='';$('spotLon').value='';
 modalStatus(message||'Kartenstandort entfernt. Suche ihn erneut, falls du diesen Spot auf der Karte sehen möchtest.');
}
$('spotAddress').addEventListener('input',()=>{
 // Text changes invalidate earlier coordinates to avoid stale pins.
 if($('spotLat').value||$('spotLon').value)clearPin('Adresse verändert. Bitte Standort erneut bestätigen, bevor der Spot auf der Karte erscheint.');
});
$('spotClearLocation').addEventListener('click',()=>clearPin());
function selectPin(point){
 const lat=Number(point.lat),lon=Number(point.lon);
 if(!valid(lat,lon))return;
 $('spotAddress').value=String(point.display_name||'').slice(0,180);
 $('spotAddress').dispatchEvent(new Event('input',{bubbles:true}));
 $('spotLat').value=String(lat);$('spotLon').value=String(lon);
 $('spotLocationMatches').classList.add('hidden');
 $('spotLocationMatches').replaceChildren();
 modalStatus('✓ Standort bestätigt: '+String(point.display_name||'').slice(0,110));
}
$('spotGeocode').addEventListener('click',async()=>{
 if(geocoding)return;
 const name=$('spotName').value.trim(),address=$('spotAddress').value.trim();
 if(!name&&!address){modalStatus('Bitte trage zunächst den Restaurantnamen oder eine Adresse ein.');return}
 const now=Date.now();
 if(now-lastGeocode<1200){modalStatus('Bitte einen kurzen Moment vor der nächsten Suche warten.');return}
 const q=address||name+', Hamburg, Deutschland';
 lastGeocode=now;geocoding=true;
 const btn=$('spotGeocode');btn.disabled=true;btn.textContent='Suche läuft …';
 modalStatus('Suche bei OpenStreetMap nach: '+q);
 $('spotLocationMatches').classList.add('hidden');
 try{
  const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q='+encodeURIComponent(q);
  const resp=await fetch(url,{headers:{'Accept':'application/json','Accept-Language':'de'}});
  if(!resp.ok)throw new Error('Die Standortsuche ist momentan nicht erreichbar.');
  const data=await resp.json();
  geocodeMatches=Array.isArray(data)?data.filter(x=>valid(Number(x.lat),Number(x.lon))).slice(0,5):[];
  const box=$('spotLocationMatches');
  box.replaceChildren();
  if(!geocodeMatches.length){modalStatus('Kein passender Treffer. Gib eine genauere Adresse ein und suche erneut.');return}
  for(let i=0;i<geocodeMatches.length;i++){
   const x=geocodeMatches[i],button=document.createElement('button');
   button.type='button';button.dataset.pinIndex=String(i);button.className='radar-match';
   button.textContent=String(x.display_name||'Unbenannter Standort').slice(0,170);
   box.appendChild(button);
  }
  box.classList.remove('hidden');
  modalStatus('Bitte wähle den richtigen Standort aus den '+geocodeMatches.length+' Treffern. Keiner wird automatisch übernommen.');
 }catch(e){modalStatus(e.message||'Suche fehlgeschlagen.');}
 finally{geocoding=false;btn.disabled=false;btn.textContent='⌕ Standort suchen'}
});
$('spotLocationMatches').addEventListener('click',e=>{
 const btn=e.target.closest('[data-pin-index]');if(!btn)return;
 const item=geocodeMatches[Number(btn.dataset.pinIndex)];
 if(item)selectPin(item);
});
$('spotUseGps').addEventListener('click',()=>{
 if(!window.confirm('Nur verwenden, wenn du direkt am Restaurant stehst. Deinen aktuellen GPS-Punkt als Restaurantstandort speichern?'))return;
 modalStatus('GPS-Standort wird abgefragt …');
 getGps(p=>{
  if(p.accuracy>150&&!window.confirm('Dein GPS ist auf etwa '+Math.round(p.accuracy)+' Meter ungenau. Trotzdem als Restaurantstandort übernehmen?'))return;
  $('spotLat').value=String(p.lat);$('spotLon').value=String(p.lon);
  modalStatus('✓ Standort direkt vor Ort erfasst (Genauigkeit: etwa '+Math.round(p.accuracy)+' m). Jetzt Restaurant speichern.');
 });
});
document.addEventListener('foodhunt:spot-form-opened',()=>{
 geocodeMatches=[];$('spotLocationMatches').classList.add('hidden');
 const lat=$('spotLat').value,lon=$('spotLon').value;
 if(valid(lat===''?null:lat,lon===''?null:lon)){
  const details=$('spotAddress').closest('details');if(details)details.open=true;
 }
 modalStatus();
});
document.addEventListener('foodhunt:datachange',renderAll);
document.addEventListener('foodhunt:radar-open',()=>{
 if(position){renderAll();if(!lastDiscovery)fetchNearby()}else available();
});
available();
showResults();
})();