# MiAyudaTIC — Context Architecture

> **Arquitectura de contexto persistente** para agentes y desarrolladores.  
> Generado: 2026-06-13 | Repo: `MiAyudaTics_v1.0`

Este directorio es la **fuente canónica operativa** para AI y onboarding técnico. Complementa (y corrige donde está stale) `docs/ARCHITECTURE.md` y `.agent/`.

---

## Índice rápido

| Carpeta | Contenido |
|---------|-----------|
| [`architecture/`](architecture/) | Sistema, dominio, web, API, mobile, auth, contratos |
| [`product/`](product/) | Visión, usuarios, métricas, roadmap |
| [`design/`](design/) | Principios, design system SENA, copy |
| [`operating-system/`](operating-system/) | Agentes, DoD, templates, decision log |
| [`delivery/`](delivery/) | QA matrix, release, riesgos |
| [`../audit/`](../audit/) | Auditoría código vs docs |

**Reglas Cursor:** `.cursor/rules/00-global.mdc` … `50-delivery-workflow.mdc`

---

## 1. Qué se revisó

Auditoría integral del repositorio:

- **51 archivos `.md`** existentes (docs, briefs, openspec, .agent, .cursor)
- **`client/`** — React/Vite, rutas, auth, API, design tokens, tests
- **`server/`** — Express, modelos, ~50 endpoints, RBAC, Socket.IO, Cloudinary, Brevo, tests Vitest
- **`mobile/MiAyudaTIC-Mobile/`** — Expo 56, expo-router, auth completo, session stub
- **`mobile_flutter/MBO_ULT/`** — Flutter legacy, backend distinto
- **`packages/contracts/`** — socket, media, solicitud schemas
- **CI/CD** — `.github/workflows/ci.yml`, Playwright e2e, smoke scripts
- **Deploy** — `server/Dockerfile`, `client/vercel.json`, docs Render/Vercel

---

## 2. Qué se encontró

- Monorepo web+API **maduro en producción** (Vercel + Render, smoke 12/12 en QA sign-off).
- Backend **listo para mobile** (Bearer, socket, multipart, smoke scripts).
- Mobile Expo **solo auth** — sin solicitudes ni socket en cliente.
- Flutter legacy **más completo en flujos** pero apunta a **otro backend** — no usar.
- `@miayuda/contracts` consumido solo por **server**; web y mobile duplican tipos.
- Documentación **parcialmente stale** (openspec config, briefs pre-hardening, README mobile incorrecto).
- Mobile **ausente** en README, ARCHITECTURE paths, pnpm workspace, CI.

---

## 3. Qué estaba documentado

| Área | Docs |
|------|------|
| Arquitectura web+API | `docs/ARCHITECTURE.md`, briefs, openspec |
| Mobile API backend | `docs/mobile-integration.md`, phase-4 spec |
| Deploy | `docs/deployment/*`, RUNBOOK, SECURITY |
| QA prod web | `production-qa-checklist.md`, qa-signoff |
| Agent OS | `.agent/core-rules.md`, `docs/agentic-os.md` |

---

## 4. Qué NO estaba documentado

- Ruta y estructura `mobile/MiAyudaTIC-Mobile/`
- Existencia y estado **LEGACY** de `mobile_flutter/MBO_ULT/`
- Política líder **web-only** en mobile
- Divergencia backend Flutter vs prod actual
- `context/` como capa de conocimiento (este trabajo lo crea)
- Gaps CI mobile, assets faltantes Expo

---

## 5. Hallazgos importantes — módulo mobile

| Hallazgo | Impacto |
|----------|---------|
| Expo oficial alineado a `miayudatics-v1-0.onrender.com` | Correcto para prod |
| Solo auth implementado; session = stub | Sin valor campo aún |
| Líder bloqueado explícitamente | Coherente con producto admin web |
| Flutter tiene solicitud/solución pero **backend obsoleto** | Referencia UX, no runtime |
| No en pnpm workspace | Install/deploy separado |
| Sin tests ni CI mobile | Riesgo regresión |
| README Expo dice "otro repositorio" | **Wrong** — confunde onboarding |

Detalle: [`audit/mobile-audit.md`](../audit/mobile-audit.md), [`architecture/mobile-architecture.md`](architecture/mobile-architecture.md).

---

## 6. Top 10 riesgos técnicos / producto

1. **Mobile sin flujos de negocio** — adopción campo bloqueada
2. **Flutter legacy con URL incorrecta** — riesgo si alguien lo ejecuta contra prod
3. **Drift de tipos** client/mobile vs `@miayuda/contracts`
4. **Docs stale** confunden agentes humanos (mitigado por `context/`)
5. **Sin CI/build mobile** — regresiones no detectadas
6. **Secretos** — rotación si expuestos en chats
7. **Render cold start** — UX latencia en plan free
8. **Sin Sentry/APM** — ceguera en errores prod
9. **E2E Playwright fuera de CI** — journeys no gateados
10. **Mobile fuera de workspace** — version drift de dependencias

Registro completo: [`delivery/risk-register.md`](delivery/risk-register.md).

---

## 7. Calidad actual de la documentación

| Dimensión | Nota | Comentario |
|-----------|------|------------|
| Completitud web+API | 7/10 | ARCHITECTURE + briefs sólidos |
| Actualidad | 5/10 | openspec, briefs, .agent/repo-map stale |
| Mobile | 3/10 | Solo API guide; cliente sin doc |
| Operabilidad | 8/10 | RUNBOOK, deployment, QA checklist |
| AI-readiness pre-context | 4/10 | Fragmentado, contradictions |

**Post-`context/`:** documentación operativa para agentes sube significativamente; `docs/` humanos aún requieren refresh puntual (`audit/docs-vs-code.md`).

---

## 8. Calidad actual de la arquitectura

| Dimensión | Nota | Comentario |
|-----------|------|------------|
| Separación capas | 8/10 | FSD-lite + feature-modules claros |
| Auth/RBAC | 8/10 | Dual transport bien diseñado |
| Contratos compartidos | 5/10 | Solo server adopta contracts |
| Realtime | 6/10 | Backend listo; web poll; mobile ausente |
| Testabilidad | 6/10 | Server bueno; client/mobile débil |
| Deploy | 7/10 | Funcional; sin IaC render.yaml |
| Multi-surface coherence | 5/10 | Mobile v1 incompleto; Flutter diverge |

---

## 9. AI-readiness score: **6 / 10**

| Criterio | Puntos | Justificación |
|----------|--------|---------------|
| Estructura repo clara | +1 | Monorepo predecible |
| Reglas agente | +1 | `.cursor/rules/` consolidadas + context |
| Contratos machine-readable | +0.5 | contracts parcial |
| Docs vs código alineados | +0.5 | audit trazabilidad; muchos stale |
| Mobile en contexto | +1 | Ahora documentado |
| Tests como spec | +1 | Server tests útiles |
| Single source of truth | +1 | context/ canónico |
| Gaps | -1 | Flutter confuso, mobile incompleto, tipos duplicados |

**Para llegar a 8+:** integrar mobile al workspace, implementar solicitudes Expo, client→contracts, refresh docs stale, CI mobile smoke.

---

## 10. Próximos 10 contextos de mayor impacto

1. **`context/architecture/mobile-feature-solicitud.md`** — spec implementación crear solicitud Expo
2. **`context/architecture/mobile-feature-tecnico.md`** — casos asignados + solución
3. **`context/architecture/socket-client-guide.md`** — web + mobile socket integration
4. **`context/delivery/e2e-credentials.md`** — setup `e2e/.env.e2e` seguro
5. **`context/architecture/contracts-adoption.md`** — plan client+mobile → `@miayuda/contracts`
6. **`audit/flutter-archive-plan.md`** — retiro/archivo MBO_ULT
7. **Actualizar `docs/ARCHITECTURE.md`** — § mobile + fix @miayuda/types naming
8. **`context/delivery/mobile-release.md`** — EAS Build, store listing
9. **`context/architecture/env-matrix.md`** — todas las env vars por superficie
10. **`context/product/pilot-runbook.md`** — operación institucional día-a-día

---

## Convención de lectura

Cada archivo en `context/` incluye secciones:

- **Verificado** — evidencia en código
- **Inferido** — hipótesis razonadas
- **Riesgos / Deuda**
- **Preguntas abiertas**
- **Matriz de confianza** (en architecture/)

---

## Empezar aquí (agentes)

```
1. context/README.md          ← este archivo
2. context/architecture/system-overview.md
3. audit/docs-vs-code.md      ← si hay duda sobre docs viejos
4. context/operating-system/task-template.md  ← nueva tarea
5. Superficie específica:
   - Web → frontend-architecture.md
   - API → backend-architecture.md + auth-rbac.md
   - Mobile → mobile-architecture.md
```

---

## Artefactos generados (inventario)

### `audit/`
- `repo-map.md`
- `backend-audit.md`
- `frontend-audit.md`
- `mobile-audit.md`
- `docs-vs-code.md`

### `context/architecture/`
- `system-overview.md`, `domain-model.md`, `backend-architecture.md`, `frontend-architecture.md`
- `mobile-architecture.md`, `auth-rbac.md`, `api-contracts.md`
- `notifications-and-events.md`, `analytics-observability.md`

### `context/product/`
- `product-overview.md`, `users-and-jtbd.md`, `success-metrics.md`, `roadmap-v1-v2.md`

### `context/design/`
- `product-principles.md`, `design-system.md`, `copy-tone.md`

### `context/operating-system/`
- `agents.md`, `handoff-template.md`, `definition-of-done.md`, `task-template.md`, `decision-log.md`

### `context/delivery/`
- `qa-matrix.md`, `release-checklist.md`, `risk-register.md`

### `.cursor/rules/`
- `00-global.mdc` … `50-delivery-workflow.mdc` (canónico)
- `_archive/` — reglas 01-05 anteriores
