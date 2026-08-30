# Current Mobile Agent Context — MiAyudaTIC

Documento canónico para otro LLM o agente. Describe el **estado real del código** a 2026-08-30, no el roadmap de junio.

**Código gana** si este archivo y el repo divergen. Actualizar este archivo en el mismo PR que cambie un invariante.

---

## 0. Cómo usarlo (estándar de contexto para agentes)

Este pack sigue el patrón de industria 2025–2026: `AGENTS.md` (instrucciones), contexto canónico por superficie, invariantes en tablas, y handoffs por fase (no un dump histórico).

| Capa | Archivo | Qué hace |
|------|---------|----------|
| Instrucciones del repo | `AGENTS.md` | Roles, superficies, HITL, verify |
| Contratos de negocio | `docs/contracts.md` | RBAC, estados, naming API |
| Este archivo | `context/current-mobile-agent-context.md` | Estado mobile **hoy** |
| Loop diario Metro/adb | `mobile/MiAyudaTIC-Mobile/MOBILE_DEV.md` | Cómo correr emulador/A30s |
| Arquitectura mobile junio | `mobile/MiAyudaTIC-Mobile/mobile-context-architecture.md` | **Stale** — no usarlo como verdad actual |
| Web/API junio–v2 | `context/current-web-backend-behavior-v2.md` | Útil para API; la sección “mobile solo auth” está **obsoleta** |

**Orden de lectura (máximo 5 minutos):** §1 snapshot → §3 no romper → §4 mapa de archivos → §8 trabajo abierto → luego el archivo que vas a editar.

**Reglas de agente (aplicar siempre):**

1. Una superficie por workstream: `mobile/MiAyudaTIC-Mobile/` vs `server/` vs `client/`.
2. No staging, Atlas, Render, `server/.env`, Brevo real ni Cloudinary/prod salvo HITL explícito.
3. No JWT en query params, logs, URIs, cache keys, archivos ni errores.
4. No `unique: true` / `autoIndex: false` en el schema de `Solicitud`. El índice `uniq_solicitud_codigoCaso` solo lo crea el migrate.
5. No rediseño visual ni UI Técnico/Líder extra si el usuario no lo pidió.
6. Commits solo si el usuario lo pide. Preferir PRs pequeños; no mezclar P0+P1 en un PR gigante de producto (este push de contexto es excepción documental).
7. Verificar con comandos reales (`typecheck` / `test`), no con “debería pasar”.

---

## 1. Snapshot (leer primero)

La app Expo **ya no es solo auth**. Funcionario tiene home, crear solicitud (cámara/galería), historial, detalle, cuenta. Técnico tiene home y resolver caso. Líder está **bloqueado** en mobile (web only).

| Tema | Estado 2026-08-30 |
|------|-------------------|
| Stack | Expo SDK ~56.0.11, RN 0.85.3, React 19.2.3, Expo Router ~56.2.10, TanStack Query 5, RHF + Zod 4 |
| Package | `com.miayudatics.mobile` · scheme `miayudatics` · **no Expo Go** · dev client |
| Auth | SecureStore + `Authorization: Bearer` · cookie web no se usa en native |
| Funcionario | Flujos de solicitudes implementados; `codigoCaso` `yyyy-MM-00000` al crear |
| Foto en detalle (P0) | **Corregido:** download autenticado → `file://` → `<Image />`. Ruta media **sigue protegida** |
| P1A cámara borra formulario | **Abierto** |
| P1B labels de estado | **Abierto** (badge aún dice “Pendiente de asignación” para `solicitado`) |
| P1C Android BACK al launcher | **Abierto** |
| P2 Worklets C++/JS mismatch | **Solo documentar** — no añadir deps |
| Fase D E2E | Cobertura buena, **no cerrada** (P1 pendientes; galería/cámara UI no re-validadas tras P0) |
| Staging / producción | **No avanzar** hasta cerrar P1 + typecheck/tests |

Última evidencia P0 (simulación `127.0.0.1:18080`, Mongo `miayudatics_simulation`):

- Emulator `emulator-5554` y A30s `RF8MB3BNP5V`: detalle `2026-08-00002` mostró foto (GET `/api/media/local/:file` **200** con Bearer).
- Logout borra `cache/auth-media` (`No such file or directory`).
- Funcionario B: `GET /api/solicitud/:id` ajeno **403**, UI “No autorizado”, **sin** GET media.

---

## 2. Producto y roles

MiAyudaTIC es el sistema de tickets TIC del SENA CTPI (Cauca). Tres roles:

| Rol | Mobile | Web |
|-----|--------|-----|
| `funcionario` | In scope (reportar, historial, detalle) | Sí |
| `tecnico` | In scope (casos asignados, resolver) | Sí |
| `lider` | **Bloqueado** → `/(auth)/lider-not-supported` | Admin |

Persistencia de sesión mobile (`session-policy.ts`): solo `funcionario` aprobado y `tecnico` aprobado. Líder y técnico pendiente **no** guardan token.

Estados de solicitud (backend, no traducir en API):

`solicitado` → `asignado` → `pendiente` (opcional) → `finalizado`

`codigoCaso` se acuña en `POST /api/solicitud` vía `postConsecutivoCaso()` formato `yyyy-MM-00000`. Collection Mongo: `solicituds`.

---

## 3. Invariantes — no romper

### 3.1 Auth y navegación

| Invariante | Dónde |
|------------|--------|
| JWT en header Bearer, nunca en query | `src/shared/api/client.ts` (`apiFetch`, `apiFetchBinary`) |
| Token en SecureStore; snapshot de sesión aparte | `src/shared/storage/token.ts`, `session.ts` |
| Un dueño de destino: `resolveMobileAccess` → `getRouteForAccess` | `src/features/auth/guards.ts` |
| Stacks protegidos con `Stack.Protected` | `app/_layout.tsx` |
| 401 autenticado → `unauthorizedHandler` → sesión `expired` | `auth-context.tsx` + `client.ts` |
| Restore de red/timeout/5xx **no** borra el token | `bootstrap-session-policy.ts` |
| QueryClient: `refetchOnWindowFocus: false`, `refetchOnReconnect: false` | `src/shared/query/client.ts` (cámara/galería mandan la app a background) |

No reintroducir loops de `Redirect` en layouts de tabs (ya hubo P0 “Maximum update depth” en logout). No poner handlers globales de `BackHandler` para tapar P1C.

### 3.2 Media y evidencias

| Invariante | Dónde |
|------------|--------|
| `GET /api/media/local/:filename` exige `authMiddleware` | `server/src/features/shared/routes/media.ts` |
| No hacer públicas las evidencias | tests `server/src/tests/media-access.test.ts` |
| Image de detalle **no** apunta a URL local remota | `AuthenticatedImage` + `classifyMediaUrl` |
| Preview de picker (`file://`, `content://`) no pasa por fetch | `isLocalPreviewUri` |
| Cloudinary HTTPS público: passthrough a `<Image>` | `classifyMediaUrl` → `public-remote` |
| Cache de media autenticada se borra en `wipeSession` | `clearAuthenticatedSessionMedia` |
| Filename local: `[A-Za-z0-9._-]+`, rechazo de `..` | `serveLocalMedia.ts` + `authenticated-media.ts` |
| Host de `PUBLIC_URL` (127.0.0.1) ≠ host del emulador: reescribir a `/media/local/:file` | `extractLocalMediaApiPath` + `getApiBaseUrl()` |

**No** adjuntar Bearer a `expo-image` (Android ignora / cachea mal). **No** JWT en la URI `file://`.

Futuro Cloudinary privada: URL firmada (sin JWT) puede seguir en Image; delivery que pida Bearer reutiliza `apiFetchBinary` → cache. No cambiar Cloudinary en un fix local.

### 3.3 `codigoCaso` y Mongo

| Invariante | Dónde |
|------------|--------|
| Schema `codigoCaso`: `required` only — **sin** `unique` ni `autoIndex: false` | `server/src/features/tickets/models/solicitud.ts` |
| Índice único operacional `uniq_solicitud_codigoCaso` | solo `migrate:codigo-caso-unique` |
| Simulación local: `mongodb://` + loopback + db `miayudatics_simulation` | `simulation-db-guard.ts` |
| Nunca usar `server/.env` (Atlas) en este workstream | fail-closed |

### 3.4 Contratos DTO ↔ UI

API y Mongo hablan español (`codigoCaso`, `descripcion`, `estado`, `rol`, `nombre`, `correo`). Mobile mapea a inglés en UI (`caseCode`, `description`, `status`, `role`, `fullName`, `email`).

`app/(auth)/session.tsx` (legacy) debe usar el contrato `User` actual (`fullName` / `email` / `role`), no campos españoles del DTO crudo.

Historial funcionario: `GET /api/solicitud/historial` → mapper `mapHistorialResponse` lee `solicitudesFinalizadas` (nombre legacy; incluye no finalizadas).

---

## 4. Mapa del repo mobile

Raíz: `mobile/MiAyudaTIC-Mobile/`

```
app/                          Expo Router (file-based)
  _layout.tsx                 AuthProvider + QueryClient + Protected stacks
  index.tsx                   Gate de bienvenida / redirect
  (auth)/                     login, register, forgot, reset, session-expired,
                              lider-not-supported, pending-approval
  (funcionario)/(tabs)/       home, crear, historial (Solicitudes), cuenta
    (home)/solicitud/[id]     Detalle (origen Inicio)
    (historial)/solicitud/[id] Detalle (origen Casos/Solicitudes)
  (funcionario)/nueva-solicitud.tsx  Modal crear (tab Crear)
  (tecnico)/                  home, caso/[id], caso/[id]/resolver
src/features/auth/            contexto, guards, policies, schemas
src/features/solicitudes/     api, hooks, form, detalle, SuccessCard
src/features/casos/           api/hooks técnico
src/shared/api/               client.ts, apiFetchBinary, errors, http, multipart
src/shared/contracts/         mappers solicitud/caso/user/catalogo
src/shared/media/             upload + authenticated download/cache
src/shared/ui/                design system (Button, Text, AuthenticatedImage, …)
src/shared/query/             QueryClient + keys (incl. media)
```

Alias TypeScript: `@/` → `src/`.

### 4.1 Rutas API que mobile usa (funcionario)

| Método | Path (tras `EXPO_PUBLIC_API_URL` + `/api`) | Notas |
|--------|--------------------------------------------|--------|
| POST | `/auth/login` | `notifyUnauthorized: false` en algunos flujos |
| GET | `/auth/verify-token` | timeout corto `SESSION_VERIFY_TIMEOUT_MS` |
| POST | `/auth/logout` | wipe local aunque falle |
| POST | `/solicitud` | `FormData`: `usuario`, `ambiente`, `tipoCaso`, `descripcion`, `telefono`, `foto` |
| GET | `/solicitud/historial` | lista del funcionario |
| GET | `/solicitud/:id` | detalle; 403 si no es dueño |
| GET | `/ambienteFormacion` | catálogo |
| GET | `/tipoCaso` | catálogo |
| GET | `/media/local/:file` | **401 sin Bearer**; bytes JPEG/PNG |

`getApiBaseUrl()` = `EXPO_PUBLIC_API_URL` sin slash final + `/api`.

---

## 5. Arquitectura de runtime (cómo está construido)

### 5.1 Sesión

Estados: `bootstrapping` | `guest` | `authenticated` | `expired` | `restore_failed` | `access_blocked`.

`wipeSession`: borra token, snapshot, push registration, **y** cache de media autenticada + queries `solicitudes` / `casos` / `media`.

### 5.2 Datos

TanStack Query. Keys en `src/shared/query/keys.ts`. Detalle: `queryKeys.solicitudes.detail(id)`. Media: `queryKeys.media.file(filename)` — **sin token en la key**.

`QueryBoundary` no sustituye UI por loading/error si ya hay cache (`hasData`).

### 5.3 Crear solicitud y foto

1. `SolicitudForm` + ImagePicker. Android: `allowsEditing` solo iOS (editing nativo remonta y rompe URI).
2. `createUploadFile` lee bytes con `expo-file-system` (`File` / `Paths`), no XHR a `content://`.
3. `appendImageToFormData` + `apiFetch` multipart, timeout 90s.
4. Preview del form usa URI local del picker — **no** romper esto al arreglar detalle.

### 5.4 Ver foto en detalle (P0 — hecho)

`SolicitudDetailScreen` usa `AuthenticatedImage`:

1. Si URL es `/api/media/local/:file` → `apiFetchBinary` con Bearer.
2. Escribe `Paths.cache/auth-media/<filename>`.
3. `<Image source={{ uri: fileUri }} />`.
4. Fallback visual + Reintentar (un shot, `retry: false`).
5. Cloudinary `res.cloudinary.com` se muestra directo.

JPEG de 2 bytes (`FF D8 FF D9`) da 200 pero Image queda gris: para E2E visual usar un JPEG real (>10 KB).

### 5.5 Design system

Tokens: `#04324D` / `#39A900`. Componentes en `src/shared/ui/`. No inventar paleta. Inter 400/500/700.

---

## 6. Cómo correr (simulación local)

**Nunca** `server/.env` (Atlas). Simulación: `server/.env.test` (gitignored) + `fase-c-listen.ts`.

| Pieza | Valor |
|-------|--------|
| API | `127.0.0.1:18080` · bind loopback |
| DB | `mongodb://127.0.0.1:27017/miayudatics_simulation` |
| JWT harness | constante de tests, no secret de archivo |
| Cloudinary / Brevo | vacíos; fetch a `api.brevo.com` stub en listen |
| Mobile `.env` / `.env.local` | `EXPO_PUBLIC_API_URL=http://127.0.0.1:18080` (gitignored) |

Topología dispositivos (Fase D / P0):

| Device | Metro | API |
|--------|-------|-----|
| Emulator | `10.0.2.2:8081` (oficial sin reverse) o reverse 8081 | `10.0.2.2:18080` **o** `127.0.0.1:18080` **si** hay `adb reverse tcp:18080` |
| A30s USB | `adb reverse tcp:8081` + `127.0.0.1:8081` | `adb reverse tcp:18080` + `127.0.0.1:18080` |

Un Metro. `NODE_OPTIONS=--dns-result-order=ipv4first`. No `KEYCODE_BACK` para cerrar teclado (saca la app); usar keyevent 111. Header back: `Navigate up` (emu) / `Navegar hacia arriba` (A30s).

Scripts: `pnpm open:emulator` / `pnpm open:physical` / `pnpm adb`. Seed E2E: `server/src/tests/fase-d-seed.ts`. Credenciales en `mobile/MiAyudaTIC-Mobile/.env.fase-d.local` (**gitignored**). Helper UI: `scripts/_fase_d_ui.py`.

Tras añadir módulos JS nuevos, **Reload** del dev menu (Fast Refresh a veces no carga archivos nuevos).

---

## 7. Verify (comandos)

```bash
# Mobile
cd mobile/MiAyudaTIC-Mobile
pnpm typecheck
pnpm test

# Server (si tocas API)
pnpm -C server run typecheck
pnpm -C server run test
pnpm -C server run test:integration   # solo simulation; no .env Atlas
```

Última corrida mobile post-P0: `tsc --noEmit` OK · Vitest **152** tests.

No hay Detox/Maestro de producto. E2E es adb + uiautomator + logs del listen.

---

## 8. Trabajo abierto (construir encima de esto)

Orden pedido por producto: **P0 (hecho) → P1A → P1B → P1C**. No mezclar en un PR. No P2 Worklets todavía. No staging.

### P1A — Cámara no debe borrar el formulario

Síntoma: al volver de cámara, ambiente/tipo/descripción se vacían; la foto a veces queda.

Reglas: no AsyncStorage, no draft a disco, no backend, no reset al volver de cámara/galería/cancel.

Diagnosticar: remount del modal, RHF `reset`, keys, recarga de catálogos, lifecycle Android. Archivos: `SolicitudForm.tsx`, `nueva-solicitud.tsx`.

### P1B — Labels funcionario

| Backend | Badge visible (objetivo) |
|---------|--------------------------|
| solicitado | Enviada |
| asignado | En atención |
| pendiente | Requiere información |
| finalizado | Resuelta |

Filtros (no cambiar): Pendientes de asignación = `solicitado`; En proceso = `asignado`+`pendiente`; Resueltas = `finalizado`. **No** usar “Pendiente de asignación” como badge individual. Hoy `getStatusLabel('solicitado')` todavía devuelve eso. Tests en `solicitud.test.ts`.

### P1C — Back Android

`KEYCODE_BACK` desde SuccessCard/detalle sale al launcher. No tapar con BackHandler global. Diagnosticar `push` vs `replace`, modal, stack depth, origen Inicio vs Casos. No tocar arquitectura de guards ya estabilizada.

### P2 — Worklets (solo incidente)

Metro: mismatch C++ 0.10.2 vs JS 0.9.2 (`react-native-worklets`). LogBox en emulador. No nuevas deps. Posible rebuild nativo. Escribir `docs/incidents/` al estilo `2026-08-27-solicitud-sendmail-post-201.md`.

### Deuda backend (no tocar en P1 mobile)

`crearSolicitud` envía **201** y luego `await sendMail`. Si mail falla, el mismo `catch` puede mandar **segunda respuesta HTTP**. Incidente: `docs/incidents/2026-08-27-solicitud-sendmail-post-201.md`. Listen local stubbea Brevo.

### Técnico UI

Fuera de alcance de Fase D/P0 salvo no empeorar. `app/(tecnico)/caso/[id].tsx` aún puede usar `<Image>` remoto (mismo 401 en storage local). Preferir `AuthenticatedImage` si se toca esa pantalla.

---

## 9. Anti-patrones (ya vistos)

| Error | Por qué duele |
|-------|----------------|
| Hacer `/api/media/local` público | Filtra evidencias |
| `Image source={{ uri: foto.url }}` en local | 401 silencioso, caja gris |
| JWT en query “para Image” | Fuga en logs, referrer, screenshots |
| `unique: true` en schema Solicitud | Índices duplicados / pelea con migrate |
| `dropDatabase` en simulation sin re-migrate | desaparece `uniq_solicitud_codigoCaso` |
| KEYCODE_BACK para ocultar teclado | manda la Activity al launcher |
| Segundo Metro / `adb reverse` en emulador “porque sí” | bundle o API incorrectos |
| Refetch on focus | cámara vacía listas y formularios |
| Reset de RHF cuando vuelven catálogos | P1A |
| Commitear `.env`, `.env.fase-d.local`, `server/storage/file-178781*` | secretos / PII |
| Editar `client/` y `mobile/` en el mismo workstream | viola superficies |

---

## 10. Checklist para el siguiente agente

- [ ] Leí §1 y §3.
- [ ] Scope declarado (in/out) en el primer mensaje.
- [ ] No toco staging/prod/Atlas/`server/.env`.
- [ ] Cambio mínimo; P1A/B/C en PRs separados si el usuario pide git.
- [ ] `pnpm typecheck` + `pnpm test` en mobile (y server si aplica).
- [ ] Si UI: verificar en emulador y, si el flujo es cámara/galería, A30s.
- [ ] Si media: confirmar GET local 200 con Bearer y 401 sin token; no filtrar URI/token.
- [ ] Actualizar **este archivo** si cambió un invariante o el trabajo abierto.

### Handoff mínimo al cerrar

Usar `docs/handoff-template.md`: goal, files, decisions, verify pass/fail, next owner.

---

## 11. Referencias rápidas

| Qué | Path |
|-----|------|
| Cliente HTTP + binary | `src/shared/api/client.ts` |
| Clasificación media | `src/shared/media/authenticated-media.ts` |
| Cache + logout | `src/shared/media/authenticated-media-cache.ts` |
| Image autenticada | `src/shared/ui/AuthenticatedImage.tsx` |
| Detalle funcionario | `src/features/solicitudes/screens/SolicitudDetailScreen.tsx` |
| Form crear | `src/features/solicitudes/components/SolicitudForm.tsx` |
| Labels/filtros | `src/shared/contracts/solicitud.ts` |
| Guards | `src/features/auth/guards.ts` |
| Serve local media | `server/src/features/shared/controllers/serveLocalMedia.ts` |
| Índice codigoCaso | `server/src/features/tickets/indexes/solicitud-codigo-caso.ts` |
| Guard simulation | `server/src/shared/config/simulation-db-guard.ts` |
| Listen 18080 | `server/src/tests/fase-c-listen.ts` |
| Seed E2E | `server/src/tests/fase-d-seed.ts` |
| Snapshot recovery | `../MiAyudaTics_v1.0-recovery-snapshot-20260827-0044` (fuera del git tree; no borrar) |
