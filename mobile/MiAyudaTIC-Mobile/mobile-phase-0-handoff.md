# MiAyudaTIC-Mobile — Handoff Fase 0

> **Histórico de fase.** Flujo operativo actual: [`MOBILE_DEV.md`](./MOBILE_DEV.md).

Documento de entrega técnica para iniciar **Fase 1** (solicitudes, listados, detalle y operación en campo).

**Alcance Fase 0:** auth, sesión, navegación protegida, contratos API, shells de funcionario/técnico y fundación móvil. **Sin** flujos completos de tickets.

**Referencia de comportamiento web/backend:** `../../context/current-web-backend-behavior-v2.md`

---

## 1. Arquitectura de sesión

### 1.1 Separación `SessionStatus` vs `AccessResolution`

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Persistencia / arranque | `src/features/auth/session-types.ts` → `SessionStatus` | Estados: `bootstrapping`, `guest`, `authenticated`, `expired`, `restore_failed` |
| Reglas de negocio mobile | `src/features/auth/guards.ts` → `AccessResolution` | ¿Puede usar la app y a qué rol corresponde? |
| Navegación imperativa | `src/features/auth/navigation.ts` → `navigateForAccess` | Única fuente de rutas post-login/register |

**Por qué se separó:** mezclar “token válido” con “técnico pendiente” o “líder bloqueado” complica Fase 1. La sesión persiste solo credenciales; los guards deciden routing sin duplicar lógica en pantallas.

### 1.2 Inicialización de la app

1. `AuthProvider` monta con `SessionStatus = bootstrapping`.
2. `bootstrapSession()` lee token de `expo-secure-store`.
3. Si no hay token → `guest`.
4. Si hay token → `GET /api/auth/verify-token` con `notifyUnauthorized: false`.
5. Éxito → `authenticated` + `registerDeviceForPush` (stub).
6. 401 → `wipeSession` + `expired`.
7. 403 → `wipeSession` + `guest`.
8. Red / timeout / 5xx → **`restore_failed`** (token **conservado**).

`app/index.tsx` (**AppGate**) usa `useAppBootstrap()`:
- `bootstrapping` → loader
- `restore_failed` → `ErrorState` + Reintentar (`bootstrapSession`)
- ruta resuelta → `<Redirect>`
- `guest` → welcome (login/registro manual)

### 1.2.1 Matriz bootstrap (decisiones duras)

| Evento | Token | SessionStatus | UI |
|--------|-------|---------------|-----|
| Sin token | — | `guest` | welcome |
| verify 200 | conservar | `authenticated` | home por rol |
| verify 401 | **wipe** | `expired` | session-expired |
| verify 403 | **wipe** | `guest` | welcome |
| verify red/timeout/5xx | **conservar** | `restore_failed` | ErrorState + Reintentar |
| login credenciales inválidas | — | `guest` | Alert |
| request autenticado 401 | **wipe** | `expired` | session-expired |

**Regla crítica:** error de red ≠ sesión expirada. No confundir `guest` con `expired`.

### 1.3 Qué dispara `expired`

- Respuesta **401** en cualquier `apiFetch` autenticado → `setUnauthorizedHandler` → `markSessionExpired()` en `auth-context.tsx`.
- Token inválido en bootstrap → `expired` (sin doble handler: verify usa `notifyUnauthorized: false`).
- Login/register/forgot/reset/verify/logout usan `notifyUnauthorized: false` donde aplica.
- Requests autenticados de negocio (Fase 1+) → 401 dispara `markSessionExpired`.

### 1.4 Flujos post-login / post-register

| Caso | Token persistido | Estado final | Destino |
|------|------------------|--------------|---------|
| Login funcionario | Sí | `authenticated` | `/(funcionario)/home` |
| Login técnico aprobado | Sí | `authenticated` | `/(tecnico)/home` |
| Login técnico pendiente | No | `guest` | `/(auth)/pending-approval` |
| Login líder | No | `guest` | `/(auth)/lider-not-supported` |
| Register funcionario | Sí (autologin) | `authenticated` | `/(funcionario)/home` |
| Register técnico | No | `guest` | `/(auth)/pending-approval` |

---

## 2. Contratos / anticorrupción

### 2.1 DTOs y dominio

| Archivo | Contenido |
|---------|-----------|
| `src/shared/contracts/user.ts` | `User` de dominio (`id`, `fullName`, `email`, `role`, `isApproved`) + `UserDto` backend |
| `src/shared/contracts/auth.ts` | `AuthSession`, DTOs login/register/verify, mappers |
| `src/shared/contracts/common.ts` | `ApiMessageResponse`, paginación placeholder |

### 2.2 Mappers principales

- `mapUserDto` — `_id`→`id`, `nombre`→`fullName`, `correo`→`email`, `rol`→`role`, `estado`→`isApproved`
- `mapLoginResponse` / `mapRegisterSession` — normalizan respuestas de auth

**Regla:** las pantallas y `AuthContext` solo consumen tipos de dominio. `src/features/auth/api.ts` es el único punto que habla con endpoints de auth.

### 2.3 Invariantes que exige la UI

- `User.role` en mobile: solo `funcionario` | `tecnico` | `lider` (este último bloqueado).
- Técnico con `isApproved === false` nunca tiene sesión persistida en mobile.
- Líder nunca persiste token tras login.

---

## 3. Navegación protegida

### 3.1 AppGate (`app/index.tsx`)

Único punto de decisión del **primer destino** tras bootstrap:

- `bootstrapping` → loader
- `restore_failed` → `ErrorState` + Reintentar (token conservado)
- `getRouteForAccess(access)` con destino → `<Redirect>`
- `guest` → pantalla welcome (login / registro)

### 3.2 Layouts por grupo

| Grupo | Guard | Comportamiento |
|-------|-------|----------------|
| `(auth)/_layout.tsx` | Sesión + ruta pública | Usuario autenticado en login/register → redirect a home por rol. `expired` → `session-expired`. Excepciones: `pending-approval`, `lider-not-supported`, `session-expired` |
| Root `Stack.Protected` | `canAccessFuncionarioStack` / `canAccessTecnicoStack` | Monta o desmonta el grupo de rol. Guest / otro rol / `restore_failed` → el grupo no existe en el árbol |
| `(funcionario)/_layout.tsx` | `shouldRenderRoleStack(..., 'funcionario')` | Solo renderiza el Stack interno si `allow_funcionario`; si no, `return null` (sin Redirect) |
| `(tecnico)/_layout.tsx` | `shouldRenderRoleStack(..., 'tecnico')` | Igual para técnico |

### 3.3 Evitar bypass manual

- AppGate (`app/index.tsx`) es el **único dueño del destino `guest`** (`getRouteForAccess` → `null` → Welcome).
- Los stacks de rol no redirigen a `/`. Redirect desde el layout de rol con la pantalla aún focused causaba `Maximum update depth` al logout (P0 2026-08-22).
- No existe ruta `session` intermedia (eliminada en Fase 0).
- `app/_layout.tsx` monta `SafeAreaProvider` → `QueryClientProvider` → `AuthProvider` → `RootNavigator` (`Stack` + `Stack.Protected`).

---

## 4. Cliente API resiliente

### 4.1 Capas

- `src/shared/api/client.ts` — `apiFetch`, timeout, Bearer, handler 401 global
- `src/shared/api/errors.ts` — `ApiError` con `code`, helpers (`isUnauthorizedError`, `isPendingTechnicianMessage`, …)
- `src/shared/api/http.ts` — parseo JSON seguro
- `src/shared/config/env.ts` — `EXPO_PUBLIC_API_URL` → base `/api`

### 4.2 Normalización de errores

| HTTP / caso | `ApiError.code` | Acción típica |
|-------------|-----------------|---------------|
| 401 | `UNAUTHORIZED` | Login: mensaje credenciales; autenticado: `expired` |
| 403 | `FORBIDDEN` | Mensaje de dominio (pendiente, inactivo) |
| Timeout / red / 5xx | `TIMEOUT` / `NETWORK_ERROR` / `SERVER_ERROR` | Bootstrap: `restore_failed`; queries: `ErrorState` |
| Otros | `UNKNOWN` / status mapeado | Alert o `ErrorState` |

### 4.3 Qué NO hace `client.ts`

- No navega (salvo invocar handler 401 registrado por `AuthContext`).
- No conoce roles ni rutas.
- No persiste sesión.

---

## 5. Formularios (base para Fase 1)

Patrón establecido en auth:

- **Zod** en `src/features/auth/schemas.ts`
- **react-hook-form** + `@hookform/resolvers/zod` en pantallas
- Errores de API → `Alert` o mensaje en campo según caso

**Reutilizar en Fase 1:**

| Feature | Schema sugerido | Notas |
|---------|-----------------|-------|
| Crear solicitud | `solicitudSchema` en `features/solicitudes/schemas.ts` | Foto opcional salvo flag backend; multipart vía `apiFetch` + `formData` |
| Registrar solución | `solucionSchema` | Web envía JSON sin evidencia hoy; validar si mobile sube foto |
| Editar perfil | `perfilSchema` | Mismo patrón que register (campos + foto opcional) |

---

## 6. Fundación mobile

### 6.1 Push notifications

- `src/shared/notifications/index.ts` — stubs `registerDeviceForPush` / `unregisterDeviceForPush`
- **Cableado:** `establishPermittedSession()` llama `registerDeviceForPush` tras login/register/bootstrap exitoso; `wipeSession` llama `unregisterDeviceForPush`
- Backend: verificar endpoint de device tokens antes de Fase 1

### 6.2 QueryClient / data fetching

- `@tanstack/react-query` instalado
- `src/shared/query/client.ts` — `queryClient` real (`staleTime: 30s`, `retry: 1`)
- `src/shared/query/keys.ts` — namespaces `auth`, `solicitudes`, `casos`
- `QueryClientProvider` en `app/_layout.tsx`
- **Fase 1:** crear hooks (`useMisSolicitudes`, `useCasosAsignados`, …)

### 6.3 Deep links

- Ruta canónica: `app/(auth)/reset-password/[token].tsx`
- `app/restablecerPassword/[token].tsx` re-exporta la pantalla canónica (compatibilidad deep links legacy)
- Validar esquema de URL en correos de recuperación para abrir la app en dispositivo físico

### 6.4 Conectividad mínima

- `src/shared/ui/ErrorState.tsx` — usado en AppGate para `restore_failed`
- `isRecoverableError()` en `errors.ts` clasifica red/timeout/5xx vs auth
- Sin offline-first en Fase 0

### 6.5 UI compartida Fase 0

- `Loaders.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `RoleHomeShell.tsx`

---

## 7. Shells entregados (placeholders con UX real)

### Funcionario `/(funcionario)/home`

- Stats en cero (Total / Pendientes / Resueltas)
- CTA “Nueva solicitud” → Alert “Fase 1”
- Empty state “Historial reciente”

### Técnico `/(tecnico)/home`

- Segmented control estático: Por resolver / Mis casos
- Empty states con copy operativo
- Sección “Resueltos recientes” vacía

---

## 8. Decisiones que desbloquean Fase 1

### 8.1 Funcionario — prioridad sugerida

1. **Crear solicitud** (`POST /api/solicitud` o equivalente verificado en v2)
   - Formulario con categoría, descripción, ubicación, foto opcional
   - Multipart si hay imagen; contrato en `features/solicitudes/`
2. **Historial propio** — listado paginado con estados (`pendiente`, `asignado`, `resuelto`, etc.)
3. **Detalle de solicitud** — solo lectura + seguimiento
4. Conectar stats del home a API real

### 8.2 Técnico — prioridad sugerida

1. **Casos por resolver** — asignados al técnico, no cerrados
2. **Mis casos** — en progreso / seguimiento
3. **Resolver caso** — `POST /api/solucionCaso/:id` (confirmar si evidencia es requerida en mobile)
4. **Resueltos recientes** — historial del técnico

### 8.3 Infraestructura transversal Fase 1

- TanStack Query ya cableado — crear hooks de negocio
- Hooks por feature con invalidación tras mutaciones
- Push real cuando backend exponga endpoint
- Contratos `solicitud.ts`, `caso.ts` en `src/shared/contracts/`

### 8.4 Decisiones de producto pendientes

| Tema | Estado Fase 0 | Pregunta para producto |
|------|---------------|------------------------|
| Técnico tras aprobación | Debe volver a login manualmente | ¿Notificación push + deep link a login? |
| Rol líder en mobile | Bloqueado explícitamente | ¿Roadmap de app líder o solo web permanente? |
| Paridad web vs mobile | Solo funcionario + técnico en campo | ¿Qué features web quedan fuera de mobile? |
| Foto en solicitud | Opcional en backend salvo env flag | ¿Obligatoria en mobile por política interna? |
| Evidencia en solución | Web no envía archivo hoy | ¿Mobile será el primer cliente con foto de cierre? |

---

## 9. Riesgos abiertos

1. **Variabilidad de respuestas auth** — adapters absorben hoy; cambios de backend requieren actualizar mappers.
2. **Base URL** — solo `EXPO_PUBLIC_API_URL`; definir `.env.development` / staging / prod.
3. **Push** — sin endpoint confirmado; stubs listos.
4. **Reset password** — depende de deep link desde email.
5. **Monorepo pnpm** — mobile está **fuera** del workspace `MiAyudaTics_v1.0/pnpm-workspace.yaml`; instalar con `pnpm install --ignore-workspace` dentro de `MiAyudaTIC-Mobile`.

---

## 10. Cómo correr y verificar

> **Operativo actual:** [`MOBILE_DEV.md`](./MOBILE_DEV.md) — daily `pnpm dev:usb`, setup `pnpm native:build:dev`.

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm install --ignore-workspace
cp .env.example .env   # configurar EXPO_PUBLIC_API_URL
pnpm typecheck
pnpm test
```

### Checklist de aceptación Fase 0

- [x] AppGate resuelve guest / authenticated / expired / restore_failed sin loops
- [x] Bootstrap con red caída conserva token y muestra Reintentar
- [x] Funcionario no entra a stack técnico y viceversa
- [x] Técnico pendiente y líder sin sesión persistida
- [x] Logout limpia token + snapshot
- [x] Auth vía contracts/adapters
- [x] Login/register usan `navigateForAccess`
- [x] verify/logout con `notifyUnauthorized: false`
- [x] QueryClientProvider en root
- [x] Push register tras sesión permitida (stub)
- [x] Pantalla session-expired
- [x] Shells con empty states
- [x] `pnpm typecheck` y `pnpm test` pasan
- [x] CI job `mobile-typecheck`

---

## 11. Archivos clave (mapa rápido)

```
app/index.tsx                          AppGate
app/(auth)/_layout.tsx                 Guards auth
app/(funcionario)/home.tsx             Shell funcionario
app/(tecnico)/home.tsx                 Shell técnico
src/features/auth/auth-context.tsx     Sesión y acciones
app/_layout.tsx                        Providers (SafeArea, Query, Auth)
app/index.tsx                          AppGate + restore_failed UX
src/features/auth/navigation.ts        navigateForAccess
src/features/auth/guards.ts            resolveMobileAccess / getRouteForAccess
src/shared/query/client.ts             QueryClient
src/shared/query/keys.ts               Query key factory
src/shared/api/errors.ts               ApiError + isRecoverableError
src/features/auth/api.ts               Endpoints auth
src/shared/api/client.ts               HTTP client
src/shared/contracts/*                 DTOs y mappers
src/shared/storage/token.ts            SecureStore token
src/shared/storage/session.ts          Snapshot mínimo userId/role
```

---

*Generado al cierre de Fase 0 — MiAyudaTIC-Mobile (Expo Router).*
