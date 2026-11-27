/* 단잠 23 — 홈 화면 앱(PWA) 캐시. 파일을 새로 올리면 VERSION 숫자를 올려 주세요. */
var VERSION = 'danjam23-v7';
var CORE = [
  './',
  './index.html',
  './admin.html',
  './clean.html',
  './i18n.js',
  './manifest.json',
  './images/roof-tower.jpg',
  './images/twin-window.jpg',
  './images/double-bed.jpg',
  './images/double-warm.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){
      return Promise.all(CORE.map(function(u){
        return c.add(new Request(u, { cache: 'reload' })).catch(function(){ /* 파일이 없어도 설치를 막지 않음 */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return (k !== VERSION) ? caches.delete(k) : null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate'){
    e.respondWith(
      fetch(req).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match('./'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && res.status === 200 && res.type === 'basic'){
          var copy = res.clone();
          caches.open(VERSION).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
    })
  );
});
