# Analytics & Observability — MiAyudaTIC

---

## Verificado

### Health endpoint

`GET /api/health` — `server/src/core/health.ts`

```json
{
  "status": "ok | degraded",
  "uptime": number,
  "database": "connected | disconnected",
  "integrations": {
    "cloudinary": "configured | local",
    "brevo": "configured | missing",
    "socket": { "connections": number }
  },
  "timestamp": "ISO-8601"
}
```

- Siempre HTTP **200** (liveness Render).
- `degraded` si Mongo desconectado.

### Logging

- **morgan** HTTP access logs (`core/app.ts`).
- Console errors en global error handler.
- Sin structured logging (JSON) ni correlation IDs.

### Métricas de producto (in-app)

**Solo rol líder:**
- `GET /graficaSolicitudesPorAmbiente?year=`
- `GET /graficaSolicitudesPorMes?year=`

**UI:** `client/src/pages/admin/AdminEstadisticas.tsx` — Chart.js.

### Smoke / QA tooling

| Script | Métrica |
|--------|---------|
| `scripts/smoke-prod.sh` | 12 checks prod |
| `scripts/smoke-mobile-api.sh` | API + socket integration field |
| `pnpm test:e2e` | Playwright cors/login/solicitud (skipped sin creds) |

### CI

`.github/workflows/ci.yml` — build + test server/client; no métricas post-deploy automáticas excepto workflow_dispatch smoke.

### Observabilidad ausente

- No APM (Datadog, Sentry) en código.
- No métricas Prometheus.
- No centralized log aggregation documentada.

---

## Inferido

- Render dashboard provee CPU/memoria básica.
- MongoDB Atlas monitoring externo al repo.

---

## Riesgos / Deuda

1. Sin error tracking frontend/mobile.
2. Sin alertas automatizadas post-deploy en CI default.
3. Métricas producto solo para líder — no exportables.

---

## Preguntas abiertas

- ¿Sentry para prod?
- ¿Dashboard operativo institucional?

---

## Matriz de confianza

| Capacidad | Nivel |
|-----------|-------|
| Health probe | verified |
| Product charts | verified |
| APM/tracing | verified absent |
| Log aggregation | uncertain |
