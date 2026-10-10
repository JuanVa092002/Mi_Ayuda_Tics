// Service Worker - MiAyudaTIC PWA v7
// Network-first para HTML y navegación, cache-first para assets hasheados

const CACHE_VERSION = 'miayudatics-v7'
const OFFLINE_PAGE = '/offline.html'

// App shell: crítico para funcionamiento offline
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html'
]

// Instalar: precachear app shell + descartar viejos caches
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[SW] Precaching critical assets...')
        return cache.addAll(CRITICAL_ASSETS).catch(err => {
          console.warn('[SW] Precache failed (offline ok):', err)
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activar: elimina caches viejos, toma control inmediato
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => {
        return Promise.all(
          names
            .filter(name => name !== CACHE_VERSION)
            .map(name => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Claiming all clients')
        return self.clients.claim()
      })
  )
})

// Fetch: estrategia según el tipo de request
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  const isApi = url.pathname.startsWith('/api/')

  // Solo interceptar requests al mismo origin
  if (url.origin !== self.location.origin) return

  // === ARCHIVOS CRÍTICOS DE PWA: siempre network-first, nunca cachear ===
  // El manifest y sw.js deben ser siempre frescos para que el splash se actualice
  if (url.pathname === '/manifest.json' || url.pathname === '/sw.js') {
    event.respondWith(fetch(request))
    return
  }

  // === NAVEGACIÓN HTML: Network-First ===
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('[SW] Navigation failed, serving offline page')
          return caches.match(OFFLINE_PAGE) || 
                 new Response('Offline', { status: 503 })
        })
    )
    return
  }

  // === API: Network-First con fallback ===
  if (isApi) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache éxito (200-299)
          if (response && response.ok) {
            const cloned = response.clone()
            caches.open(CACHE_VERSION).then(cache => {
              cache.put(request, cloned)
            })
          }
          return response
        })
        .catch(() => {
          console.log('[SW] API request failed, checking cache')
          return caches.match(request)
        })
    )
    return
  }

  // === ASSETS (Vite hashed): Cache-First ===
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_VERSION)
        .then(cache => {
          return cache.match(request)
            .then(cached => {
              if (cached) return cached

              return fetch(request)
                .then(response => {
                  if (response && response.ok) {
                    cache.put(request, response.clone())
                  }
                  return response
                })
                .catch(() => {
                  console.warn('[SW] Asset fetch failed:', request.url)
                  return null
                })
            })
        })
    )
    return
  }

  // === FONTS y otros: Stale-While-Revalidate ===
  if (url.pathname.includes('fonts.googleapis') || 
      url.pathname.includes('fonts.gstatic') ||
      url.pathname.includes('material-symbols')) {
    event.respondWith(
      caches.open(CACHE_VERSION)
        .then(cache => {
          return cache.match(request)
            .then(cached => {
              const fetchPromise = fetch(request)
                .then(response => {
                  if (response && response.ok) {
                    cache.put(request, response.clone())
                  }
                  return response
                })
                .catch(() => cached)

              return cached || fetchPromise
            })
        })
    )
    return
  }

  // === DEFAULT: Network-First ===
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
          .catch(() => caches.match(OFFLINE_PAGE))
      })
  )
})

// Message handling: skip waiting para hot-reload
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING triggered')
    self.skipWaiting()
  }
})
