// Service Worker - MiAyudaTics
// Versión 3 - cache-busting: invalida cualquier versión anterior
const CACHE_VERSION = 'miayudatics-v3'

// Instalar: toma control inmediatamente sin esperar
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activar: elimina TODOS los caches viejos y reclama clientes activos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  )
})

// Fetch: network-first para HTML, cache-first para assets con hash
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Solo interceptar requests a nuestro propio origin
  if (url.origin !== self.location.origin) return

  // Para HTML (navegación) y rutas SPA: SIEMPRE red, sin cache
  if (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    // Rutas de la SPA
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/forgot') ||
    url.pathname.startsWith('/funcionario') ||
    url.pathname.startsWith('/casos') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/perfil') ||
    url.pathname.startsWith('/restablecerPassword')
  ) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Para assets con hash (Vite): cache-first con actualización en background
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          // Si está en cache, devolver inmediato; sino esperar red
          return cached || networkFetch
        })
      )
    )
    return
  }
})
