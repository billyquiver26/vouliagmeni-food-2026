/* Travel Food Guide — offline service worker (NETWORK-FIRST for content) */
/* Bump CACHE (v1 -> v2 ...) whenever you want to force all installed clients to refresh. */
const CACHE = 'food-guide-v1';
const SHELL = ['./','./index.html','./manifest.json'];
self.addEventListener('install', (e)=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})); });
self.addEventListener('activate', (e)=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', (e)=>{
  const req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ /* always try network so content edits show; cache only when offline */
    e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});return res;}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;}).catch(()=>cached)));
});
