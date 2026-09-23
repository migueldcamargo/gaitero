/* GAITERO MATH — funciona sem internet depois de aberto uma vez (site hospedado).
   Ao mudar qualquer arquivo do app, troque a versão abaixo para os celulares baixarem de novo. */
const CACHE = 'gaitero-math-v10';
const FILES = [
  './', 'index.html', 'style.css', 'logic.js', 'formulas.js', 'contas.js', 'questions.js', 'variations.js', 'app.js',
  'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png'
];
const OPTIONAL = ['assets/splash.jpg', 'assets/avatar.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => Promise.all(OPTIONAL.map(f => c.add(f).catch(() => null))))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (pega as atualizações); sem internet, usa a cópia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
