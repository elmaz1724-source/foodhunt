(()=>{
'use strict';
const $=id=>document.getElementById(id);
const form=$('spotForm'),list=$('productList'),editor=$('productEditor');
if(!form||!list||!editor)return;
const cleanHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=n=>Number(n).toFixed(1).replace('.',',');
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const validScore=n=>n!==null&&n!==undefined&&Number.isFinite(Number(n))&&Number(n)>=0&&Number(n)<=10;
let draft=[],editingId=null,oldScore=null,oldDish='',startWithProducts=false,legacyScore=null;
const copyItems=()=>draft.map(p=>({...p}));
const stats=()=>{
 const scored=draft.filter(p=>validScore(p.score));
 const average=scored.length?Math.round(scored.reduce((acc,p)=>acc+Number(p.score),0)/scored.length*10)/10:null;
 const best=scored.length?[...scored].sort((a,b)=>Number(b.score)-Number(a.score))[0]:null;
 return {total:draft.length,average,best};
};
function scoreControl(){
 const stat=stats(),hasItems=stat.average!==null;
 const number=$('spotScore'),range=$('spotScoreRange'),clear=form.querySelector('[data-clear-rating="spotScore"]');
 if(hasItems){
  number.value=String(stat.average);
  $('spotVisited').value='true';
 }else if(startWithProducts){
  number.value=legacyScore===null?'':String(legacyScore);
 }else if(draft.length===0){
  number.value=oldScore===null?'':String(oldScore);
 }
 number.readOnly=hasItems;
 range.disabled=hasItems;
 if(clear)clear.disabled=hasItems;
 number.dispatchEvent(new Event('change',{bubbles:true}));
 if(hasItems&&clear)clear.disabled=true;
 $('derivedRatingNotice').textContent=hasItems
  ?'★ Automatisch aus '+draft.filter(p=>validScore(p.score)).length+' Produktbewertung(en) berechnet. Bearbeite deine Gerichte, um die Restaurantnote zu ändern. Preis-Leistung bleibt separat.'
  :'Keine bewerteten Gerichte: Du kannst weiterhin eine persönliche Gesamtbewertung vergeben. Sobald du Produkte bewertest, übernimmt ihr Durchschnitt.';
 $('derivedRatingNotice').classList.toggle('is-derived',hasItems);
 $('spotForm').classList.toggle('has-products',hasItems);
 $('spotVisited').dispatchEvent(new Event('change',{bubbles:true}));
}
function dateLabel(raw){
 if(!raw)return '';
 const [year,month,day]=String(raw).split('-');
 return year&&month&&day?day+'.'+month+'.'+year:'';
}
function render(){
 const {total,average,best}=stats();
 const summary=$('productSummary');
 if(total===0){
  summary.innerHTML='<div class="products-empty"><span aria-hidden="true">🍽️</span><div><strong>Noch keine Gerichte bewertet</strong><p>Teste ein Gericht oder füge einen weiteren Besuch hinzu.</p></div></div>';
 }else{
  summary.innerHTML='<div class="product-stats-row"><div class="product-stat"><span>GESAMT</span><strong>'+(average===null?'–':fmt(average))+'<small> / 10</small></strong></div><div class="product-stat"><span>GERICHTE</span><strong>'+total+'</strong></div><div class="product-stat best-product-stat"><span>BESTER BITE</span><strong>'+(best?cleanHTML(best.name):'Noch offen')+'</strong></div></div>';
 }
 list.innerHTML=draft.map(p=>{
  const isBest=best&&best.id===p.id;
  return '<article class="product-entry '+(isBest?'is-best':'')+'">'
    +'<div class="product-entry-score"><strong>'+fmt(p.score)+'</strong><small>/ 10</small></div>'
    +'<div class="product-entry-info"><strong>'+cleanHTML(p.name)+'</strong>'
    +(isBest?'<span class="product-entry-badge">✦ BESTER BITE</span>':'')
    +'<span class="product-entry-meta">'+(p.date?dateLabel(p.date):'Besuch ohne Datum')+(p.price!==null&&p.price!==undefined?' · '+Number(p.price).toFixed(2).replace('.',',')+' €':'')+'</span>'
    +(p.note?'<p>'+cleanHTML(p.note)+'</p>':'')+'</div>'
    +'<div class="product-entry-actions"><button type="button" data-product-edit="'+cleanHTML(p.id)+'" aria-label="'+cleanHTML(p.name)+' bearbeiten">✎</button><button type="button" data-product-delete="'+cleanHTML(p.id)+'" aria-label="'+cleanHTML(p.name)+' löschen">×</button></div></article>';
 }).join('');
 const old=$('productLegacyNotice');
 const legacy=legacyScore!==null?legacyScore:oldScore;
 if(total===0&&legacy!==null){
  old.classList.remove('hidden');
  old.innerHTML='<strong>Bisherige Restaurantnote: '+fmt(legacy)+' / 10</strong><br>Die alte Note bleibt erhalten, bis du ein echtes Gericht bewertest. Danach wird die Gesamtwertung aus den Gerichten berechnet.'+(oldDish?'<br><button type="button" id="productImportLegacy">„'+cleanHTML(oldDish)+'“ mit der alten Note übernehmen ↗</button>':'');
 }else if(total>0&&legacyScore!==null){
  old.classList.remove('hidden');
  old.textContent='Deine frühere Gesamtnote ('+fmt(legacyScore)+') bleibt als Referenz gespeichert. Die aktuelle Note basiert auf den Gerichten.';
 }else{
  old.classList.add('hidden');
  old.textContent='';
 }
 scoreControl();
}
function error(message){
 const el=$('productError');el.textContent=message;el.classList.remove('hidden');
}
function openEditor(id=null,legacy=false){
 editingId=id;
 const existing=id?draft.find(p=>p.id===id):null;
 editor.classList.remove('hidden');
 $('productEditorHeading').textContent=existing?'Gericht bearbeiten':'Neuen Bite bewerten';
 $('productError').classList.add('hidden');
 $('productName').value=existing?.name||(legacy?oldDish:'');
 $('productRating').value=existing?String(existing.score):(legacy&&oldScore!==null?String(oldScore):'');
 $('productPrice').value=existing?.price??'';
 $('productDate').value=existing?.date??today();
 $('productNote').value=existing?.note??'';
 syncEditorRating();
 editor.scrollIntoView({block:'nearest',behavior:'smooth'});
 if(window.innerWidth>720)$('productName').focus();
}
function closeEditor(){
 editor.classList.add('hidden');
 editingId=null;
 $('productError').classList.add('hidden');
}
function syncEditorRating(){
 const raw=$('productRating').value.trim(),num=raw===''?null:Number(raw);
 const val=validScore(num)?num:null;
 $('productRatingRange').value=String(val??0);
 $('productRatingRange').style.setProperty('--pct',(val===null?0:val*10)+'%');
 $('productRatingHint').textContent=val===null?'Note von 0 bis 10 wählen':(fmt(val)+'/10 · '+(val>=9?'Legendär':val>=8?'Stark':val>=6?'Solide':val>=4?'Okay':'Enttäuschend'));
}
function commitPending(){
 if(editor.classList.contains('hidden'))return true;
 return saveProduct();
}
function saveProduct(){
 const name=$('productName').value.trim();
 const rawScore=$('productRating').value.trim(),score=rawScore===''?null:Number(rawScore);
 const rawPrice=$('productPrice').value.trim(),price=rawPrice===''?null:Number(rawPrice);
 if(!name){error('Bitte gib einen Produktnamen ein.');$('productName').focus();return false;}
 if(!validScore(score)){error('Bitte gib eine Bewertung zwischen 0 und 10 ein.');$('productRating').focus();return false;}
 if(price!==null&&(!Number.isFinite(price)||price<0||price>9999)){error('Bitte überprüfe den Preis.');return false;}
 if(draft.length>=300&&!editingId){error('Maximal 300 Gerichte pro Restaurant.');return false;}
 const obj={id:editingId||('dish-'+Date.now()+'-'+Math.random().toString(36).slice(2,9)),name:name.slice(0,120),score:Math.round(score*10)/10,price:price===null?null:Math.round(price*100)/100,date:$('productDate').value||'',note:$('productNote').value.trim().slice(0,300)};
 if(editingId){draft=draft.map(p=>p.id===editingId?obj:p);}
 else draft.push(obj);
 closeEditor();render();return true;
}
const reset=()=>{
 const id=$('spotId').value;
 const spot=window.FOODHUNT_API?.getSpots().find(s=>s.id===id);
 draft=Array.isArray(spot?.products)?spot.products.filter(p=>p&&p.name&&validScore(p.score)).map(p=>({...p})):[];
 editingId=null;
 startWithProducts=Array.isArray(spot?.products)&&spot.products.length>0;
 legacyScore=validScore(spot?.legacyScore)?Number(spot.legacyScore):null;
 oldScore=validScore(spot?.score)?Number(spot.score):null;
 oldDish=spot?.dish||'';
 closeEditor();
 render();
};
$('productAdd').addEventListener('click',()=>openEditor());
$('productSave').addEventListener('click',saveProduct);
$('productCancel').addEventListener('click',closeEditor);
$('productRating').addEventListener('input',syncEditorRating);
$('productRatingRange').addEventListener('input',e=>{
 $('productRating').value=String(Number(e.target.value));
 syncEditorRating();
});
list.addEventListener('click',e=>{
 const edit=e.target.closest('[data-product-edit]');
 if(edit){openEditor(edit.dataset.productEdit);return;}
 const del=e.target.closest('[data-product-delete]');
 if(del){
  const p=draft.find(p=>p.id===del.dataset.productDelete);
  if(!p)return;
  if(!window.confirm('„'+p.name+'“ aus deinen Gerichten entfernen?'))return;
  draft=draft.filter(x=>x.id!==p.id);
  render();
 }
});
$('productLegacyNotice').addEventListener('click',e=>{
 if(e.target.closest('#productImportLegacy'))openEditor(null,true);
});
document.addEventListener('foodhunt:spot-form-opened',reset);
window.FOODHUNT_PRODUCT_EDITOR={getItems:()=>copyItems(),commitPending};
})();