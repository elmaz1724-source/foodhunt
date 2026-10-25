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
function showResults(){
 const list=$('radarResults'),spots=getData(),cats=new Map(getCategories().map(c=>[c.id,c]));
 const mapped=spots.filter(marked),count=mapped.length;
 if(!position){
  $('radarCount').textContent=count+' zugeordnet';
  list.innerHTML='<div class="radar-zero"><span aria-hidden="true">◎</span><strong>Wo bist du gerade?</strong><p>Tippe auf „Standort verwenden“. Erst dann berechnen wir Entfernungen – dein GPS-Standort wird nicht gespeichert.</p></div>';
  available();return [];
 }
 const selectedCategory=$('radarCategory').value,km=radius();
 let matches=mapped.map(s=>({spot:s,km:distance(position.lat,position.lon,Number(s.latitude),Number(s.longitude))})).filter(({spot,km:d})=>d<=km&&(!selectedCategory||spot.category===selectedCategory));
 const sort=$('radarSort').value;
 matches.sort((a,b)=>sort==='rating'?((rating(b.spot)??-1)-(rating(a.spot)??-1)||a.km-b.km):sort==='value'?((Number(b.spot.valueScore??-1)-Number(a.spot.valueScore??-1))||a.km-b.km):a.km-b.km);
 $('radarCount').textContent=matches.length+' Spot'+(matches.length===1?'':'s');
 if(!matches.length){
  list.innerHTML='<div class="radar-zero"><span aria-hidden="true">⌖</span><strong>Hier ist noch Luft nach oben</strong><p>In diesem Umkreis gibt es noch keine deiner Restaurants mit gespeichertem Standort. Erhöhe den Radius oder füge einen Standort hinzu.</p></div>';
 }else{
  list.innerHTML=matches.map(({spot:s,km:d},i)=>{
    const category=cats.get(s.category)||{name:'Food',emoji:'🍽️'};
    const r=rating(s),v=(s.valueScore===null||s.valueScore===undefined)?null:Number(s.valueScore);
    const products=Array.isArray(s.products)?s.products.filter(p=>p&&p.name&&p.score!==null&&p.score!==undefined&&Number.isFinite(Number(p.score))):[];
    const best=products.length?[...products].sort((a,b)=>Number(b.score)-Number(a.score))[0]:null;
    const nav='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(Number(s.latitude)+','+Number(s.longitude));
    return '<article class="radar-result"><div class="radar-result-icon">'+safe(category.emoji)+'</div><div class="radar-result-body"><span class="radar-result-meta">'+safe(category.name)+' · '+meters(d)+'</span><strong>'+safe(s.name)+'</strong><div class="radar-result-ratings">'+(r!==null?'<span>★ '+format(r)+'</span>':'<span>Noch nicht bewertet</span>')+(v!==null&&Number.isFinite(v)?'<span>◈ '+format(v)+'</span>':'')+'</div>'+(best?'<p class="radar-best">✦ Bester Bite: '+safe(best.name)+' · '+format(best.score)+'</p>':'')+'<div class="radar-result-actions"><button type="button" data-radar-spot="'+safe(s.id)+'">Details</button><a href="'+safe(nav)+'" target="_blank" rel="noopener noreferrer">Route ↗</a></div></div></article>';
  }).join('');
 }
 available();return matches;
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
  b.disabled=false;b.innerHTML='<span aria-hidden="true">◎</span> Standort aktualisieren';
  status('Standort erkannt · Genauigkeit etwa '+Math.round(p.accuracy)+' m. Angezeigt werden nur Restaurants mit bestätigten Koordinaten.','success');
  renderAll();
 });
});
for(const id of ['radarRadius','radarSort','radarCategory'])$(id).addEventListener('change',renderAll);
$('radarResults').addEventListener('click',e=>{
 const spot=e.target.closest('[data-radar-spot]');
 if(spot)window.FOODHUNT_API.openSpot(spot.dataset.radarSpot);
});
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
 if(position)renderAll();else available();
});
available();
showResults();
})();