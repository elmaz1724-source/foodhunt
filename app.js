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
const save=()=>{try{localStorage.setItem(SPOT_KEY,JSON.stringify(spots));localStorage.setItem(CAT_KEY,JSON.stringify(categories))}catch{toast('Speicherplatz voll – bitte Daten exportieren')}};
let toastTimer;function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000)}
function renderStats(){const done=spots.filter(s=>s.visited).length,total=spots.length,pct=total?done/total*100:0;$('spotCount').textContent=total;$('visitedCount').innerHTML=`${done}<span class="stat-unit"> / ${total}</span>`;$('progressLabel').textContent=`${fmt(pct)}% deiner Liste`;$('progressBar').style.width=pct+'%';$('categoryCount').textContent=categories.length}
function renderSideCategories(){let html='';for(const c of categories){let count=spots.filter(s=>s.category===c.id).length;html+=`<button type="button" class="side-cat ${ui.category===c.id?'active':''}" data-category="${escapeHTML(c.id)}"><span>${escapeHTML(c.emoji)} ${escapeHTML(c.name)}</span><strong>${count}</strong></button>`}$('sidebarCategories').innerHTML=html}
function renderCategories(){
 $('categoryTiles').innerHTML=categories.map((c,i)=>{
  const count=spots.filter(s=>s.category===c.id).length;
  const tint=i%6;
  return `<button type="button" class="cat-tile cat-tone-${tint} ${ui.category===c.id?'active':''}" data-category="${escapeHTML(c.id)}"><span class="cat-tile-top"><span class="cat-icon">${escapeHTML(c.emoji)}</span><span class="cat-arrow" aria-hidden="true">↗</span></span><span class="cat-tile-bottom"><strong>${escapeHTML(c.name)}</strong><small>${count} Spot${count===1?'':'s'} entdecken</small></span></button>`;
 }).join('');
}
function renderRankings(){
 const metric=ui.ratingMetric;
 const top=spots.filter(s=>s[metric]!==null&&s[metric]!==undefined&&Number.isFinite(Number(s[metric]))).sort((a,b)=>Number(b[metric])-Number(a[metric])).slice(0,4);
 const pLabel=metric==='score'?'Gesamt':'Preis-Leistung';
 $('topRated').innerHTML=top.map((s,i)=>{
  const secondary=metric==='score'?s.valueScore:s.score;
  const secondaryLabel=metric==='score'?'Preis-Leistung':'Gesamt';
  return `<button type="button" class="ranking-card" data-spot="${escapeHTML(s.id)}"><span class="rank-num">#${String(i+1).padStart(2,'0')} · ${pLabel}</span><span class="rank-icon" aria-hidden="true">${i===0?'✦':'✳'}</span><span class="rank-name">${escapeHTML(s.name)}</span><span class="rank-score">${fmt(s[metric])}<small> / 10</small></span>${secondary!==null&&secondary!==undefined?`<span class="rank-secondary">${secondaryLabel}: ${fmt(secondary)}</span>`:''}</button>`;
 }).join('')||'<div class="empty-state"><span>★</span><strong>Noch keine Bewertungen</strong><p>Bewerte erst ein Restaurant in dieser Kategorie.</p></div>';
 document.querySelectorAll('[data-metric]').forEach(b=>{const active=b.dataset.metric===metric;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function filteredSpots(){let list=spots.filter(s=>{
 if(ui.category&&s.category!==ui.category)return false;
 if(ui.filter==='unvisited'&&s.visited)return false;
 if(ui.filter==='visited'&&!s.visited)return false;
 if(ui.filter==='suggested'&&!s.suggested)return false;
 if(ui.filter==='favorite'&&!s.favorite)return false;
 if(ui.search&&!(`${s.name} ${category(s.category).name} ${s.dish||''} ${s.note||''} ${s.address||''}`).toLocaleLowerCase('de').includes(ui.search.toLocaleLowerCase('de')))return false;
 return true});
 if(ui.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'de'));
 else if(ui.sort==='rating')list.sort((a,b)=>(b.score??-1)-(a.score??-1));
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
  const mapLabel=s.address?'Standort in Maps':'In Maps suchen';
  const badge=s.visited?'<span class="spot-badge reviewed">✓ GETESTET</span>':s.suggested?'<span class="spot-badge suggested">✳ NEU</span>':'<span class="spot-badge">AUF DER LISTE</span>';
  const hasTaste=s.score!==null&&s.score!==undefined;
  const hasValue=s.valueScore!==null&&s.valueScore!==undefined;
  const scores=(hasTaste||hasValue)?`<span class="spot-dual-ratings">${hasTaste?`<span class="mini-rating taste"><span class="mini-rating-label">★ Gesamt</span><strong>${fmt(s.score)}</strong></span>`:''}${hasValue?`<span class="mini-rating value"><span class="mini-rating-label">◈ Preis-Leistung</span><strong>${fmt(s.valueScore)}</strong></span>`:''}</span>`:`<span class="spot-status">${s.visited?'Bereits besucht':'Noch nicht getestet'}</span>`;
  return `<article class="spot-card ${s.favorite?'is-favorite':''}"><button class="spot-card-main" type="button" data-spot="${escapeHTML(s.id)}"><div class="spot-top"><span class="spot-category"><span class="emoji">${escapeHTML(c.emoji)}</span> ${escapeHTML(c.name)}</span>${badge}</div><h3>${escapeHTML(s.name)}</h3><div class="spot-footer">${scores}<span class="spot-enter" aria-hidden="true">↗</span></div></button><button class="favorite-heart ${s.favorite?'active':''}" type="button" data-favorite="${escapeHTML(s.id)}" aria-pressed="${s.favorite?'true':'false'}" aria-label="${escapeHTML(s.name)} ${s.favorite?'aus Favoriten entfernen':'als Favorit speichern'}" title="${s.favorite?'Aus Favoriten entfernen':'Zu Favoriten hinzufügen'}"><svg class="heart-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg></button><a class="spot-map-link" href="${escapeHTML(mapsUrl(s))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(s.name)} – ${escapeHTML(mapLabel)}"><span class="spot-map-icon" aria-hidden="true">⌖</span>${escapeHTML(mapLabel)}<span aria-hidden="true">↗</span></a></article>`;
 }).join('');
}
function render(){renderStats();renderSideCategories();renderCategories();renderRankings();renderSpots();document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.filter===ui.filter));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('selected',b.dataset.view===ui.view))}
function scrollToId(id){$(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
function setCategory(id){ui.category=ui.category===id?null:id;ui.view='discover';ui.filter='all';render();scrollToId('browseSection')}
function setView(view){ui.view=view;if(view==='home'){ui.category=null;ui.filter='all';render();scrollToId('home')}else if(view==='discover'){ui.category=null;ui.filter='all';render();scrollToId('browseSection')}else if(view==='rankings'){render();scrollToId('rankingSection')}else if(view==='visited'){ui.category=null;ui.filter='visited';render();scrollToId('browseSection')}}
function openModal(type='spot',id=null){$('modalBackdrop').classList.remove('hidden');document.body.style.overflow='hidden';$('spotForm').classList.toggle('hidden',type!=='spot');$('categoryForm').classList.toggle('hidden',type!=='category');$('backupPanel').classList.toggle('hidden',type!=='backup');$('modalTitle').textContent=type==='spot'?(id?'Spot bearbeiten':'Spot hinzufügen'):type==='category'?'Neue Food-Kategorie':'Daten sichern & laden';
 if(type==='spot'){
  $('spotCategory').innerHTML=categories.map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(c.emoji)} ${escapeHTML(c.name)}</option>`).join('');
  const s=spots.find(x=>x.id===id);$('spotId').value=s?.id||'';$('spotName').value=s?.name||'';$('spotCategory').value=s?.category||ui.category||categories[0]?.id||'';$('spotVisited').value=String(s?.visited||false);$('spotScore').value=s?.score??'';$('spotValueScore').value=s?.valueScore??'';$('spotDish').value=s?.dish||'';$('spotNote').value=s?.note||'';$('spotAddress').value=s?.address||'';$('spotFavorite').checked=!!s?.favorite;$('deleteSpot').classList.toggle('hidden',!s);syncMapsLinks();$('spotName').focus();
 }else if(type==='category'){$('newCategoryName').value='';$('newCategoryEmoji').value='🍽️';$('newCategoryName').focus()}}
function syncMapsLinks(){const name=$('spotName').value.trim(),address=$('spotAddress').value.trim();$('spotLocationBox').classList.toggle('hidden',!name);if(!name)return;const s={name,address};$('spotMapsLink').href=mapsUrl(s);$('spotMapsHint').textContent=address?'Adresse hinterlegt – bitte den Treffer prüfen':'Ohne Adresse: Suche nach dem Namen in Hamburg';$('spotDirectionsLink').classList.toggle('hidden',!address);if(address)$('spotDirectionsLink').href=directionsUrl(s)}
function closeModal(){$('modalBackdrop').classList.add('hidden');document.body.style.overflow=''}
function saveSpot(e){e.preventDefault();const name=$('spotName').value.trim(),categoryId=$('spotCategory').value;if(!name||!categories.some(c=>c.id===categoryId))return toast('Bitte Name und Kategorie angeben');const scoreText=$('spotScore').value.trim(),score=scoreText===''?null:Number(scoreText);if(score!==null&&(!Number.isFinite(score)||score<0||score>10))return toast('Bewertung muss zwischen 0 und 10 liegen');const valueText=$('spotValueScore').value.trim(),valueScore=valueText===''?null:Number(valueText);if(valueScore!==null&&(!Number.isFinite(valueScore)||valueScore<0||valueScore>10))return toast('Preis-Leistung muss zwischen 0 und 10 liegen');const id=$('spotId').value;const prev=spots.find(s=>s.id===id);const entry={id:prev?.id||('custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,6)),name,category:categoryId,score,valueScore,visited:$('spotVisited').value==='true'||score!==null||valueScore!==null,suggested:prev?.suggested||false,favorite:$('spotFavorite').checked,dish:$('spotDish').value.trim(),note:$('spotNote').value.trim(),address:$('spotAddress').value.trim(),addedAt:prev?.addedAt||new Date().toISOString().slice(0,10)};if(prev)spots=spots.map(s=>s.id===id?entry:s);else spots.unshift(entry);save();render();closeModal();toast(prev?'Food-Spot aktualisiert ✓':'Neuer Food-Spot hinzugefügt ✓')}
function addCategory(e){e.preventDefault();const name=$('newCategoryName').value.trim();if(!name)return toast('Bitte einen Kategorienamen eingeben');if(categories.some(c=>c.name.toLowerCase()===name.toLowerCase()))return toast('Diese Kategorie gibt es bereits');const id='category-'+Date.now();categories.push({id,name,emoji:$('newCategoryEmoji').value.trim()||'🍽️'});ui.category=id;ui.filter='all';save();render();closeModal();toast('Neue Food-Kategorie erstellt ✳');scrollToId('categorySection')}
function toggleFavorite(id){const spot=spots.find(s=>s.id===id);if(!spot)return;spot.favorite=!spot.favorite;save();renderSpots();toast(spot.favorite?'Zu deinen Favoriten hinzugefügt ♥':'Aus Favoriten entfernt');}
function removeSpot(){const id=$('spotId').value,spot=spots.find(s=>s.id===id);if(!spot)return;if(!window.confirm(`„${spot.name}“ wirklich aus deiner Liste löschen?`))return;spots=spots.filter(s=>s.id!==id);save();render();closeModal();toast('Spot gelöscht')}
function backup(){const out={app:'FOODHUNT',version:1,exportedAt:new Date().toISOString(),categories,spots};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='foodhunt-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);toast('Backup heruntergeladen ✓')}
async function importBackup(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>5e6)throw Error('Datei ist zu groß');const raw=JSON.parse(await file.text());if(raw.app!=='FOODHUNT'||!Array.isArray(raw.categories)||!Array.isArray(raw.spots)||raw.spots.length>10000||raw.categories.length>1000)throw Error('Das ist keine gültige FOODHUNT-Datei');if(!raw.categories.every(c=>typeof c.id==='string'&&typeof c.name==='string'&&typeof c.emoji==='string')||!raw.spots.every(s=>typeof s.id==='string'&&typeof s.name==='string'&&typeof s.category==='string'))throw Error('Ungültige Datensätze');if(!window.confirm('Bestehende Food-Spot-Daten durch dieses Backup ersetzen?'))return;categories=raw.categories;spots=raw.spots;ui.category=null;ui.filter='all';ui.search='';$('searchInput').value='';save();render();closeModal();toast('Backup erfolgreich geladen ✓')}catch(err){toast(err.message||'Backup konnte nicht geladen werden')}finally{e.target.value=''}}
function surprise(){const pool=spots.filter(s=>!s.visited&&(ui.category?ui.category===s.category:true));if(!pool.length){toast('Keine offenen Spots in dieser Kategorie');return}const chosen=pool[Math.floor(Math.random()*pool.length)];openModal('spot',chosen.id);toast('Dein nächster Food-Spot: '+chosen.name+' ✳')}
$('todayDate').textContent=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date()).toUpperCase();
document.addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite]');if(favorite){toggleFavorite(favorite.dataset.favorite);return}const nav=e.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return}const cat=e.target.closest('[data-category]');if(cat){setCategory(cat.dataset.category);return}const spot=e.target.closest('[data-spot]');if(spot){openModal('spot',spot.dataset.spot);return}});
$('addSpotTop').onclick=() =>openModal('spot');$('addSpotSection').onclick=()=>openModal('spot');$('emptyAdd').onclick=()=>openModal('spot');$('addCategoryButton').onclick=()=>openModal('category');$('quickCategory').onclick=()=>openModal('category');$('backupButton').onclick=()=>openModal('backup');$('exploreButton').onclick=()=>setView('discover');$('surpriseButton').onclick=surprise;$('closeModal').onclick=closeModal;$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});$('spotName').addEventListener('input',syncMapsLinks);$('spotAddress').addEventListener('input',syncMapsLinks);$('ratingMetricTabs').addEventListener('click',e=>{const button=e.target.closest('[data-metric]');if(!button)return;ui.ratingMetric=button.dataset.metric==='valueScore'?'valueScore':'score';renderRankings()});$('spotForm').addEventListener('submit',saveSpot);$('categoryForm').addEventListener('submit',addCategory);$('deleteSpot').onclick=removeSpot;$('exportData').onclick=backup;$('importData').addEventListener('change',importBackup);$('searchInput').addEventListener('input',e=>{ui.search=e.target.value;renderSpots()});$('sortSelect').addEventListener('change',e=>{ui.sort=e.target.value;renderSpots()});$('quickFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;ui.filter=b.dataset.filter;render()});
render();
})();
