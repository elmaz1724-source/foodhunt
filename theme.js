(()=>{
 'use strict';
 const KEY='foodhunt-theme-v1';
 const root=document.documentElement;
 let theme=root.dataset.theme==='light'?'light':'dark';
 function apply(next){
  theme=next==='light'?'light':'dark';
  root.dataset.theme=theme;
  root.style.colorScheme=theme;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=theme==='dark'?'#191716':'#f6efe7';
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
   const isDark=theme==='dark';
   button.setAttribute('aria-label',isDark?'Helles Design aktivieren':'Dunkles Design aktivieren');
   button.setAttribute('aria-pressed',String(!isDark));
   button.title=isDark?'Zu Light Mode wechseln':'Zu Dark Mode wechseln';
   const glyph=button.querySelector('.theme-glyph');
   if(glyph)glyph.textContent=isDark?'☀':'☾';
   const label=button.querySelector('.theme-text');
   if(label)label.textContent=isDark?'Hell':'Dunkel';
  });
  try{localStorage.setItem(KEY,theme)}catch{}
 }
 document.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-theme-toggle]');
  if(toggle){apply(theme==='dark'?'light':'dark');return}
  const add=e.target.closest('[data-mobile-add]');
  if(add){document.getElementById('addSpotTop')?.click();return}
  const nav=e.target.closest('.mobile-nav-link[data-view]');
  if(nav){document.querySelectorAll('.mobile-nav-link[data-view]').forEach(x=>x.classList.toggle('selected',x.dataset.view===nav.dataset.view))}
 });
 const mainNav=document.querySelector('.main-nav');
 if(mainNav){
  const observer=new MutationObserver(()=>{
   const active=mainNav.querySelector('.nav-link.selected[data-view]');
   if(active)document.querySelectorAll('.mobile-nav-link[data-view]').forEach(x=>x.classList.toggle('selected',x.dataset.view===active.dataset.view));
  });
  observer.observe(mainNav,{subtree:true,attributes:true,attributeFilter:['class']});
 }
 apply(theme);
})();

