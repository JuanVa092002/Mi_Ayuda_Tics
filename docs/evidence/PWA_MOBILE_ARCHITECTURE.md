# PWA Mobile Architecture — MiAyudaTIC
> Source of truth for the mobile delivery strategy. HEAD: 2ac0504 | Confirmed: 2026-10-10

## Decision: PWA over Native App

At the end of the project, the decision was made to use the PWA (Progressive Web App) built on `client/` as the official mobile delivery strategy, rather than the Expo/React Native app in `mobile/`.

**Rationale** (inferred from implementation):
- Single codebase covers web + mobile (no separate deployment)
- Installable on Android and iOS via browser
- No app store friction
- Immediate updates via Service Worker
- Existing web investment extended to mobile

## Architecture

### 1. Mobile Detection (`usePhoneLayout.ts`)

The mobile detection system in `client/src/features/auth/phone/usePhoneLayout.ts` uses a **triple detection strategy**:

```typescript
// 1. User Agent detection (primary)
const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile']

// 2. Viewport detection (secondary)
const isMobileViewport = window.innerWidth < 768

// 3. Touch detection (tertiary)
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

// Returns true if ANY condition matches
return isMobileUA || isMobileViewport || isTouchDevice
```

- **Primary detection**: UserAgent string matching for known mobile devices
- **Secondary detection**: Viewport width < 768px
- **Tertiary detection**: Touch capability detection
- **Combined**: Returns `true` if ANY condition matches, providing robust mobile detection

### 2. Phone UI Layer (`client/src/features/auth/phone/`)

Seven dedicated components provide mobile-native UI:

#### PhoneChrome.tsx
Base layout system with custom design tokens:
- **Color palette**: Navy blue `#04324D`, Green `#39A900`, Text `#2E3E5C`
- **Custom icon set**: 15 Feather-style icons optimized for touch targets
- **PhoneScreen component**: `max-w-480px`, portrait-optimized layout system
- **SENA branding**: Logo integration and brand-compliant typography

#### PhoneWelcome.tsx
Mobile landing screen:
- Full-screen portrait layout
- SENA branding + Login/Register calls-to-action
- Touch-optimized button sizes (56px height)

#### PhoneLogin.tsx
Mobile-optimized authentication:
- Email + password fields with icon integration
- Custom touch target sizes
- Visual feedback states (focus, error)

#### PhoneRegister.tsx
Mobile registration flow:
- Multi-field form optimized for smaller screens
- Portrait layout with scroll handling
- Custom keyboard input modes

#### PhoneForgot.tsx & PhoneResetPassword.tsx
Password recovery flows:
- Touch-optimized email input
- Confirmation code handling
- New password entry with visibility toggle

### 3. Responsive Post-Auth UX

Pages for Funcionario, Técnico, and Líder roles are **responsive-first**:
- Tailwind breakpoints (`sm:`, `md:`) handle viewport changes
- Touch targets sized appropriately for mobile
- Scroll containers handle limited viewport height
- Navigation optimized for portrait orientation

### 4. PWA Configuration

#### manifest.json
```json
{
  "name": "MiAyudaTIC - SENA CTPI",
  "short_name": "MiAyudaTIC",
  "description": "Sistema de Gestión y Soporte Técnico TIC - SENA CTPI",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#04324d",
  "theme_color": "#04324d",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "purpose": "maskable" }
  ],
  "prefer_related_applications": false,
  "shortcuts": [
    { "name": "Ver Casos", "url": "/casos", "icons": [...], "short_name": "Casos" },
    { "name": "Radicar Solicitud", "url": "/funcionario?tab=radicar", "icons": [...], "short_name": "Radicar" }
  ]
}
```

Key features:
- `display: "standalone"` removes browser chrome
- `orientation: "portrait-primary"` enforces portrait mode
- SENA navy theme color (`#04324d`) for loading screens
- Application shortcuts for quick access to common actions

### 5. Service Worker (sw.js v7)

The Service Worker implements a **hybrid caching strategy**:

#### Network-First for Navigation
```javascript
// NAVEGACIÓN HTML: Network-First
event.respondWith(
  fetch(request)
    .catch(() => {
      return caches.match(OFFLINE_PAGE) || 
             new Response('Offline', { status: 503 })
    })
)
```

#### Cache-First for Versioned Assets
```javascript
// ASSETS (Vite hashed): Cache-First
event.respondWith(
  caches.open(CACHE_VERSION)
    .then(cache => {
      return cache.match(request)
        .then(cached => {
          if (cached) return cached
          return fetch(request)
        })
    })
)
```

#### API Caching with Fallback
```javascript
// API: Network-First con fallback
event.respondWith(
  fetch(request)
    .then(response => {
      if (response && response.ok) {
        const cloned = response.clone()
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(request, cloned)
        })
      }
      return response
    })
    .catch(() => {
      return caches.match(request)
    })
)
```

### 6. Platform Support

#### iOS Safari
- `apple-mobile-web-app-capable` for standalone mode
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `apple-touch-icon` for home screen icons
- Manual install instructions in PWA prompt

#### Android Chrome
- `beforeinstallprompt` event handling
- Automatic install prompt (5s delay, role-aware)
- `mobile-web-app-capable` meta tag

#### Desktop Fallback
- Gracefully degrades to regular web app
- Install prompts hidden on desktop (except role-specific nudges)

### 7. Offline Experience

#### offline.html
- Branded offline page with SENA styling
- Animated loading spinner
- Reconnection check with auto-reload
- Themed to match app colors

### 8. Auto-Update Mechanism

The `scripts/update-version.mjs` prebuild script:
```javascript
// Bumps version.json with timestamp + git hash
const version = {
  timestamp: Date.now(),
  git: process.env.GIT refrigerated || 'local',
  commit: process.env.GIT_HASH || 'local'
}
```

The Service Worker checks this every 5 minutes:
```javascript
// In service worker
setInterval(() => {
  fetch('/version.json')
    .then(r => r.json())
    .then(v => {
      if (v.timestamp > currentVersion) {
        self.skipWaiting()
        clients.claim()
      }
    })
}, 5 * 60 * 1000)
```

Controller change triggers auto-reload.

### 9. Install Prompts

#### PWAInstallPrompt.tsx (Mobile)
- Detects on mobile devices only
- Shows persistent banner until dismissed
- Android: Uses `beforeinstallprompt` API
- iOS: Shows manual Safari instructions
- Role-aware positioning (bottom, non-intrusive)

#### MobileNudgeBanner (Desktop)
- Shows on desktop browser
- Encourages mobile users to "Add to Home Screen"
- SessionStorage dismiss (reappears on new session)
- Role-filtered (funcionario/tecnico only)

## Expo App (mobile/)

The Expo/React Native app exists but is **not the production choice**:

- Located in `mobile/` directory
- Expo 56 + React Native 0.85.3
- Phases 0-2C completed (auth, solicitudes, técnicos)
- Offline queue for técnico mutations
- 6-state `SessionStatus` session machine
- **Status**: Nearly complete (~80-100% built)
- **Decision**: Replaced by PWA strategy at project end

## Known Limitations

### Push Notifications
- No active FCM/APNS integration
- PWA push not implemented (stub exists)
- SSE realtime only works when app is open
- No background sync capabilities

### Platform Constraint
- iOS Safari lacks proper PWA support
- No deep link routing in iOS PWA
- Limited splash screen customization

### Data Staleness
- Service Worker cache can become stale
- No aggressive cache invalidation strategy
- Version check runs every 5 minutes

### Device Features
- No camera direct access (workaround: file upload)
- No geolocation services
- No background processing
