# QA Matrix — MiAyudaTIC

---

## Verificado — capas de prueba

| Capa | Herramienta | Alcance | CI |
|------|-------------|---------|-----|
| Server unit | Vitest + supertest | auth, security, solicitud, socket, media | ✓ ci.yml |
| Server integration | Vitest + Atlas | production-simulation (opcional) | ✗ |
| Client unit | Vitest + RTL | roleHome, RequireRole, apiError | ✓ ci.yml |
| E2E web | Playwright | cors, login, solicitud | ✗ (manual/dispatch) |
| Smoke prod | bash scripts/smoke-prod.sh | 12 checks prod | workflow_dispatch |
| Smoke mobile API | smoke-mobile-api.sh | health, bearer, cors | ✗ |
| Smoke mobile socket | smoke:mobile-client | CONNECTION_ACK | ✗ |
| Mobile Expo | tsc only | types | ✗ |
| Flutter legacy | — | no tests | ✗ |

---

## Matriz rol × journey

| Journey | Web manual | E2E auto | Mobile Expo |
|---------|------------|----------|-------------|
| Register funcionario | ✓ checklist | skipped | manual |
| Register tecnico + approve | ✓ | skipped | manual |
| Login por rol | ✓ | partial | auth only |
| Crear solicitud | ✓ | skipped | N/A |
| Asignar técnico | ✓ | N/A | N/A |
| Resolver caso | ✓ | N/A | N/A |
| Reset password | ✓ | N/A | manual |
| Líder estadísticas | ✓ | N/A | blocked |

**Referencia:** `docs/deployment/production-qa-checklist.md`

---

## Entornos

| Env | DB | API URL |
|-----|-----|---------|
| Local | Atlas dev / .env | localhost:8000 |
| Test | miayudatics_simulation | .env.test |
| Prod | Atlas prod | miayudatics-v1-0.onrender.com |

---

## Inferido

- E2E requiere `e2e/.env.e2e` con credenciales reales para login/solicitud.

---

## Gaps prioritarios

1. CI: añadir `pnpm run smoke:mobile-api` post server test.
2. Mobile: tests auth con mock server.
3. E2E en CI con secrets GitHub.
4. Visual regression — no existe.

---

## Matriz de confianza

| Área | Nivel |
|------|-------|
| Server test coverage | verified partial |
| Mobile QA | verified absent |
