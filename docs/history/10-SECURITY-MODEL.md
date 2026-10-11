# 10 — Modelo de Seguridad y RBAC (Security Model)

> **Clasificación:** `VERIFIED` en middlewares de Express (`session.ts`, `rol.ts`, `accountStatus.ts`) y pruebas (`qa-matrix-rbac-isolation.test.ts`, `security.test.ts`).

---

## 1. Fronteras de Autenticación y Sesión

1. **Estrategia Web (Navegador):**
   - La sesión se mantiene exclusivamente mediante **cookies `httpOnly`**, con atributos `SameSite: Lax` (o `None` en producción cross-origin) y `Secure`.
   - JavaScript en el navegador **no tiene acceso directo al token JWT**, mitigando vulnerabilidades de Cross-Site Scripting (XSS).
2. **Estrategia Móvil (Expo React Native):**
   - Utiliza tokens JWT transmitidos vía cabecera estándar `Authorization: Bearer <token>`.
   - Los tokens se resguardan en almacenamiento seguro de hardware (`SecureStore` en Android KeyStore / iOS Keychain).
3. **Tiempo de Vida de Tokens (TTL):**
   - Tokens JWT configurados con una vigencia de 2 horas (7200 segundos).

---

## 2. Control de Acceso Basado en Roles (RBAC)

El middleware `checkRol([...])` actúa como compuerta de nivel HTTP verificando `req.usuario.rol`.

| Ruta / Operación | `funcionario` | `tecnico` | `lider` |
|---|:---:|:---:|:---:|
| `POST /api/solicitud` (Radicar) | ✅ Permitido | ❌ 403 | ❌ 403 |
| `GET /api/solicitud/historial` (Mis Casos) | ✅ Permitido | ❌ 403 | ❌ 403 |
| `GET /api/solicitud/pendientes` (Bandeja Triage) | ❌ 403 | ❌ 403 | ✅ Permitido |
| `PUT /api/solicitud/:id/asignarTecnico` | ❌ 403 | ❌ 403 | ✅ Permitido |
| `PUT /api/solicitud/:id/reasignarTecnico` | ❌ 403 | ❌ 403 | ✅ Permitido |
| `POST /api/solicitud/:id/cancelar` | ❌ 403 | ❌ 403 | ✅ Permitido |
| `GET /api/solicitud/asignadas` | ❌ 403 | ✅ Permitido | ❌ 403 |
| `POST /api/solicitud/:id/iniciarAtencion` | ❌ 403 | ✅ Permitido (Asignado) | ❌ 403 |
| `POST /api/solicitud/:id/actualizacion` | ❌ 403 | ✅ Permitido (Asignado) | ❌ 403 |
| `POST /api/solicitud/:id/solucionParcial` | ❌ 403 | ✅ Permitido (Asignado) | ❌ 403 |
| `POST /api/solicitud/:id/solucionTotal` | ❌ 403 | ✅ Permitido (Asignado) | ❌ 403 |
| `POST /api/solicitud/:id/confirmarSolucion` | ✅ Permitido (Titular) | ❌ 403 | ❌ 403 |
| `POST /api/solicitud/:id/reabrir` | ✅ Permitido (Titular) | ❌ 403 | ❌ 403 |
| `PUT /api/tecnicos/:id/aprobarTecnico` | ❌ 403 | ❌ 403 | ✅ Permitido |
| `POST /api/ambienteFormacion`, `PUT` | ❌ 403 | ❌ 403 | ✅ Permitido |
| `POST /api/tipoCaso`, `PUT`, `DELETE` | ❌ 403 | ❌ 403 | ✅ Permitido |

---

## 3. Prevención de IDOR y Verificación de Titularidad

El sistema no se limita a validar el rol a nivel ruta; en las mutaciones de tickets valida la relación estricta del actor con el caso:
- **Técnicos:** Solo pueden interactuar con solicitudes donde `solicitud.tecnico.toString() === req.usuario._id.toString()`. Si otro técnico intenta mutar el caso, recibe `403 Forbidden`.
- **Funcionarios:** Solo el solicitante titular (`solicitud.usuario.toString() === req.usuario._id.toString()`) puede responder preguntas técnicas, reabrir o confirmar la solución.

---

## 4. Compuerta de Activación de Técnicos (`accountStatus.ts`)

- Los técnicos recién registrados quedan en estado inactivo (`estado: false`).
- El middleware `accountStatus` intercepta las peticiones de técnicos no aprobados devolviendo `403 Forbidden` con mensaje indicando que su cuenta se encuentra pendiente de validación por la coordinación TIC.

---

## 5. Rate Limiting y Sanitización

1. **Protección contra Fuerza Bruta:**
   - `authLimiter` en `/api/auth/login`, registro y recuperación de contraseñas.
2. **Protección de Subida de Archivos:**
   - `uploadLimiter` en endpoints que aceptan `multipart/form-data`.
   - Inspección mágica de buffers de imagen para evitar archivos maliciosos renombrados con extensiones falsas.
3. **Sanitización de Motivos Públicos:**
   - Función `sanitizePublicMotivo` que remueve correos electrónicos o números telefónicos indebidos en los motivos de cancelación y reasignación.
