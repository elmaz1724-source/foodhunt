/* FOODHUNT shell: works offline once loaded at least once over HTTPS. */
const CACHE='foodhunt-shell-v12';
const ASSETS=['./','./index.html','./style.css','./v3.css','./v4.css','./v5.css','./v6.css','./v7.css','./v7.js','./v8.css','./v8.js','./theme.js','./seed.js','./app.js','./manifest.json','./favicon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('foodhunt-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin) return;
 e.respondWith(fetch(req).then(response=>{
   if(response.ok){const clone=response.clone();caches.open(CACHE).then(c=>c.put(req,clone));}
   return response;
 }).catch(()=>caches.match(req).then(cached=>cached|| (req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
