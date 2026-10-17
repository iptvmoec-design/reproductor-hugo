/* Service worker de IPTV MOEC: guarda la propia app para que abra al instante y sin conexión.
   NO toca listas, API del servidor, imágenes ni vídeo: eso siempre va directo a la red. */
var V='moec-v1', SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
var LIBS=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//;
self.addEventListener('install',function(e){ e.waitUntil(caches.open(V).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(x){ return x!==V; }).map(function(x){ return caches.delete(x); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET') return;
  var u=new URL(r.url), same=u.origin===location.origin;
  if(!same&&!LIBS.test(r.url)) return;            /* listas, servidor IPTV, logos, vídeo: red directa */
  if(r.headers.has('range')) return;
  e.respondWith(caches.open(V).then(function(c){
    return c.match(r,{ignoreSearch:same}).then(function(hit){
      var net=fetch(r).then(function(res){ if(res&&(res.ok||res.type==='opaque')) c.put(r,res.clone()); return res; }).catch(function(){ return hit; });
      return hit||net;                              /* abre al instante y se actualiza por detrás */
    });
  }));
});
