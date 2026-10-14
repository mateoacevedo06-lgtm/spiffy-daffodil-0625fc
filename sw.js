// Service worker de Mate y Lau
// Siempre busca primero la versión nueva en internet; la copia guardada solo se usa sin conexión.
const VERSION = 'empre-v5';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Borra todas las copias viejas (de versiones anteriores)
    const nombres = await caches.keys();
    await Promise.all(nombres.filter(n => n !== VERSION).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Solo los archivos de la propia app (no Firebase, ni fuentes, ni librerías)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const resp = await fetch(req, { cache: 'no-store' });
      if (resp && resp.ok) {
        const cache = await caches.open(VERSION);
        cache.put(req, resp.clone());
      }
      return resp;
    } catch (e) {
      const guardada = await caches.match(req);
      return guardada || Response.error();
    }
  })());
});
