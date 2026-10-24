(()=>{
'use strict';
const area=document.getElementById('nextBiteCard');
if(!area||!window.FOODHUNT_API)return;
let alternate=0;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const escapeAttr=escapeHTML;
const escapeString=s=>String(s||'').trim();
const mapsLink=s=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([s.name,s.address||'Hamburg'].join(', '));
function dayIndex(){
  const now=new Date();
  const key=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
  return ((key*17)^((key>>>2)*13))>>>0;
}
function renderPick(){
 const spots=window.FOODHUNT_API.getSpots();
 const categories=window.FOODHUNT_API.getCategories();
 const unvisited=spots.filter(s=>!s.visited);
 if(!unvisited.length){
  area.innerHTML='<div class="next-bite-done"><span aria-hidden="true">✳</span><strong>Alles probiert!</strong><small>Du hast deine ganze Liste getestet. Zeit für neue Spots.</small><button type="button" data-view="discover">Mehr entdecken ↗</button></div>';
  return;
 }
 const spot=unvisited[(dayIndex()+alternate)%unvisited.length];
 const cat=categories.find(c=>c.id===spot.category)||{name:'Food',emoji:'🍽️'};
 const label=escapeHTML(cat.name);
 const emoji=escapeHTML(cat.emoji);
 const name=escapeHTML(spot.name);
 area.innerHTML=`<div class="next-pick-icon" aria-hidden="true">${emoji}</div>
 <div class="next-pick-info"><span class="next-pick-type">${label} · Noch nicht getestet</span><strong>${name}</strong><div class="next-pick-actions"><button type="button" class="next-pick-open" data-pick-open="${escapeAttr(spot.id)}">Spot ansehen <span aria-hidden="true">↗</span></button><a class="next-pick-map" target="_blank" rel="noopener noreferrer" href="${escapeAttr(mapsLink(spot))}">Maps ↗</a></div></div>
 <button type="button" class="next-pick-shuffle" data-pick-refresh aria-label="Anderen Food-Spot vorschlagen" title="Anderen Spot vorschlagen">↻</button>`;
}
area.addEventListener('click',e=>{
 const refresh=e.target.closest('[data-pick-refresh]');
 if(refresh){alternate+=1;renderPick();return;}
 const open=e.target.closest('[data-pick-open]');
 if(open){window.FOODHUNT_API.openSpot(open.dataset.pickOpen);}
});
document.addEventListener('foodhunt:datachange',renderPick);
renderPick();
})();