# API Contracts — MiAyudaTIC

> REST bajo `/api`. Tipos compartidos en `@miayuda/contracts` (`packages/contracts`).

---

## Verificado

### Base URLs

| Entorno | Web | Mobile Expo |
|---------|-----|-------------|
| Local | `http://localhost:8000/api` | `EXPO_PUBLIC_API_URL/api` |
| Prod | `https://miayudatics-v1-0.onrender.com/api` | mismo |

**Web env:** `VITE_BACKEND_URL`. **Mobile:** `EXPO_PUBLIC_API_URL` (sin `/api` suffix).

### REST — Auth

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | /auth/register | — | usuario, correo, password, rol, telefono, foto? |
| POST | /auth/login | — | correo, password |
| GET | /auth/verify-token | Bearer/cookie | — |
| POST | /auth/logout | Bearer/cookie | — |
| POST | /recuperarPassword | — | correo |
| POST | /restablecerPassword/:token | — | password |

### REST — Core domain (resumen)

Ver inventario completo en `audit/backend-audit.md` y `briefs/04-superficie-api.md`.

| Prefix | Operaciones |
|--------|-------------|
| /solicitud | CRUD, asignar, historiales por rol |
| /solucionCaso | POST solución + evidencia |
| /tipoCaso | CRUD tipos |
| /ambienteFormacion | CRUD ambientes |
| /usuarios, /tecnicos | gestión usuarios |
| /notificaciones | list, marcar leídas |
| /media/upload | multipart por folder |
| /grafica* | métricas líder |

### Multipart

- Solicitud create: campos + `foto` opcional.
- Solución: `evidencia` opcional.
- Media upload: `POST /media/upload?folder=evidencias|perfiles|storage`.

**Límites:** `MEDIA_MAX_BYTES` default 10MB; MIME whitelist en `handleStorage.ts`.

### Socket.IO — `@miayuda/contracts`

**Archivo:** `packages/contracts/src/socket.ts`

| Event | Payload |
|-------|---------|
| `connection:ack` | userId, serverTime |
| `actualizarSolicitud` | solicitudId, estado, ... |
| `actualizarTecnico` | tecnicoId, numeroSolicitudesAsignadas |
| `nuevaNotificacion` | notificación document |

**Conexión mobile:** `io(url, { auth: { token } })`.

### Media contracts

`packages/contracts/src/media.ts` — `MediaFolder`, `MediaUploadResponse`.

### Solicitud contracts

`packages/contracts/src/solicitud.ts` — Zod schemas `solicitudCreateFieldsSchema`, `solucionCasoFieldsSchema`.

### Consumo del package

| Consumer | Usa contracts |
|----------|---------------|
| server | ✓ |
| client | ✗ (tipos locales) |
| mobile Expo | ✗ (Zod local) |

---

## Inferido

- OpenAPI formal no existe; `briefs/04-superficie-api.md` actúa como catálogo humano.

---

## Riesgos / Deuda

1. Drift client/mobile vs contracts.
2. `dist/api.*` stale en contracts package.
3. Sin OpenAPI generado para partners.

---

## Preguntas abiertas

- ¿Generar OpenAPI desde rutas Zod?

---

## Matriz de confianza

| Artefacto | Nivel |
|-----------|-------|
| REST routes | verified |
| Socket events | verified |
| Client type parity | uncertain |
