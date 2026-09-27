# Production QA Checklist — MiAyudaTIC

Checklist unificado para validar producción antes del piloto institucional.

**URLs de referencia:**

| Capa | URL |
|------|-----|
| Frontend | https://miayudatics.vercel.app |
| Backend | https://miayudatics-v1-0.onrender.com |
| Health | `GET /api/health` |

---

## Automatizado (ejecutar primero)

```bash
# Desde la raíz del monorepo
chmod +x scripts/smoke-prod.sh
./scripts/smoke-prod.sh

# Paridad CI local
pnpm -C server run typecheck && pnpm -C server run test && pnpm -C server run build
VITE_BACKEND_URL=https://miayudatics-v1-0.onrender.com \
  pnpm -C client run typecheck && pnpm -C client run test -- --run && pnpm -C client run build

# Integraciones (con server/.env configurado)
pnpm -C server run verify:env
pnpm -C server run test:cloudinary

# E2E (requiere credenciales en .env.e2e o variables de entorno)
pnpm run test:e2e
```

**GitHub Actions:** workflow `Post-Deploy Smoke` (manual) o CI en cada PR.

---

## Oleada 1 — DevOps (Vercel + Render)

### Render (MCP o dashboard)

| # | Check | PASS |
|---|-------|------|
| 1.1 | Workspace MCP conectado | `list_workspaces` sin `unauthorized` |
| 1.2 | Servicio `MiAyudaTics_v1.0` activo | No suspendido |
| 1.3 | Último deploy | `status: live` |
| 1.4 | Logs sin crash JWT / ELIFECYCLE | Sin errores repetidos |
| 1.5 | Health Check Path | `/api/health` configurado en Render |

### Vercel (MCP o dashboard)

| # | Check | PASS |
|---|-------|------|
| 1.6 | Proyecto `miayudatics` | `latestDeployment.readyState: READY` |
| 1.7 | Dominio prod | https://miayudatics.vercel.app → 200 |
| 1.8 | `VITE_BACKEND_URL` | `https://miayudatics-v1-0.onrender.com` (sin `/api`) |
| 1.9 | SPA deep link | `/adminSolicitud` → HTML Vite (no 404 Vercel) |

### Variables Render

| Variable | Valor prod |
|----------|------------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Secreto único (no placeholder dev) |
| `PUBLIC_URL` / `RENDER_URL` | URL Render |
| `CLIENT_URL` | URL Vercel |
| `CORS_ORIGINS` | URL Vercel |
| `DB_URI` | Atlas `miayudatics` |
| `CLOUDINARY_*` | 3 creds + folder |
| `BREVO_API_KEY` o SMTP | Configurado |

---

## Oleada 2 — Integraciones

| # | Servicio | Cómo | PASS |
|---|----------|------|------|
| 2.1 | MongoDB | `/api/health` → `database: connected` | OK |
| 2.2 | MongoDB escritura | Login o journey con datos | 200 |
| 2.3 | Cloudinary ping | `pnpm -C server run verify:env` | Cloudinary OK |
| 2.4 | Cloudinary round-trip | `pnpm -C server run test:cloudinary` | PASS |
| 2.5 | Cloudinary persistencia | Evidencia en solicitud prod sobrevive redeploy | URL viva |
| 2.6 | Brevo API | `POST /api/recuperarPassword` con `correo` | 200 genérico |
| 2.7 | Brevo inbox | Revisar bandeja/spam | Email < 2 min |
| 2.8 | Brevo IPs | Dashboard → Block unknown IP **OFF** | Desactivado |

---

## Oleada 3 — Backend API (producción)

| ID | Endpoint | Esperado |
|----|----------|----------|
| A-01 | `GET /api/health` | 200, DB connected, `integrations` presente |
| A-02 | `GET /api/usuarios` sin cookie | 401 |
| A-03 | `POST /api/auth/login` creds inválidas | 401 |
| A-04 | `POST /api/auth/register` rol `lider` | 422 |
| A-05 | `POST /api/recuperarPassword` | 200 genérico |
| A-06 | `GET /api/solicitud` sin auth | 401 |
| A-07 | `GET /api/graficaSolicitudesPorMes` sin auth | 401 |
| A-08 | Ruta inexistente | 404 |

### Auth con cookies

1. Login desde browser → cookie `token` con `Secure` + `HttpOnly`
2. `GET /api/auth/verify-token` con cookie → 200
3. `POST /api/auth/logout` → cookie limpiada

### Seguridad negativa

- `Origin: https://evil.example` → bloqueado (500 CORS)
- Rate limit auth: 20 intentos / 15 min (no forzar en prod sin necesidad)

---

## Oleada 4 — Frontend y journeys por rol

### Smoke UI

| URL | PASS |
|-----|------|
| `/loginMain` | Carga sin error crítico en consola |
| `/funcionario`, `/adminSolicitud` | 200 SPA |
| `/ruta-falsa` | NotFound |
| Network en login | Requests a `onrender.com/api/` |

### Funcionario

- [ ] Login → `/funcionario`
- [ ] Crear solicitud con foto (Cloudinary)
- [ ] Ver historial

### Líder

- [ ] Login → `/adminSolicitud`
- [ ] Aprobar técnico en `/adminTecnicos`
- [ ] CRUD ambiente `/adminAmbientes`
- [ ] Asignar técnico a solicitud
- [ ] Gráficas `/adminEstadisticas`
- [ ] Notificaciones (campana)

### Técnico

- [ ] Registro → pendiente → aprobación líder
- [ ] Resolver caso en `/casos-por-resolver`
- [ ] Ver en `/casos-resueltos`

### Cross-role

- [ ] Funcionario en `/adminSolicitud` → redirect a su home
- [ ] 401 → toast + `/loginMain`

### Plantilla de evidencia

```
Journey: [rol/flujo]
Fecha:
Tester:
Resultado: PASS | FAIL
Evidencia: screenshot / HAR / log Render
Notas:
```

---

## Oleada 5 — Seguridad operativa

| # | Check | PASS |
|---|-------|------|
| 5.1 | `.env` no en git | `git log` limpio |
| 5.2 | JWT prod único | Distinto de dev placeholder |
| 5.3 | HTTPS en ambas URLs | TLS activo |
| 5.4 | Headers helmet | `content-security-policy`, `strict-transport-security` |
| 5.5 | Logs sin PII/passwords | Revisar Render logs |
| 5.6 | Atlas backups | Habilitados en cluster prod |

---

## Go / No-Go

**GO** si todos marcados:

- [ ] `scripts/smoke-prod.sh` → 0 FAIL
- [ ] `verify:env` → TODO OK (con creds prod)
- [ ] `test:cloudinary` → PASS
- [ ] Brevo inbox recibido (manual)
- [ ] Login/logout cookies en prod
- [ ] 1 journey completo por rol (funcionario, líder, técnico)
- [ ] CI local verde (server + client)
- [ ] Sin secretos en repo/logs

**NO-GO:** documentar fallo, owner, ETA de remediación.

---

## Referencias

- [RUNBOOK.md](../RUNBOOK.md)
- [render.md](./render.md)
- [vercel.md](./vercel.md)
- [SECURITY.md](../SECURITY.md)
- [08-pilot-playbook.md](../../briefs/08-pilot-playbook.md)
