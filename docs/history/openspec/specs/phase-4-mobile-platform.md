# Phase 4 — Mobile Platform (Backend)

**Estado:** En implementación  
**Objetivo:** Backend listo para app móvil nativa (REST Bearer + Socket.IO + multipart/Cloudinary).

---

## User journeys por rol

### Funcionario (móvil)
1. Login → `POST /api/auth/login` → guardar `dataUser.token`
2. Verificar sesión → `GET /api/auth/verify-token` con `Authorization: Bearer`
3. Conectar Socket.IO → `io(BASE_URL, { auth: { token } })`
4. Crear solicitud con foto de cámara:
   - **Opción A:** `POST /api/solicitud` multipart (`foto` + campos texto)
   - **Opción B:** `POST /api/media/upload?folder=evidencias` → `POST /api/solicitud` con `fotoId`
5. Recibir `nuevaNotificacion` y `actualizarSolicitud` cuando el líder asigne técnico

### Técnico (móvil)
1. Login + socket (igual que funcionario)
2. Listar casos → `GET /api/solicitud/asignadas`
3. Resolver con evidencia → `POST /api/solucionCaso/:id` multipart (`evidencia` + campos)
4. Recibir `actualizarTecnico` al ser asignado nuevo caso

### Líder (móvil)
1. Login + socket
2. Pendientes → `GET /api/solicitud/pendientes`
3. Asignar → `PUT /api/solicitud/:id/asignarTecnico` → emite eventos a usuario y técnico

---

## Matriz de autenticación

| Endpoint / canal | Cookie (web) | Bearer (móvil) |
|------------------|--------------|----------------|
| Rutas con `authMiddleware` | Sí | Sí |
| `GET /api/auth/verify-token` | Sí | Sí |
| Socket.IO handshake | Sí | Sí (`auth.token` o Bearer header) |
| `POST /api/auth/login` | Set cookie + body token | Body token |

JWT TTL: **2 horas** (`expiresIn: 7200` en respuesta login).

---

## Catálogo Socket.IO

| Evento | Dirección | Room | Cuándo | Payload |
|--------|-----------|------|--------|---------|
| `connection:ack` | Server → Client | socket | Al conectar | `{ userId, serverTime }` |
| `actualizarSolicitud` | Server → Client | `user:{userId}` | Asignación o resolución | `{ solicitudId, estado, consecutivo?, updatedAt? }` |
| `actualizarTecnico` | Server → Client | `user:{tecnicoId}` | Asignación a técnico | `{ tecnicoId, numeroSolicitudesAsignadas }` |
| `nuevaNotificacion` | Server → Client | `user:{userId}` | Tras `Notificacion.create` | `{ _id, mensaje, tipo, ticketId, leido, createdAt }` |

Tipos exportados en `@miayuda/contracts`.

---

## Contrato multipart

### `POST /api/solicitud/` (funcionario)
- `Content-Type: multipart/form-data`
- Campos: `descripcion`, `telefono`, `ambiente`, `tipoCaso`, `usuario`
- Archivo: `foto` (opcional si `fotoId` presente; `REQUIRE_SOLICITUD_FOTO=true` lo exige)

### `POST /api/solucionCaso/:id` (técnico)
- Campo archivo: `evidencia`
- Campos: `descripcionSolucion`, `tipoCaso`, `tipoSolucion`

### `POST /api/media/upload` (autenticado)
- Query: `folder=evidencias|perfiles|storage`
- Campo: `file`
- Respuesta: `{ storageId, url, optimizedUrl }`

---

## Escalabilidad

- Piloto: instancia única Render (rooms en memoria)
- Multi-instancia: `REDIS_URL` + `@socket.io/redis-adapter`

---

## Criterios de aceptación

- [ ] Bearer funciona en verify-token y socket
- [ ] Tres eventos realtime documentados y emitidos
- [ ] Upload HEIC/JPEG ≤10MB con errores 413/415
- [ ] `pnpm run smoke:mobile-api` PASS
- [ ] `docs/mobile-integration.md` publicado
