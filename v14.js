/* FOODHUNT V14 — accessible modal focus, without changing app data/state. */
(()=>{
 'use strict';
 const backdrop=document.getElementById('modalBackdrop');
 const dialog=backdrop?.querySelector('[role="dialog"]');
 const heading=document.getElementById('modalTitle');
 if(!backdrop||!dialog||!heading||typeof MutationObserver==='undefined')return;
 let opened=!backdrop.classList.contains('hidden');
 let opener=null;
 let returnFocus=null;
 const isOpen=()=>!backdrop.classList.contains('hidden');
 const candidate=selector=>document.activeElement?.matches?.(selector);
 const focusables=()=>Array.from(dialog.querySelectorAll(
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
 )).filter(node=>!node.closest('.hidden')&&node.getClientRects().length>0&&
   node.getAttribute('aria-hidden')!=='true');
 // Capture the actual trigger before the main app's delegated click handler opens the dialog.
 document.addEventListener('click',event=>{
  if(isOpen())return;
  const trigger=event.target.closest?.('button, a[href], [role="button"]');
  if(trigger)opener=trigger;
 },true);
 new MutationObserver(()=>{
  const now=isOpen();
  if(now===opened)return;
  opened=now;
  if(now){
   const active=document.activeElement;
   returnFocus=opener?.isConnected?opener:
    (active&&active!==document.body&&!dialog.contains(active)?active:null);
   heading.focus({preventScroll:true});
  }else{
   const target=returnFocus;
   returnFocus=null;
   opener=null;
   if(target?.isConnected&&!target.hasAttribute('disabled')){
    target.focus({preventScroll:true});
   }
  }
 }).observe(backdrop,{attributes:true,attributeFilter:['class']});
 document.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||!isOpen())return;
  const items=focusables();
  if(!items.length){event.preventDefault();heading.focus({preventScroll:true});return;}
  const first=items[0],last=items[items.length-1],active=document.activeElement;
  if(event.shiftKey&&(active===first||active===heading||!dialog.contains(active))){
   event.preventDefault();last.focus();return;
  }
  if(!event.shiftKey&&(active===last||!dialog.contains(active))){
   event.preventDefault();first.focus();
  }
 },true);
})();
