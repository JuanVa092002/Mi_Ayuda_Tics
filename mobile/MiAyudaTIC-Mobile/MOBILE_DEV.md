# MiAyudaTIC Mobile — Guía de desarrollo

**Fuente única de verdad para el loop diario.**  
Release, huellas y App Links de producción: [`mobile-android-dev-build.md`](./mobile-android-dev-build.md) (complemento; no describe el flujo diario).

---

## A. Principio central

> Un runtime nativo por dispositivo, un solo bundle JavaScript desde Metro.  
> Release es un corte de calidad, no un IDE.

| Capa | Qué es | Cómo se confirma |
|------|--------|------------------|
| **Development build** | APK debug con `expo-dev-client` | `DEBUGGABLE` **y** `expo.modules.devlauncher` en dumpsys; el launcher carga JS de Metro |
| **Metro :8081** | Bundle JS/TS del repo | `http://127.0.0.1:8081/status` → 200 (IPv4). `[::1]:8081` no es el camino oficial |
| **APK standalone / release** | JS embebido, sin Metro | No usa el launcher de dev-client contra :8081 |

`DEBUGGABLE` **no basta** para llamarla development build. Hace falta el launcher de Expo Dev Client **y** que reciba el bundle actual de Metro.

**Expo Go no se usa.** Package `com.miayudatics.mobile`. En `app.json`: `scheme` `miayudatics`, `slug` `miayudatics`. El URI de **dev client** lo emite Expo (`GET /_expo/open?platform=android&runtime=custom`): `exp+miayudatics://expo-development-client/?url=…`. El query `url` es el **origen de Metro**, no el deep link de la app.

### Topología oficial (un Metro, dos caminos)

| Dispositivo | Acceso a Metro (bundle) | `adb reverse` |
|-------------|-------------------------|---------------|
| Android Emulator | `10.0.2.2:8081` | **No.** No forma parte del loop diario |
| Teléfono USB (A30s) | `adb reverse tcp:8081 tcp:8081` + `127.0.0.1:8081` desde el teléfono | **Sí**, en `pnpm open:physical` |

`pnpm open:*` no abre `http://127.0.0.1:8081` ni `http://10.0.2.2:8081` como Intent. Abre el URI de expo-dev-client; el bundler se alcanza por la columna de la izquierda.

Un solo proceso Metro en el PC, bindeado a IPv4 (`127.0.0.1`). El emulador y el físico **no** se comparan si uno está en Metro y el otro abre un ícono sin bundler.

---

## B. Flujo diario: emulador (principal)

Topología: Metro en `127.0.0.1:8081` (IPv4). El AVD llega **solo** con `http://10.0.2.2:8081`. **No** hay `adb reverse` en el emulador.

Si el skin `Galaxy_S26_Ultra` falta, arranca con resolución del AVD:

```bash
emulator -avd Samsung_26_Ultra -no-snapshot-load -skin 1344x2992
```

En `mobile/MiAyudaTIC-Mobile` (Git Bash):

```bash
pnpm dev:emulator     # un solo Metro; si ya corre en :8081, no abre otro
pnpm open:emulator    # development build → mismo Metro
```

Edita `app/` o `src/`, guarda, confirma Fast Refresh en 1–3 s.

Si Fast Refresh no responde: sección E (recuperación por niveles). No limpies caché como primer reflejo.

`pnpm start` es alias de `pnpm dev:emulator`.

---

## C. Flujo físico: hardware real

Mismo Metro. USB + `adb reverse tcp:8081 tcp:8081`. Desde el teléfono el **bundler** es `127.0.0.1:8081` (loopback IPv4). `10.0.2.2` no existe en el teléfono. El Intent es el URI de expo-dev-client (`/_expo/open`), no `http://127.0.0.1:8081`.

1. Samsung A30s por USB, depuración aceptada (`adb devices` → `device`, no `unauthorized`).
2. **No mates** `pnpm dev:emulator`.
3. `pnpm open:physical`  
   Detecta **un** teléfono (ignora emuladores). Si hay varios físicos: `ANDROID_SERIAL=<serial> pnpm open:physical`.
4. Prueba cámara, galería, permisos, teclado Samsung, custom scheme, App Links (firma **debug**), notificaciones cuando existan, RAM/OEM.
5. Vuelve al emulador para seguir iterando.

Si `open:physical` reporta que falta `DEBUGGABLE` o `expo-dev-launcher`, instala **una** development build:

```bash
ANDROID_SERIAL=<serial-del-telefono> pnpm native:build:dev
pnpm open:physical
```

No abras solo el ícono del teléfono durante feature work: sin Metro carga JS embebido/cacheado.

---

## D. Cuándo rebuild nativo

| Cambio | ¿Fast Refresh basta? | ¿Requiere `native:build:dev`? |
|--------|---------------------:|------------------------------:|
| Componente TSX | Sí | No |
| Estilo / token | Sí | No |
| Ruta Expo Router | Normalmente sí; reload si hace falta | No |
| Dependencia JS pura | Normalmente sí | No |
| Plugin Expo | No | Sí |
| Permiso Android | No | Sí |
| App Link / scheme | No | Sí |
| Cámara ya instalada (`expo-image-picker`) | Sí (prueba en físico) | No |
| Nueva librería nativa | No | Sí |
| Configuración de push nativo | No | Sí |
| Upgrade Expo / React Native | No | Sí (`:clean` si prebuild queda inconsistente) |

```bash
pnpm native:build:dev          # nativo normal; con 2 devices: ANDROID_SERIAL=...
pnpm native:build:dev:clean    # prebuild --clean
```

Windows: no uses `expo prebuild` ni `expo run:android` desde el repo (rutas `.pnpm`). Los scripts `native:*` sincronizan a `C:\miayuda`.

---

## E. Recuperación por niveles

1. Guardar → Fast Refresh.
2. Reload de la app (menú dev: agitar o `adb shell input keyevent 82`).
3. Menú dev → Fast Refresh On → Reload.
4. Reiniciar Metro (`Ctrl+C` en la terminal de `dev:emulator`, luego `pnpm dev:emulator`).
5. Typed routes: al reiniciar Metro se regenera `.expo/types/router.d.ts`.
6. Clear app data **solo** si el Dev Launcher o la URL persistida quedó corrupta.
7. Limpiar `.expo` / `--clear` **solo** con evidencia de caché corrupta.
8. `adb kill-server && adb start-server` / reiniciar AVD **solo** si el device está `offline` o colgado.

`unauthorized` → acepta RSA en el teléfono.  
`EBUSY` al borrar `C:\miayuda\android` → `cd /c/miayuda/android && ./gradlew.bat --stop`, espera 10 s, un solo `native:build:*`.

---

## F. Typed routes

- `experiments.typedRoutes: true` en `app.json`.
- `.expo/types/router.d.ts` lo genera Metro (está en `.gitignore` vía `.expo/`). `tsconfig.json` incluye `.expo/types/**/*.ts`.
- Si agregas una ruta y TypeScript no la ve: arranca o reinicia Metro.
- No uses `as any` / `as never` para tapar rutas nuevas.
- Un cast temporal, si hace falta, se elimina en el mismo cambio cuando Metro regenere tipos.
- `router.push` dinámico: `{ pathname, params }`, no template strings.

---

## G. Matriz de pruebas

| Tipo de cambio | Emulador | Teléfono físico (dev + Metro) | Release QA |
|----------------|----------|-------------------------------|------------|
| Layout, copy, navegación | Principal | Puntual | No diario |
| Cámara, galería, permisos | Opcional / limitado | Obligatorio | Antes de cierre relevante |
| Notificaciones | Limitado | Obligatorio | Antes de release |
| App Links HTTPS | Parcial | Obligatorio (firma **debug**) | Obligatorio con firma **release** |
| Samsung / teclado / rendimiento | No suficiente | Obligatorio | Smoke final |
| Cold start sin Metro | No | No como prueba principal | Obligatorio al cierre |

---

## H. App Links y firma

- Custom scheme `miayudatics://…` se valida en development build (`pnpm deeplink:test`).
- App Links HTTPS (`https://miayudatics.vercel.app/restablecerPassword/…`) requieren `assetlinks.json` con el SHA-256 de la **firma instalada**.
- Debug (dev client) y release / Play App Signing **no comparten certificado**. Una prueba debug **no** sustituye una prueba release de App Links.
- Huellas y deploy: [`mobile-android-dev-build.md`](./mobile-android-dev-build.md). `pnpm fingerprint:android`, `pnpm sync:assetlinks`.
- Si el correo abre el navegador: dominio en `ask` (instalaste la APK antes de publicar JSON, o firma que no está en el manifest). Reinstalar **esa** APK después del deploy; no basta Metro.

---

## Scripts

| Comando | Uso |
|---------|-----|
| `pnpm dev:emulator` | **Daily** — un Metro IPv4 en :8081 |
| `pnpm open:emulator` | URI de expo-dev-client; Metro en `10.0.2.2:8081` |
| `pnpm open:physical` | Un teléfono USB, `adb reverse`; Metro en `127.0.0.1:8081` |
| `pnpm native:build:dev` | Rebuild nativo debug (no TSX) |
| `pnpm native:build:release` | Corte QA; JS congelado |
| `pnpm adb` | Solo reverse USB a un **físico** (nunca emulador) |
| `pnpm dev:lan` | QR en la misma Wi‑Fi (excepción) |
| `pnpm deeplink:test` / `:https` | Smoke scheme / App Link |
| `pnpm typecheck` / `pnpm test` / `pnpm validate` | CI local |

No hardcodees el serial del A30s en el repo. Con varios devices: `export ANDROID_SERIAL=…` (Git Bash) o `$env:ANDROID_SERIAL = "…"` (PowerShell).

---

## I. Upload de evidencia (Android, cerrado)

Incidentes de cámara/galería que mostraban “No hay conexión” **no eran red**. Cadena real:

1. `expo/fetch` (SDK 56) serializa FormData solo si la parte es `instanceof Blob` **o** un objeto con `bytes()`. El descriptor RN `{ uri, type, name }` lanza `Unsupported FormDataPart`.
2. El helper debe devolver `{ name, type, size, bytes() }` (`ExpoFetchUploadFile`). No fijar `Content-Type: multipart/form-data` a mano. Campo: `foto` (solicitud) / `evidencia` (resolver caso).
3. Leer el URI local con **XHR falla en Android** aunque el preview funcione. Usar `expo-file-system` **56.0.8** `File` + `bytes()` (InputStream nativo, no base64). `content://` se abre con `File`; si no existe o `bytes()` falla, `File.copy` a `Paths.cache` y se lee el `file://` de la app. No convertir URIs a mano.
4. Tope 10 MiB y MIME (`image/jpg` → `image/jpeg`) se validan **antes** del POST. Fallo local → `UploadFileError` / `VALIDATION_ERROR`, nunca `NETWORK_ERROR`.

`expo-file-system` es dependencia directa. El módulo nativo ya estaba en la development build; Fast Refresh basta si no se añade otro nativo.

**E2E A30s (development build + Metro `127.0.0.1:8081`), funcionario de prueba:**

| Caso | Resultado | Código |
|------|-----------|--------|
| Sin foto | 201, visible en Casos | `2026-08-00007` |
| Galería PNG | `uriScheme: file`, POST `foto`, Cloudinary | `2026-08-00008` |
| Cámara JPEG | `uriScheme: file`, POST `foto`, Cloudinary | `2026-08-00009` |

`2026-08-00005` es un sin-foto previo del mismo incidente. `2026-08-00010` es el reintento sin foto tras restaurar red (caso offline). En ambos flujos de foto ImagePicker copió a caché `file://`; `content://` no apareció.

**Limpieza autorizada:** la cuenta de prueba etiquetada **E2E A30s Foto** y los casos `2026-08-00005`–`2026-08-00010` (y cualquier otro E2E de esa cuenta) deben rotarse o eliminarse por un proceso autorizado. No dejar contraseñas ni tokens en el repo.

Logs `__DEV__`: `[upload]` solo en POST multipart; `[upload:error]` en fallos no-GET; `[upload:file-read]` / `[upload:file-read-error]` en la lectura local. Sin path completo, bytes ni PII.

Copy de validación local (no es red): `FILE_TOO_LARGE` → **“La imagen supera el límite de 10 MB”**. Permiso de cámara/galería denegado → título **Permiso requerido** y cuerpo con ruta de Ajustes. `NETWORK_ERROR` solo ante fallo de red real.

**P0 — Logout (`Maximum update depth`):** no era Fast Refresh. `Redirect` en el layout de funcionario llamaba `router.replace('/')` en cada re-render mientras Cuenta seguía focused tras pasar a `guest`. Dueño del destino guest: AppGate (`app/index.tsx`). Root usa `Stack.Protected`; los layouts de rol hacen `return null` (no `Redirect`). Logout solo limpia sesión. Matriz de guards (guest deep links, logout desde detalle, re-login, restore_failed) validada en emulador; ver `mobile-context-architecture.md` §3.6.

**Cierre técnico (A30s, development build + Metro, sin rebuild nativo):**

| Check | Resultado |
|-------|-----------|
| Cold start + login | Home **E2E A30s Foto**. Sin `Maximum update depth`. Tras el login no hay `[upload]` en GET. |
| Logout (tab Cuenta) | Welcome/Login. Sin RedBox. Back no vuelve a Funcionario. Re-login a Inicio. Emulador y A30s, 3 ciclos. |
| Cancelar cámara | BACK en la cámara nativa: el formulario sigue, catálogos visibles, sin `NETWORK_ERROR`. |
| Cancelar galería | A30s `device` tras BACK. Ambiente/tipo/descripción intactos, sin foto, sin `NETWORK_ERROR`. |
| Cámara denegada | Alert **Permiso requerido** + cómo activarlo en Ajustes. Formulario usable. Sin `NETWORK_ERROR`. |
| >10 MiB | Validación física de selección de >10 MiB pendiente de tap manual en DocumentsUI; validación de cliente y copy ya cubierta. |
| Offline real | Wi-Fi off → **“No hay conexión con el servidor. Verifica tu internet.”** Formulario se conserva. Wi-Fi on → reintento `2026-08-00010`. |

**Deuda no bloqueante:** (1) técnico aprobado real abriendo Funcionario en dispositivo; (2) tap manual >10 MiB en DocumentsUI. Procedimiento reversible de `restore_failed` en emulador: `mobile-context-architecture.md` §3.6. Perfil de red default del emulador: `adb emu network speed full` + `network delay none` (`status` en 0 bits/s = ilimitado).

---

## Setup inicial

```bash
cp .env.example .env
pnpm install --ignore-workspace
ANDROID_SERIAL=<emulador-o-telefono> pnpm native:build:dev
pnpm dev:emulator
pnpm open:emulator   # y/o pnpm open:physical
```

Nativo ya incluido: `expo-image-picker`, `expo-file-system`, `expo-secure-store`, `expo-linking` + App Links.  
Pendiente (rebuild al añadir): `expo-notifications`, `expo-location`, `expo-camera`.

---

## Password recovery (E2E en físico, dev + Metro)

Login → Recuperar acceso → email → HTTPS App Link o `miayudatics://…` → reset nativo → login.

Detalle de `assetlinks.json` y Play Store: [`mobile-android-dev-build.md`](./mobile-android-dev-build.md).
