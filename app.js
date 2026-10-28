(()=>{
'use strict';
const SPOT_KEY='foodhunt-spots-v1', CAT_KEY='foodhunt-categories-v1';
const copy=obj=>JSON.parse(JSON.stringify(obj));
const seedSpots=copy(window.FOODHUNT_SPOTS||[]),seedCategories=copy(window.FOODHUNT_CATEGORIES||[]);
function read(key,fallback){try{const parsed=JSON.parse(localStorage.getItem(key));return Array.isArray(parsed)?parsed:copy(fallback)}catch{return copy(fallback)}}
let spots=read(SPOT_KEY,seedSpots), categories=read(CAT_KEY,seedCategories);
// New official entries added in later releases should show up without overwriting user reviews.
// The known-IDs list also prevents reinstating deleted default spots.
const KNOWN_SEEDS_KEY='foodhunt-known-seeds-v1', KNOWN_CATS_KEY='foodhunt-known-categories-v1';
function mergeNewSeeds(key, existing, latest, storageKey){
 try {
   const saved=JSON.parse(localStorage.getItem(key));
   const previousIds=new Set(Array.isArray(saved)?saved:latest.map(item=>item.id));
   const existingIds=new Set(existing.map(item=>item.id));
   const newEntries=latest.filter(item=>!previousIds.has(item.id)&&!existingIds.has(item.id));
   if(newEntries.length){existing.push(...newEntries);localStorage.setItem(storageKey,JSON.stringify(existing));}
   localStorage.setItem(key,JSON.stringify([...new Set([...previousIds,...latest.map(item=>item.id)])]));
 }catch(e){ /* local state continues when storage is restricted */ }
}
mergeNewSeeds(KNOWN_SEEDS_KEY,spots,seedSpots,SPOT_KEY);
mergeNewSeeds(KNOWN_CATS_KEY,categories,seedCategories,CAT_KEY);
const ui={category:null,filter:'all',sort:'default',search:'',view:'home',ratingMetric:'score'};
const $=id=>document.getElementById(id);
const escapeHTML=str=>String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toFixed(1).replace('.',',');
const category=id=>categories.find(c=>c.id===id)||{name:'Andere',emoji:'🍽️'};
const mapsQuery=s=>[s.name,(typeof s.address==='string'&&s.address.trim())||'Hamburg'].join(', ');
const mapsUrl=s=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mapsQuery(s));
const directionsUrl=s=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(mapsQuery(s));

const cleanProduct=p=>({
 id:typeof p.id==='string'&&p.id?p.id:'item-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
 name:String(p.name||'').trim().slice(0,120),
 score:p.score===null||p.score===''||p.score===undefined?null:Number(p.score),
 price:p.price===null||p.price===''||p.price===undefined?null:Number(p.price),
 date:typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)?p.date:'',
 note:String(p.note||'').trim().slice(0,300)
});
function productStats(s){
 const products=Array.isArray(s.products)?s.products.filter(p=>p&&typeof p.name==='string'&&p.name.trim()):[];
 const rated=products.filter(p=>p.score!==null&&p.score!==undefined&&Number.isFinite(Number(p.score))&&Number(p.score)>=0&&Number(p.score)<=10);
 const average=rated.length?Math.round((rated.reduce((sum,p)=>sum+Number(p.score),0)/rated.length)*10)/10:null;
 const best=rated.length?[...rated].sort((a,b)=>Number(b.score)-Number(a.score))[0]:null;
 return {total:products.length,ratedCount:rated.length,average,best};
}
const scoreFor=s=>productStats(s).average??s.score??null;

const save=()=>{try{localStorage.setItem(SPOT_KEY,JSON.stringify(spots));localStorage.setItem(CAT_KEY,JSON.stringify(categories))}catch{toast('Speicherplatz voll – bitte Daten exportieren')}document.dispatchEvent(new Event('foodhunt:datachange'))};
let toastTimer;function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000)}
function renderStats(){const done=spots.filter(s=>s.visited).length,total=spots.length,pct=total?done/total*100:0;$('spotCount').textContent=total;$('visitedCount').innerHTML=`${done}<span class="stat-unit"> / ${total}</span>`;$('progressLabel').textContent=`${fmt(pct)}% deiner Liste`;$('progressBar').style.width=pct+'%';$('categoryCount').textContent=categories.length}
function renderSideCategories(){let html='';for(const c of categories){let count=spots.filter(s=>s.category===c.id).length;html+=`<button type="button" class="side-cat ${ui.category===c.id?'active':''}" data-category="${escapeHTML(c.id)}"><span>${escapeHTML(c.emoji)} ${escapeHTML(c.name)}</span><strong>${count}</strong></button>`}$('sidebarCategories').innerHTML=html}
function renderCategories(){
 $('categoryTiles').innerHTML=categories.map((c,i)=>{
  const count=spots.filter(s=>s.category===c.id).length;
  return `<button type="button" class="cat-tile cat-tone-${i%6} ${ui.category===c.id?'active':''}" data-category="${escapeHTML(c.id)}"><span class="cat-art" aria-hidden="true"><span class="cat-art-ring"></span><span class="cat-icon">${escapeHTML(c.emoji)}</span></span><span class="cat-tile-bottom"><strong>${escapeHTML(c.name)}</strong><small>${count} Spot${count===1?'':'s'} entdecken</small></span><span class="cat-arrow" aria-hidden="true">↗</span></button>`;
 }).join('');
}
function renderRankings(){
 const metric=ui.ratingMetric;
 let html='';
 if(metric==='products'){
  const all=spots.flatMap(s=>(Array.isArray(s.products)?s.products:[]).filter(p=>p&&p.name&&p.score!==null&&p.score!==undefined&&Number.isFinite(Number(p.score))&&Number(p.score)>=0&&Number(p.score)<=10).map(p=>({spot:s,item:p}))).sort((a,b)=>Number(b.item.score)-Number(a.item.score)).slice(0,4);
  html=all.map(({spot,item},i)=>{
   const c=category(spot.category);
   return `<button type="button" class="ranking-card ${i===0?'ranking-winner':''}" data-spot="${escapeHTML(spot.id)}"><span class="rank-num">${i===0?'♛ BESTES GERICHT':'#'+String(i+1).padStart(2,'0')} <span class="rank-category">${escapeHTML(c.name)}</span></span><span class="rank-icon" aria-hidden="true">${i===0?'✦':'✳'}</span><span class="rank-big-emoji" aria-hidden="true">${escapeHTML(c.emoji)}</span><span class="rank-name">${escapeHTML(item.name)}</span><span class="rank-bottom"><span class="rank-score">${fmt(item.score)}<small> / 10</small></span><span class="rank-secondary">${escapeHTML(spot.name)}</span></span></button>`;
  }).join('')||'<div class="empty-state"><span>🍔</span><strong>Deine Food-Legenden fehlen noch</strong><p>Bewerte einzelne Gerichte in einem Restaurant – dann erscheinen sie hier.</p></div>';
 }else{
  const top=spots.filter(s=>{const v=metric==='score'?scoreFor(s):s.valueScore;return v!==null&&v!==undefined&&Number.isFinite(Number(v))}).sort((a,b)=>Number(metric==='score'?scoreFor(b):b.valueScore)-Number(metric==='score'?scoreFor(a):a.valueScore)).slice(0,4);
  html=top.map((s,i)=>{
   const secondary=metric==='score'?s.valueScore:scoreFor(s);
   const secondaryLabel=metric==='score'?'Preis-Leistung':'Gesamt';
   const c=category(s.category);
   const value=metric==='score'?scoreFor(s):s.valueScore;
   return `<button type="button" class="ranking-card ${i===0?'ranking-winner':''}" data-spot="${escapeHTML(s.id)}"><span class="rank-num">${i===0?'♛ TOP PICK':'#'+String(i+1).padStart(2,'0')} <span class="rank-category">${escapeHTML(c.name)}</span></span><span class="rank-icon" aria-hidden="true">${i===0?'✦':'✳'}</span><span class="rank-big-emoji" aria-hidden="true">${escapeHTML(c.emoji)}</span><span class="rank-name">${escapeHTML(s.name)}</span><span class="rank-bottom"><span class="rank-score">${fmt(value)}<small> / 10</small></span>${secondary!==null&&secondary!==undefined?`<span class="rank-secondary">${secondaryLabel}: ${fmt(secondary)}</span>`:''}</span></button>`;
  }).join('')||'<div class="empty-state"><span>★</span><strong>Noch keine Bewertungen</strong><p>Bewerte zuerst ein Restaurant in dieser Kategorie.</p></div>';
 }
 $('topRated').innerHTML=html;
 document.querySelectorAll('[data-metric]').forEach(b=>{const active=b.dataset.metric===metric;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function filteredSpots(){let list=spots.filter(s=>{
 if(ui.category&&s.category!==ui.category)return false;
 if(ui.filter==='unvisited'&&s.visited)return false;
 if(ui.filter==='visited'&&!s.visited)return false;
 if(ui.filter==='suggested'&&!s.suggested)return false;
 if(ui.filter==='favorite'&&!s.favorite)return false;
 if(ui.search&&!(`${s.name} ${category(s.category).name} ${s.dish||''} ${s.note||''} ${s.address||''} ${(Array.isArray(s.products)?s.products:[]).map(p=>[p.name,p.note].join(' ')).join(' ')}`).toLocaleLowerCase('de').includes(ui.search.toLocaleLowerCase('de')))return false;
 return true});
 if(ui.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'de'));
 else if(ui.sort==='rating')list.sort((a,b)=>(scoreFor(b)??-1)-(scoreFor(a)??-1));
 else if(ui.sort==='value')list.sort((a,b)=>(b.valueScore??-1)-(a.valueScore??-1));
 else if(ui.sort==='new')list.sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||''));
 return list}
function renderSpots(){
 const list=filteredSpots();
 $('resultsLabel').textContent=`${list.length} SPOT${list.length===1?'':'S'} ENTDECKEN`;
 $('categoryFilterName').textContent=ui.category?category(ui.category).name.toUpperCase():'ALLE KATEGORIEN';
 $('emptyState').classList.toggle('hidden',list.length>0);
 $('spotGrid').innerHTML=list.map(s=>{
  const c=category(s.category);
  const tint=Math.max(0,categories.findIndex(x=>x.id===s.category))%6;
  const mapLabel=s.address?'Standort ansehen':'In Maps suchen';
  const badge=s.visited?'<span class="spot-badge reviewed">✓ GETESTET</span>':s.suggested?'<span class="spot-badge suggested">✳ NEU</span>':'<span class="spot-badge">AUF DER LISTE</span>';
  const rating=scoreFor(s),product=productStats(s);
  const hasTaste=rating!==null&&rating!==undefined;
  const hasValue=s.valueScore!==null&&s.valueScore!==undefined;
  const scores=(hasTaste||hasValue)?`<span class="spot-dual-ratings">${hasTaste?`<span class="mini-rating taste"><span class="mini-rating-label">★ Gesamt</span><strong>${fmt(rating)}</strong></span>`:''}${hasValue?`<span class="mini-rating value"><span class="mini-rating-label">◈ Preis-Leistung</span><strong>${fmt(s.valueScore)}</strong></span>`:''}</span>`:`<span class="spot-status">${s.visited?'Bereits besucht':'Noch nicht getestet'}</span>`;
  return `<article class="spot-card cat-tone-${tint} ${s.favorite?'is-favorite':''}"><div class="spot-cover"><span class="spot-cover-orbit" aria-hidden="true"></span><span class="spot-cover-emoji" aria-hidden="true">${escapeHTML(c.emoji)}</span>${badge}<button class="favorite-heart ${s.favorite?'active':''}" type="button" data-favorite="${escapeHTML(s.id)}" aria-pressed="${s.favorite?'true':'false'}" aria-label="${escapeHTML(s.name)} ${s.favorite?'aus Favoriten entfernen':'als Favorit speichern'}" title="${s.favorite?'Aus Favoriten entfernen':'Zu Favoriten hinzufügen'}"><svg class="heart-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg></button></div><button class="spot-card-main" type="button" data-spot="${escapeHTML(s.id)}"><span class="spot-category"><span class="category-dot"></span> ${escapeHTML(c.name)}</span><h3>${escapeHTML(s.name)}</h3>${product.best?`<div class="spot-best-item"><span class="best-item-label">🏆 BESTES GERICHT</span><span class="best-item-name">${escapeHTML(product.best.name)}</span><strong>★ ${fmt(product.best.score)}</strong></div><span class="spot-product-count">${product.total} Gericht${product.total===1?'':'e'} getestet</span>`:'' }<div class="spot-footer">${scores}<span class="spot-enter" aria-hidden="true">↗</span></div></button><a class="spot-map-link" href="${escapeHTML(mapsUrl(s))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(s.name)} – ${escapeHTML(mapLabel)}"><span class="spot-map-icon" aria-hidden="true">⌖</span>${escapeHTML(mapLabel)}<span aria-hidden="true">↗</span></a></article>`;
 }).join('');
}
function render(){renderStats();renderSideCategories();renderCategories();renderRankings();renderSpots();document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.filter===ui.filter));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('selected',b.dataset.view===ui.view))}
function scrollToId(id){$(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
function setCategory(id){ui.category=ui.category===id?null:id;ui.view='discover';ui.filter='all';render();scrollToId('browseSection')}
function setView(view){ui.view=view;if(view==='home'){ui.category=null;ui.filter='all';render();scrollToId('home')}else if(view==='discover'){ui.category=null;ui.filter='all';render();scrollToId('browseSection')}else if(view==='nearby'){render();scrollToId('radarSection');document.dispatchEvent(new Event('foodhunt:radar-open'))}else if(view==='rankings'){render();scrollToId('rankingSection')}else if(view==='visited'){ui.category=null;ui.filter='visited';render();scrollToId('browseSection')}}
function openModal(type='spot',id=null){$('modalBackdrop').classList.remove('hidden');document.body.style.overflow='hidden';$('spotForm').classList.toggle('hidden',type!=='spot');$('categoryForm').classList.toggle('hidden',type!=='category');$('backupPanel').classList.toggle('hidden',type!=='backup');$('modalTitle').textContent=type==='spot'?(id?'Spot bearbeiten':'Spot hinzufügen'):type==='category'?'Neue Food-Kategorie':'Daten sichern & laden';
 if(type==='spot'){
  $('spotCategory').innerHTML=categories.map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(c.emoji)} ${escapeHTML(c.name)}</option>`).join('');
  const s=spots.find(x=>x.id===id);$('spotId').value=s?.id||'';$('spotName').value=s?.name||'';$('spotCategory').value=s?.category||ui.category||categories[0]?.id||'';$('spotVisited').value=String(s?.visited||false);$('spotScore').value=s?.score??'';$('spotValueScore').value=s?.valueScore??'';$('spotDish').value=s?.dish||'';$('spotNote').value=s?.note||'';$('spotAddress').value=s?.address||'';$('spotFavorite').checked=!!s?.favorite;$('spotLat').value=Number.isFinite(Number(s?.latitude))&&s?.latitude!==null&&s?.latitude!==undefined?String(s.latitude):'';$('spotLon').value=Number.isFinite(Number(s?.longitude))&&s?.longitude!==null&&s?.longitude!==undefined?String(s.longitude):'';$('deleteSpot').classList.toggle('hidden',!s);syncMapsLinks();document.dispatchEvent(new CustomEvent('foodhunt:spot-form-opened',{detail:{editing:!!s}}));if(window.innerWidth>720&&!s)$('spotName').focus();
 }else if(type==='category'){$('newCategoryName').value='';$('newCategoryEmoji').value='🍽️';$('newCategoryName').focus()}}
function syncMapsLinks(){const name=$('spotName').value.trim(),address=$('spotAddress').value.trim();$('spotLocationBox').classList.toggle('hidden',!name);if(!name)return;const s={name,address};$('spotMapsLink').href=mapsUrl(s);$('spotMapsHint').textContent=address?'Adresse hinterlegt – bitte den Treffer prüfen':'Ohne Adresse: Suche nach dem Namen in Hamburg';$('spotDirectionsLink').classList.toggle('hidden',!address);if(address)$('spotDirectionsLink').href=directionsUrl(s)}
function closeModal(){$('modalBackdrop').classList.add('hidden');document.body.style.overflow=''}
function saveSpot(e){
 e.preventDefault();
 const name=$('spotName').value.trim(),categoryId=$('spotCategory').value;
 if(!name||!categories.some(c=>c.id===categoryId))return toast('Bitte Name und Kategorie angeben');
 const editor=window.FOODHUNT_PRODUCT_EDITOR;
 if(editor&&editor.commitPending()===false)return;
 const id=$('spotId').value,prev=spots.find(s=>s.id===id);
 const products=editor?editor.getItems():(Array.isArray(prev?.products)?copy(prev.products):[]);
 if(products.length>300)return toast('Maximal 300 Gerichte pro Restaurant');
 const validProducts=products.every(p=>p&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=120&&p.score!==null&&p.score!==undefined&&Number.isFinite(Number(p.score))&&Number(p.score)>=0&&Number(p.score)<=10&&(p.price===null||p.price===undefined||(Number.isFinite(Number(p.price))&&Number(p.price)>=0&&Number(p.price)<=9999)));
 if(!validProducts)return toast('Bitte Gericht und Note zwischen 0 und 10 prüfen');
 const stats=productStats({products});
 const inputScore=$('spotScore').value.trim();
 const manualScore=inputScore===''?null:Number(inputScore);
 if(manualScore!==null&&(!Number.isFinite(manualScore)||manualScore<0||manualScore>10))return toast('Bewertung muss zwischen 0 und 10 liegen');
 const score=stats.ratedCount?stats.average:manualScore;
 const valueText=$('spotValueScore').value.trim(),valueScore=valueText===''?null:Number(valueText);
 if(valueScore!==null&&(!Number.isFinite(valueScore)||valueScore<0||valueScore>10))return toast('Preis-Leistung muss zwischen 0 und 10 liegen');
 let legacyScore=prev?.legacyScore??null;
 if(stats.ratedCount&&legacyScore===null&&!Array.isArray(prev?.products)&&prev?.score!==null&&prev?.score!==undefined&&Number.isFinite(Number(prev.score)))legacyScore=Number(prev.score);
 const latText=$('spotLat').value.trim(),lonText=$('spotLon').value.trim();
 if((latText==='')!==(lonText===''))return toast('Standort bitte vollständig auswählen');
 const latitude=latText===''?null:Number(latText),longitude=lonText===''?null:Number(lonText);
 if(latitude!==null&&(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude>90||longitude < -180||longitude>180))return toast('Ungültige Koordinaten');
 const entry={
  id:prev?.id||('custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,6)),
  name,category:categoryId,score,valueScore,
  visited:$('spotVisited').value==='true'||score!==null||valueScore!==null||products.length>0,
  suggested:prev?.suggested||false,favorite:$('spotFavorite').checked,
  dish:$('spotDish').value.trim(),note:$('spotNote').value.trim(),
  address:$('spotAddress').value.trim(),latitude,longitude,addedAt:prev?.addedAt||new Date().toISOString().slice(0,10),
  products:products.map(cleanProduct),legacyScore
 };
 if(prev)spots=spots.map(s=>s.id===id?entry:s);else spots.unshift(entry);
 save();render();closeModal();
 toast(prev?'Food-Spot aktualisiert ✓':'Neuer Food-Spot hinzugefügt ✓');
}
function addCategory(e){e.preventDefault();const name=$('newCategoryName').value.trim();if(!name)return toast('Bitte einen Kategorienamen eingeben');if(categories.some(c=>c.name.toLowerCase()===name.toLowerCase()))return toast('Diese Kategorie gibt es bereits');const id='category-'+Date.now();categories.push({id,name,emoji:$('newCategoryEmoji').value.trim()||'🍽️'});ui.category=id;ui.filter='all';save();render();closeModal();toast('Neue Food-Kategorie erstellt ✳');scrollToId('categorySection')}
function toggleFavorite(id,button){
 const spot=spots.find(s=>s.id===id);
 if(!spot)return;
 spot.favorite=!spot.favorite;
 save();
 // Keep the pressed heart in the DOM, so its feedback animation can complete.
 if(ui.filter==='favorite'&&!spot.favorite){
  renderSpots();
 }else if(button){
  const card=button.closest('.spot-card');
  card?.classList.toggle('is-favorite',spot.favorite);
  button.classList.toggle('active',spot.favorite);
  button.setAttribute('aria-pressed',String(spot.favorite));
  button.setAttribute('aria-label',spot.name+(spot.favorite?' aus Favoriten entfernen':' als Favorit speichern'));
  button.title=spot.favorite?'Aus Favoriten entfernen':'Zu Favoriten hinzufügen';
  if(spot.favorite){
   button.classList.remove('just-liked');
   void button.offsetWidth;
   button.classList.add('just-liked');
   button.addEventListener('animationend',()=>button.classList.remove('just-liked'),{once:true});
  }else button.classList.remove('just-liked');
 }else renderSpots();
 toast(spot.favorite?'Als Favorit gespeichert ♥':'Aus Favoriten entfernt');
}
function removeSpot(){const id=$('spotId').value,spot=spots.find(s=>s.id===id);if(!spot)return;if(!window.confirm(`„${spot.name}“ wirklich aus deiner Liste löschen?`))return;spots=spots.filter(s=>s.id!==id);save();render();closeModal();toast('Spot gelöscht')}
function backup(){const out={app:'FOODHUNT',version:1,exportedAt:new Date().toISOString(),categories,spots};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='foodhunt-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);toast('Backup heruntergeladen ✓')}
async function importBackup(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>5e6)throw Error('Datei ist zu groß');const raw=JSON.parse(await file.text());if(raw.app!=='FOODHUNT'||!Array.isArray(raw.categories)||!Array.isArray(raw.spots)||raw.spots.length>10000||raw.categories.length>1000)throw Error('Das ist keine gültige FOODHUNT-Datei');if(!raw.categories.every(c=>typeof c.id==='string'&&typeof c.name==='string'&&typeof c.emoji==='string')||!raw.spots.every(s=>typeof s.id==='string'&&typeof s.name==='string'&&typeof s.category==='string'))throw Error('Ungültige Datensätze');if(!window.confirm('Bestehende Food-Spot-Daten durch dieses Backup ersetzen?'))return;categories=raw.categories;spots=raw.spots;ui.category=null;ui.filter='all';ui.search='';$('searchInput').value='';save();render();closeModal();toast('Backup erfolgreich geladen ✓')}catch(err){toast(err.message||'Backup konnte nicht geladen werden')}finally{e.target.value=''}}
function surprise(){const pool=spots.filter(s=>!s.visited&&(ui.category?ui.category===s.category:true));if(!pool.length){toast('Keine offenen Spots in dieser Kategorie');return}const chosen=pool[Math.floor(Math.random()*pool.length)];openModal('spot',chosen.id);toast('Dein nächster Food-Spot: '+chosen.name+' ✳')}
$('todayDate').textContent=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date()).toUpperCase();
document.addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite]');if(favorite){toggleFavorite(favorite.dataset.favorite,favorite);return}const nav=e.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return}const cat=e.target.closest('[data-category]');if(cat){setCategory(cat.dataset.category);return}const spot=e.target.closest('[data-spot]');if(spot){openModal('spot',spot.dataset.spot);return}});
$('addSpotTop').onclick=() =>openModal('spot');$('addSpotSection').onclick=()=>openModal('spot');$('emptyAdd').onclick=()=>openModal('spot');$('addCategoryButton').onclick=()=>openModal('category');$('quickCategory').onclick=()=>openModal('category');$('backupButton').onclick=()=>openModal('backup');$('exploreButton').onclick=()=>setView('discover');$('surpriseButton').onclick=surprise;$('closeModal').onclick=closeModal;$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});$('spotName').addEventListener('input',syncMapsLinks);$('spotAddress').addEventListener('input',syncMapsLinks);$('ratingMetricTabs').addEventListener('click',e=>{const button=e.target.closest('[data-metric]');if(!button)return;ui.ratingMetric=['score','valueScore','products'].includes(button.dataset.metric)?button.dataset.metric:'score';renderRankings()});$('spotForm').addEventListener('submit',saveSpot);$('categoryForm').addEventListener('submit',addCategory);$('deleteSpot').onclick=removeSpot;$('exportData').onclick=backup;$('importData').addEventListener('change',importBackup);$('searchInput').addEventListener('input',e=>{ui.search=e.target.value;renderSpots()});$('sortSelect').addEventListener('change',e=>{ui.sort=e.target.value;renderSpots()});$('quickFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;ui.filter=b.dataset.filter;render()});
window.FOODHUNT_API={
 getSpots:()=>copy(spots),
 getCategories:()=>copy(categories),
 openSpot:id=>{if(spots.some(s=>s.id===id))openModal('spot',id)},
 assignDiscoveredToSpot:(place,spotId)=>{
  if(!place||typeof place.osmId!=='string'||!/^(node|way|relation)\/\d+$/.test(place.osmId))return {assigned:false};
  const latitude=Number(place.latitude),longitude=Number(place.longitude);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return {assigned:false};
  const target=spots.find(s=>s.id===spotId);
  if(!target||target.latitude!==null&&target.latitude!==undefined&&target.longitude!==null&&target.longitude!==undefined)return {assigned:false};
  if(spots.some(s=>s.osmId===place.osmId))return {assigned:false};
  target.latitude=latitude;target.longitude=longitude;
  target.osmId=place.osmId;
  target.source='openstreetmap';
  save();render();return {assigned:true,id:target.id};
 },
 addDiscoveredSpot:place=>{
  if(!place||typeof place.osmId!=='string'||!/^(node|way|relation)\/\d+$/.test(place.osmId))return {added:false};
  const latitude=Number(place.latitude),longitude=Number(place.longitude);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return {added:false};
  const name=String(place.name||'').trim().slice(0,100);
  if(!name||spots.some(s=>s.osmId===place.osmId))return {added:false};
  const categoryId=categories.some(c=>c.id===place.category)?place.category:(categories[0]?.id||'street');
  const id='custom-osm-'+place.osmId.replace('/','-');
  if(spots.some(s=>s.id===id))return {added:false};
  spots.unshift({id,name,category:categoryId,score:null,valueScore:null,
   visited:false,suggested:false,favorite:false,dish:'',note:'',address:'',
   latitude,longitude,source:'openstreetmap',osmId:place.osmId,products:[],
   addedAt:new Date().toISOString().slice(0,10)});
  save();render();return {added:true,id};
 }
};
render();
})();
