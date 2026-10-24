(()=>{
'use strict';
const get=id=>document.getElementById(id);
const form=get('spotForm');
if(!form)return;
const visited=get('spotVisited');
const visitButtons=[...form.querySelectorAll('[data-visit-option]')];
const feedback=document.createElement('p');
feedback.className='visit-feedback';
feedback.setAttribute('role','status');
feedback.hidden=true;
form.querySelector('.visit-switch').insertAdjacentElement('afterend',feedback);
const scoreFields=[
 {id:'spotScore',range:'spotScoreRange',label:'spotScoreFeedback',type:'taste'},
 {id:'spotValueScore',range:'spotValueScoreRange',label:'spotValueScoreFeedback',type:'value'}
];
function hasRating(){
 return scoreFields.some(({id})=>get(id).value.trim()!=='');
}
function scoreDescription(value,type){
 if(value===null)return 'Noch offen';
 if(type==='value'){
  if(value>=9)return 'Jeden Euro wert';
  if(value>=8)return 'Lohnt sich';
  if(value>=6)return 'Fairer Preis';
  if(value>=4)return 'Geht so';
  return 'Eher teuer dafür';
 }
 if(value>=9)return 'Legendär';
 if(value>=8)return 'Richtig stark';
 if(value>=6)return 'Gut';
 if(value>=4)return 'Okay';
 return 'Geht besser';
}
function syncStatus(){
 const current=visited.value==='true'?'true':'false';
 visitButtons.forEach(button=>{
  const active=button.dataset.visitOption===current;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 form.classList.toggle('has-visited',current==='true');
}
function syncRating(config){
 const text=get(config.id).value.trim();
 const parsed=text===''?null:Number(text);
 const valid=parsed!==null&&Number.isFinite(parsed)&&parsed>=0&&parsed<=10;
 const value=valid?parsed:null;
 const slider=get(config.range);
 slider.value=String(value??0);
 slider.style.setProperty('--pct',(value===null?0:(value/10)*100)+'%');
 get(config.label).textContent=scoreDescription(value,config.type);
 const clear=form.querySelector('[data-clear-rating="'+config.id+'"]');
 if(clear){clear.disabled=value===null;clear.setAttribute('aria-label',value===null?'Keine Bewertung vorhanden':'Bewertung zurücksetzen');}
}
function showNotice(message){
 feedback.textContent=message;
 feedback.hidden=!message;
}
function syncAll(){
 syncStatus();
 scoreFields.forEach(syncRating);
 showNotice('');
 const details=form.querySelector('.review-more-info');
 if(details)details.open=!!get('spotAddress').value.trim();
}
for(const config of scoreFields){
 const number=get(config.id),slider=get(config.range);
 slider.addEventListener('input',()=>{
  number.value=String(Number(slider.value));
  visited.value='true';
  syncRating(config);
  syncStatus();
  showNotice('');
 });
 number.addEventListener('input',()=>{
  if(number.value.trim()!==''){
   visited.value='true';
   syncStatus();
   showNotice('');
  }
  syncRating(config);
 });
 number.addEventListener('change',()=>syncRating(config));
}
form.addEventListener('click',e=>{
 const option=e.target.closest('[data-visit-option]');
 if(option){
  const next=option.dataset.visitOption;
  if(next==='false'&&hasRating()){
   showNotice('Um den Spot wieder auf „Noch offen“ zu setzen, entferne zuerst beide Bewertungen mit ↺.');
   return;
  }
  visited.value=next;
  syncStatus();
  showNotice('');
  return;
 }
 const clear=e.target.closest('[data-clear-rating]');
 if(clear){
  const config=scoreFields.find(c=>c.id===clear.dataset.clearRating);
  if(!config)return;
  get(config.id).value='';
  syncRating(config);
  showNotice('');
  return;
 }
});
visited.addEventListener('change',syncStatus);
document.addEventListener('foodhunt:spot-form-opened',syncAll);
syncAll();
})();