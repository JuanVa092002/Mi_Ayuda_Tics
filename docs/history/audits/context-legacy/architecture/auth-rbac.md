# Auth & RBAC — MiAyudaTIC

---

## Verificado

### Roles

| Rol | Descripción | Registro self-service |
|-----|-------------|----------------------|
| funcionario | Crea solicitudes | Sí — activo inmediato |
| tecnico | Resuelve casos | Sí — requiere aprobación líder |
| lider | Administra sistema | No — seed/manual |

**Modelo:** `server/src/features/users/models/usuarios.ts`.

### Mecanismos de autenticación

| Cliente | Mecanismo | Evidencia |
|---------|-----------|-----------|
| Web | httpOnly cookie `token` | `auth controllers`, `axios withCredentials` |
| Mobile Expo | Bearer JWT en header | `mobile/.../client.ts`, SecureStore |
| Socket.IO | Bearer o cookie o `handshake.auth.token` | `extractAuthToken.ts` |

**JWT:** payload `{ _id, rol }`, TTL 7200s (`JWT_EXPIRES_IN_SECONDS`).

**Prioridad extracción:** Authorization Bearer > cookie > socket auth.

### Account status

Usuario bloqueado si:
- `activo === false`, o
- `rol === tecnico` y `estado !== true`

**Middleware:** `accountStatus.ts` en login, session, socket.

### Matriz RBAC — endpoints críticos

| Recurso | funcionario | tecnico | lider |
|---------|-------------|---------|-------|
| POST /solicitud | ✓ | — | — |
| GET /solicitud/historial | ✓ | — | — |
| GET /solicitud/asignadas | — | ✓ | — |
| POST /solucionCaso/:id | — | ✓ | — |
| GET /solicitud/pendientes | — | — | ✓ |
| PUT /solicitud/:id/asignarTecnico | — | — | ✓ |
| /tecnicos/* approve | — | — | ✓ |
| /tipoCaso POST/PUT/DELETE | — | — | ✓ |
| /ambienteFormacion POST | — | — | ✓ |
| GET /usuarios/perfil | ✓ | ✓ | ✓ |
| POST /media/upload | ✓ | ✓ | ✓ |

**Fuente:** `server/src/features/**/routes/*.ts` + `checkRol`.

### RBAC — clientes

| Cliente | lider | tecnico | funcionario |
|---------|-------|---------|-------------|
| Web | Todas rutas `/admin*` | `/casos-*` | `/funcionario` |
| Mobile Expo | **Bloqueado** | Auth only (stub) | Auth only (stub) |

### Password recovery

- POST `/recuperarPassword` — rate limited.
- POST `/restablecerPassword/:token` — token hashed in DB.
- Rutas guest en web y mobile.

### Rate limits

`shared/config/rateLimit.ts` — auth, forgot password, uploads (ver SECURITY.md).

---

## Inferido

- Autorización a nivel recurso (ej. funcionario solo ve sus solicitudes) implementada en controllers, no solo middleware rol.

---

## Riesgos / Deuda

1. Login response incluye token en JSON — necesario mobile; XSS web mitigado por cookie httpOnly para web flow.
2. Cursor rules antiguas decían "solo cookies" — incompleto.
3. Mobile sin RBAC de negocio aún (solo auth gate).

---

## Preguntas abiertas

- ¿Refresh tokens o solo re-login a 2h?

---

## Matriz de confianza

| Área | Nivel |
|------|-------|
| Server RBAC | verified |
| Web route guards | verified |
| Mobile role policy | verified |
| Resource-level ACL | partial |
