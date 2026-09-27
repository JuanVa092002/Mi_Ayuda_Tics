# Docs vs Code — Trazabilidad

> Comparación documentación existente vs código operativo.  
> **Prioridad en conflicto:** código > docs (docs marcadas stale/wrong).

---

## Tabla de trazabilidad

| Claim / documento | Ruta doc | Evidencia en código | Estado | Nota |
|-------------------|----------|---------------------|--------|------|
| Monorepo pnpm client+server | `docs/ARCHITECTURE.md` §1 | `pnpm-workspace.yaml`: client, server, contracts | **verified** | Mobile excluido del workspace |
| Aislamiento client/server | `docs/ARCHITECTURE.md` §1 | Sin cross-imports | **verified** | |
| FSD-lite frontend | `docs/ARCHITECTURE.md` §2 | `client/src/app\|pages\|features\|shared` | **verified** | |
| Feature-modules backend | `docs/ARCHITECTURE.md` | `server/src/core\|features\|shared` | **verified** | |
| Deploy Vercel client | `docs/deployment/vercel.md` | `client/vercel.json`, README | **verified** | |
| Deploy Render server | `docs/deployment/render.md` | `server/Dockerfile`, scripts | **partial** | No `render.yaml` en repo |
| Paquete `@miayuda/types` | `docs/ARCHITECTURE.md` §1, §4 | Existe `@miayuda/contracts` en `packages/contracts` | **stale** | Nombre incorrecto en ARCHITECTURE |
| Mobile API Bearer + Socket | `docs/mobile-integration.md` | `extractAuthToken.ts`, `handleSocket.ts`, contracts | **verified** | Backend listo |
| App mobile Expo en monorepo | — | `mobile/MiAyudaTIC-Mobile/` | **undocumented** | No en README ni ARCHITECTURE paths |
| App Flutter | — | `mobile_flutter/MBO_ULT/` | **undocumented** | Legacy; backend distinto |
| Fase 4 mobile backend | `openspec/specs/phase-4-mobile-platform.md` | smoke scripts, media, socket | **partial** | Checkboxes abiertos; backend mayormente hecho |
| Phase 3 frontend pending | `openspec/config.yaml` | Client TS + FSD completo | **stale** | Config no actualizado |
| CI usa Jest | `openspec/config.yaml`, `04-backend.mdc` | Vitest en server/client | **wrong** | |
| CI e2e false | `openspec/config.yaml` | `playwright.config.ts`, `e2e/*` | **wrong** | E2E existe, no en CI |
| Roles funcionario/tecnico/lider | `briefs/03-flujos-usuario.md` | `usuarios.ts` model, routes RBAC | **verified** | |
| Líder no mobile | — | `lider-not-supported.tsx`, auth-context | **undocumented** | Comportamiento solo en código mobile |
| Auth cookie web | `docs/SECURITY.md` | `axios.ts` withCredentials | **verified** | |
| Auth Bearer mobile | `docs/mobile-integration.md` | Expo `client.ts` Bearer | **verified** | |
| Health siempre 200 | `docs/RUNBOOK.md` | `core/health.ts` | **verified** | |
| Client importa contracts | `docs/mobile-integration.md` (sugiere RN) | client sin dep contracts | **partial** | Solo server usa contracts |
| Mobile README otro repo | `mobile/.../README.md` | `server/` mismo monorepo | **wrong** | |
| Server build falla | `briefs/README.md` baseline | CI + QA signoff pass | **stale** | Jun 12 baseline |
| Phase 4 sin spec | `briefs/05-deuda-roadmap.md` | `phase-4-mobile-platform.md` existe | **stale** | |
| P0 rutas públicas críticas | `briefs/06-code-review.md` | `security.test.ts`, QA signoff | **stale** | Post-hardening |
| Repo map agent | `.agent/repo-map.md` | Sin mobile, contracts, FSD actual | **stale** | |
| Producción URLs | `scripts/smoke-prod.sh` | health 200 documentado QA | **verified** | |
| QA checklist mobile app | `production-qa-checklist.md` | No steps Expo/Flutter | **partial** | Solo API smoke scripts |
| `@miayuda/contracts` en mobile | `docs/mobile-integration.md` | Expo Zod local | **wrong** | No implementado |
| Flutter backend prod | — | Hardcoded otro Render host | **undocumented** | Riesgo si alguien usa Flutter |

---

## Verificación por área

### Arquitectura general
- **Correcto:** monorepo, separación capas, deploy web+API, Fase 4 API surface.
- **Falta:** mobile apps como ciudadanos del sistema; `context/` como nueva fuente operativa.

### Roles y rutas
- **Correcto:** tres roles web; matrices RBAC server coinciden con client guards.
- **Falta:** doc oficial de exclusión líder en mobile Expo.

### Endpoints
- **Correcto:** `briefs/04-superficie-api.md` y `core/routes.ts` alineados en gran parte.
- **Revisar:** briefs security section post-hardening.

### Auth / RBAC
- **Correcto:** dual transport cookie+Bearer; técnico pending approval.
- **Parcial:** cursor rules dicen "JWT solo cookies" — incompleto para mobile.

### Mobile
- **Backend:** verified en docs.
- **Cliente Expo:** undocumented en docs core.
- **Flutter:** undocumented; wrong backend.

### Build / deploy
- **Correcto:** Vercel + Render manual docs.
- **Falta:** mobile build, EAS, CI mobile smoke.

### Seguridad
- **Correcto:** SECURITY.md rate limits, CORS, reporte vulns.
- **Stale:** briefs/06 pre-remediation.

---

## Docs stale/wrong — prioridad de corrección (futuro)

1. `docs/ARCHITECTURE.md` — añadir § mobile + corregir `@miayuda/types` → `@miayuda/contracts`
2. `README.md` — mobile + context index
3. `mobile/MiAyudaTIC-Mobile/README.md` — monorepo path
4. `openspec/config.yaml` — phases, Vitest, e2e, phase 4
5. `.agent/repo-map.md` — o deprecar en favor de `context/`
6. `briefs/README.md`, `05-deuda-roadmap.md`, `06-code-review.md` — refresh post QA

---

## Inferido

- `context/` reemplaza progresivamente `.agent/` y fragmentos de `docs/` para agentes AI.
- `docs/ARCHITECTURE.md` sigue siendo contrato humano hasta merge explícito.

---

## Riesgos

- Agentes que lean solo `README.md` o `.agent/repo-map.md` ignorarán mobile.
- Reglas cursor antiguas (Jest, solo cookies) pueden inducir errores en tareas mobile.

---

## Matriz de confianza

| Área | Confianza |
|------|-----------|
| Tabla trazabilidad | verified (muestra representativa) |
| Lista stale completa | partial (51 .md en repo) |
