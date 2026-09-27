# QA Sign-off — MiAyudaTIC Producción

Fecha: 2026-06-13  
Entorno: Vercel + Render (prod)

## Resultado: GO (con notas)

### Automatizado

| Check | Resultado |
|-------|-----------|
| `scripts/smoke-prod.sh` | 12/12 PASS |
| Server tests (28) | PASS |
| Client tests (4) | PASS |
| `verify:env` | TODO OK |
| `test:cloudinary` | PASS |
| Playwright E2E (cors + SPA) | 3/3 PASS (login/solicitud skipped sin creds E2E) |
| CI ampliado | client tests en workflow |

### DevOps (MCP)

| Plataforma | Estado |
|------------|--------|
| Render MCP | Conectado, deploy `live` |
| Vercel MCP | `READY`, miayudatics.vercel.app |
| Render healthCheckPath | `/api/health` configurado |

### Integraciones

| Servicio | Estado |
|----------|--------|
| MongoDB Atlas | connected (health) |
| Cloudinary | upload/delete smoke PASS |
| Brevo | API 200 en recuperarPassword (`correo`); inbox manual pendiente por tester |

### API producción

| ID | Resultado |
|----|-----------|
| A-02 a A-08 | PASS (401/422/404 según esperado) |
| CORS malicioso | Bloqueado (500) |
| CORS Vercel | 200 + allow-origin |

### Seguridad

| Check | Resultado |
|-------|-----------|
| `.env` gitignored | OK |
| Helmet headers | OK (CSP, HSTS) |
| HTTPS | OK |

### Pendiente manual (pre-piloto)

- [ ] Confirmar email Brevo en inbox real
- [ ] Journeys completos por rol con usuarios de prueba (funcionario, líder, técnico)
- [ ] Redeploy Render para exponer `integrations` en `/api/health`
- [ ] Definir `E2E_LEADER_*` / `E2E_FUNCIONARIO_*` en `e2e/.env.e2e` para login E2E

### URLs

- Frontend: https://miayudatics.vercel.app
- Backend: https://miayudatics-v1-0.onrender.com
