# MiAyudaTIC-Mobile — Android release & deep links

> **Loop diario (emulador + físico + un Metro):** [`MOBILE_DEV.md`](./MOBILE_DEV.md).  
> Este archivo ya **no** describe el flujo diario. Lo que sigue es release, huellas SHA-256 y App Links.
>
> `pnpm dev:usb` quedó como legado. Diario: `pnpm dev:emulator` + `pnpm open:emulator` / `pnpm open:physical`.

APK hoy, Play Store después — misma arquitectura de deep links; solo cambian las huellas en el manifest.

---

## Estado final (jun 2026)

| Componente | Estado |
|------------|--------|
| Flujo mobile forgot → reset → login | ✅ Operativo |
| `assetlinks.json` en producción | ✅ `https://miayudatics.vercel.app/.well-known/assetlinks.json` → JSON |
| Dominio Android (`miayudatics.vercel.app`) | ✅ **verified / `always`** (dev client en Samsung SM-A307G) |
| Intent filters HTTPS + custom scheme | ✅ En dev client instalada |
| Parser + guards | ✅ Sin redirección al navegador |
| SPA web | ✅ Intacta — `/login`, `/forgot`, `/restablecerPassword/:token` siguen siendo HTML |
| Backend / email template | ✅ Sin cambios |
| iOS Universal Links | ❌ Fuera de alcance |
| Rebuild nativo para recovery hoy | ❌ No necesario — Metro para último JS/TS |

### Qué pasó con la verificación de dominio

Android verifica App Links **al instalar** la APK contra `assetlinks.json`. Si la app se instaló **antes** de que Vercel sirviera JSON (cuando el fallback SPA devolvía HTML), el dominio queda en estado **`ask`** y el enlace del correo abre el navegador.

**Solución verificada:** reinstalar la dev client **después** del deploy de `assetlinks.json`. No siempre implica recompilar — puede ser la misma APK. El dominio pasa a **`always`**.

```bash
# Verificar estado en el dispositivo (Android 10/11 — Samsung)
adb shell dumpsys package domain-preferred-apps | grep -A3 miayudatics
# Esperado: Status: always

# En Android 12+ también:
adb shell pm get-app-links com.miayudatics.mobile
```

---

## APK hoy vs Play Store después

| Fase | APK instalada | Huella en manifest | Comando build |
|------|---------------|-------------------|---------------|
| **Desarrollo** | Dev client | `debug` ✅ activa | `pnpm native:build:dev` |
| **QA local** | Release APK | `release_local` ⏳ pendiente | `pnpm native:build:release` |
| **EAS / internal** | EAS production APK | `eas_production` ⏳ pendiente | `eas build --profile production` |
| **Play Store** | Desde tienda | `play_app_signing` ⏳ pendiente | Play App Signing cert |

**Regla:** la huella en `assetlinks.json` debe coincidir con el certificado de la APK **instalada en el dispositivo**. Puedes tener **varias huellas activas** (debug + Play) en el mismo archivo.

Huella debug publicada (jun 2026):

```
FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

### Pendientes Play Store

1. Obtener SHA-256 de `release_local`, `eas_production` y/o `play_app_signing`.
2. Rellenar `client/public/.well-known/android-fingerprints.manifest.json`.
3. `pnpm sync:assetlinks` → redeploy Vercel del `client/`.
4. Reinstalar o distribuir APK firmada con la huella correspondiente.

```bash
pnpm fingerprint:android   # ver estado local vs manifest vs assetlinks
```

---

## Deep links — URLs y routing

| Tipo | URL | Uso |
|------|-----|-----|
| Email (producción) | `https://miayudatics.vercel.app/restablecerPassword/<token>` | App Link verificado |
| Smoke / dev | `miayudatics://restablecerPassword/<token>` | Sin verificación de dominio |
| Alias legacy (ruta) | `/restablecerPassword/<token>` en Expo Router | Reexporta pantalla canónica |

### Archivos mobile (routing)

| Archivo | Rol |
|---------|-----|
| `app.json` | `intentFilters` HTTPS + `scheme: miayudatics` |
| `app/+native-intent.tsx` | Reescribe OS path → `/(auth)/reset-password/<token>` |
| `src/shared/linking/parse-reset-link.ts` | Parser central (HTTPS, scheme, legacy) |
| `app/(auth)/reset-password/[token].tsx` | Pantalla canónica de reset |
| `app/restablecerPassword/[token].tsx` | Alias legacy |
| `app/(auth)/_layout.tsx` | Guards — forgot/reset accesibles con sesión activa o expirada |

El parser y los guards **no abren el navegador**. Si el usuario ve la web, es porque el OS o el cliente de correo no entregó el intent a la app.

---

## Infra web — deploy-safe (sin backend)

| Archivo | Rol |
|---------|-----|
| `client/public/.well-known/android-fingerprints.manifest.json` | Fuente de verdad de huellas |
| `client/public/.well-known/assetlinks.json` | Generado — lo consume Android |
| `client/vercel.json` | Header JSON solo en `assetlinks.json`; rewrite excluye `/.well-known/` |
| `client/scripts/verify-deploy-safe.mjs` | Preflight antes de deploy |
| `client/scripts/sync-assetlinks.mjs` | Sync manifest → assetlinks (también desde mobile: `pnpm sync:assetlinks`) |

**No afecta rutas web:** `/login`, `/forgot`, `/restablecerPassword/:token` siguen siendo SPA (`index.html`).

```bash
# Regenerar assetlinks
pnpm sync:assetlinks

# Validar antes de deploy
cd ../../client && npm run verify:deploy-safe

# Deploy producción (desde raíz del monorepo — Vercel Root Directory = client/)
cd ../.. && npx vercel deploy --prod --yes

# Post-deploy
curl -I https://miayudatics.vercel.app/.well-known/assetlinks.json
# Esperado: Content-Type: application/json
```

---

## Flujo end-to-end

### Infra (una vez o al cambiar huellas)

1. `pnpm sync:assetlinks`
2. `cd client && npm run verify:deploy-safe`
3. Deploy Vercel del `client/`
4. Si la APK ya estaba instalada antes del deploy → **reinstalar** dev client

### Prueba en dispositivo (cada sesión de desarrollo)

1. `pnpm dev:usb` — Metro + último JS/TS (sin rebuild)
2. Abrir dev client → conectar al bundler
3. Login → Recuperar acceso → correo real → tocar enlace → reset nativo → login

---

## Smoke tests

```bash
pnpm deeplink:test                                    # custom scheme
pnpm deeplink:test:https                              # HTTPS (token smoke 64×a)
pnpm deeplink:test:https <token-64-hex-del-correo>    # token real del email
```

Requisito: `adb devices` → `device`.

### Verificar intent filters en APK instalada

```bash
adb shell dumpsys package com.miayudatics.mobile | grep -A20 "Activity Resolver Table"
```

Esperado: esquemas `miayudatics` y `https` con `miayudatics.vercel.app`, path `/restablecerPassword`, `AutoVerify=true`.

---

## Matriz rebuild / no rebuild

| Cambio | Rebuild nativo | Acción adicional |
|--------|----------------|------------------|
| `assetlinks.json` / deploy Vercel | No | Reinstalar APK si dominio quedó en `ask` |
| Parser, guards, pantallas (`app/`, `src/`) | No | `pnpm dev:usb` |
| Manifest de huellas + redeploy | No | Reinstalar si cambia firma del APK |
| `app.json` intentFilters / plugins / deps nativas | **Sí** | `pnpm native:build:dev` |
| Upgrade Expo / React Native | **Sí** | `pnpm native:build:dev` o `:clean` |

---

## Requisitos nativos

- Android SDK (`ANDROID_HOME`)
- **JDK 17**
- `adb devices` → `device`

## Builds

```bash
pnpm native:build:dev        # dev client + Metro (daily)
pnpm native:build:dev:clean  # prebuild inconsistente
pnpm native:build:release  # release APK standalone (QA)
```

## Windows: `C:\miayuda`

Scripts `native:*` sincronizan a path corto (límite CMake). No uses `expo run:android` desde el repo en Windows.

---

## No se toca

Web SPA como producto, backend, template de correo, iOS, biometría, login por ID, rewrites agresivos fuera de `/.well-known/*`.
