# Backend Architecture — MiAyudaTIC

> Express 5 API en `server/src/`. Ver `audit/backend-audit.md` para inventario completo.

---

## Verificado

### Capas

```
server/src/
├── index.ts       # Boot: env, mongo, listen
├── core/          # app factory, route mount, health
├── features/      # Dominio por bounded context
│   ├── auth/
│   ├── users/
│   ├── tickets/
│   └── shared/    # notificaciones, media, storage, ambiente
└── shared/        # Infra transversal
```

**Regla:** lógica de negocio en `features/*`; infra en `shared/*`; `core/` solo wiring.

### Request lifecycle

1. `GET /api/health` — antes de helmet/CORS stack (`core/app.ts`).
2. Middleware global: helmet, CORS, morgan, json, cookies.
3. `/api` → `core/routes.ts` → feature routers.
4. Ruta protegida: `authMiddleware` → `checkRol([...])` → controller.
5. Validación Zod en controllers/validators antes de DB.

### Feature modules

| Feature | Responsabilidad |
|---------|-----------------|
| auth | JWT, register, login, logout, password reset |
| users | Perfil, activación, gestión técnicos |
| tickets | Solicitudes, soluciones, tipos, gráficas |
| shared | Notificaciones, upload media, storage CRUD, ambientes |

### Integraciones

| Servicio | Módulo |
|----------|--------|
| Cloudinary | `shared/services/mediaStorage.ts` |
| Brevo | `shared/utils/handleEmail.ts` |
| Socket.IO | `shared/utils/handleSocket.ts`, `shared/services/realtime.ts` |

### Contratos compartidos

Server importa `@miayuda/contracts` para eventos socket y media folders.

### Build y deploy

- Build: `pnpm -C server run build` (contracts + tsc).
- Start: `node dist/index.js`.
- Docker: `server/Dockerfile` multi-stage Node 22.
- Port: `0.0.0.0:$PORT` (Render).

---

## Inferido

- Controllers orquestan email + socket + DB en misma transacción lógica (sin outbox pattern).

---

## Riesgos / Deuda

- Sin capa service explícita en todos los features (fat controllers).
- Integration tests dependen de Atlas real.

---

## Preguntas abiertas

- ¿Extraer domain services para solicitud/solucion?

---

## Matriz de confianza

| Área | Nivel |
|------|-------|
| Estructura capas | verified |
| Patrón controller | verified |
| Eventual consistency email | uncertain |
