# Backend Audit — MiAyudaTics_v1.0

> Evidencia base: `server/src/**`, `server/package.json`, `server/.env.example`

---

## Verificado

### Stack

| Capa | Tecnología |
|------|------------|
| HTTP | Express 5 (`server/package.json`) |
| ODM | Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validación | Zod en `server/src/shared/validators/` |
| Realtime | socket.io + optional Redis adapter |
| Media | Cloudinary + multer + fallback local disk |
| Email | Brevo REST + nodemailer SMTP fallback |
| Tests | Vitest + supertest |
| Build | `tsc` → `dist/` |

**Entry:** `server/src/index.ts` → `dbConnect()` → `server.listen(PORT)` default 8000.

### Estructura `server/src`

```
core/          app.ts, routes.ts, health.ts, models.ts
features/
  auth/        register, login, logout, verify-token, password recovery
  users/       usuarios CRUD, técnicos approval
  tickets/     solicitud, solucionCaso, tipoCaso, gráficas
  shared/      notificaciones, media, storage, ambienteFormacion
shared/        config, middleware, services, utils, validators, emails
scripts/       seed-lider, verify-env, mobile-smoke-client, test-cloudinary
tests/         unit + integration (production-simulation)
```

### Modelos de dominio (Mongoose)

| Modelo | Archivo | Refs clave |
|--------|---------|------------|
| Usuario | `features/users/models/usuarios.ts` | foto → Storage; rol: funcionario\|lider\|tecnico |
| Solicitud | `features/tickets/models/solicitud.ts` | usuario, ambiente, tipoCaso, tecnico, solucion, foto |
| SolucionCaso | `features/tickets/models/solucionCaso.ts` | solicitud, evidencia → Storage |
| TipoDeCaso | `features/tickets/models/tipoCaso.ts` | — |
| Consecutivo | `features/tickets/models/consecutivoCaso.ts` | codigo caso por yearMonth |
| Storage | `features/shared/models/storage.ts` | url, filename |
| Ambiente | `features/shared/models/ambienteFormacion.ts` | nombre, activo |
| Notificacion | `features/shared/models/notificaciones.ts` | usuario, ticketId, leido |

Registry export: `core/models.ts` (7 modelos; Notificacion importado donde se usa).

### Endpoints REST (montaje `/api`)

Agregador: `server/src/core/routes.ts`.

| Grupo | Rutas | RBAC destacado |
|-------|-------|----------------|
| Health | `GET /api/health` | Público (antes CORS en app.ts) |
| Auth | register, login, verify-token, logout | Público / autenticado |
| Password | recuperarPassword, restablecerPassword/:token | Público + rate limit |
| Usuarios | perfil, activos/inactivos, CRUD líder | lider / todos roles perfil |
| Técnicos | pendientes, aprobar, denegar | lider |
| Solicitud | CRUD, asignar, historiales por rol | funcionario crea; tecnico asignadas; lider admin |
| SolucionCaso | POST /:id | tecnico |
| TipoCaso | CRUD | lider escribe; todos leen |
| Gráficas | por ambiente, por mes | lider |
| AmbienteFormacion | CRUD + inactivar | lider / funcionario lee |
| Notificaciones | list, marcar leídas | autenticado |
| Storage | CRUD metadata | lider / lectura por rol |
| Media | POST upload | autenticado |

### Auth y RBAC

- **JWT payload:** `{ _id, rol }`, expira 7200s (`shared/config/media.ts`, `handleJwt.ts`).
- **Extracción token:** Bearer > cookie `token` > socket `auth.token` (`extractAuthToken.ts`).
- **Cookie:** httpOnly, secure+sameSite none en prod (`cookieOptions.ts`).
- **Login JSON:** también devuelve `token` en body (mobile).
- **Middleware:** `session.ts` → `rol.ts` (`checkRol([...])`).
- **Cuenta activa:** técnicos requieren `estado: true` tras aprobación líder (`accountStatus.ts`).
- **Register:** solo funcionario|tecnico; líder no auto-registro (`validators/auth.ts`).

### Storage y media

- `mediaStorage.ts`: Cloudinary si configurado; else `STORAGE_PATH` local.
- Carpetas: `evidencias`, `perfiles`, `storage` (`@miayuda/contracts` MediaFolder).
- `POST /api/media/upload?folder=` — multer memory + magic-byte validation.
- HEIC/HEIF permitidos (mobile iOS).

### Realtime y notificaciones

- Socket.IO en mismo puerto HTTP (`handleSocket.ts`).
- Rooms: `user:{userId}`.
- Eventos (`@miayuda/contracts`): `CONNECTION_ACK`, `ACTUALIZAR_SOLICITUD`, `ACTUALIZAR_TECNICO`, `NUEVA_NOTIFICACION`.
- Persistencia notificaciones en Mongo + emit socket (`realtime.ts`).

### Health

`core/health.ts`: siempre HTTP 200; `status: degraded` si BD desconectada; reporta cloudinary/brevo/socket connections.

### Tests (`server/src/tests/`)

| Archivo | Cobertura |
|---------|-----------|
| smoke.test.ts | 404, health, validación Zod |
| auth.test.ts | 401/403, Bearer verify |
| security.test.ts | rutas protegidas, no leak email recovery |
| solicitud.test.ts | crear solicitud funcionario |
| socket.auth.test.ts | socket auth token |
| mediaStorage.test.ts | MIME, local save/delete |
| emails.test.ts | templates render |
| integration/production-simulation.test.ts | flujo Atlas real (opcional) |

### Soporte mobile (sin módulo `features/mobile/`)

- Bearer-first auth, socket `auth.token`, HEIC uploads.
- `scripts/mobile-smoke-client.ts` + root `smoke:mobile-api`.
- `docs/mobile-integration.md` alineado con implementación.

---

## Inferido

- Redis adapter usado solo si `REDIS_URL` en prod multi-instancia.
- Logout puede fallar en edge cases (reportado en sesiones previas, no re-verificado en esta auditoría).

---

## Riesgos / Deuda

1. Tipos duplicados client vs `@miayuda/contracts` (client no consume package).
2. `packages/contracts/dist/api.*` stale sin `src/api.ts`.
3. CI no ejecuta `smoke:mobile-api`.
4. Sin `render.yaml` — config manual en dashboard.
5. Notificacion no en `core/models.ts` registry.

---

## Preguntas abiertas

- ¿Redis en producción Render está provisionado?
- ¿Rate limits documentados coinciden con valores reales en todos los endpoints?

---

## Matriz de confianza

| Componente | Confianza |
|------------|-----------|
| Rutas/endpoints | verified |
| Modelos | verified |
| Auth dual cookie/Bearer | verified |
| Socket events | verified |
| Email triggers | verified (templates); delivery prod inferred |
