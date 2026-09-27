# Fuentes y Trazabilidad

Mapa de documentos y artefactos usados para generar los briefs y el code review (12-jun-2026).

---

## Documentación del repositorio

| Archivo | Contenido usado |
|---------|-----------------|
| [`MiAyudaTics_v1.0/docs/ARCHITECTURE.md`](../MiAyudaTics_v1.0/docs/ARCHITECTURE.md) | Contrato monorepo, FSD-lite, deploy, zero-warnings |
| [`MiAyudaTics_v1.0/docs/agentic-os.md`](../MiAyudaTics_v1.0/docs/agentic-os.md) | Identidad producto, roles, estándares técnicos |
| [`MiAyudaTics_v1.0/CHANGELOG.md`](../MiAyudaTics_v1.0/CHANGELOG.md) | Rediseño AyudaTIC 2026, auth hardening |
| [`MiAyudaTics_v1.0/server/README.md`](../MiAyudaTics_v1.0/server/README.md) | Comandos dev y env |
| [`MiAyudaTics_v1.0/client/src/features/README.md`](../MiAyudaTics_v1.0/client/src/features/README.md) | Plantilla feature-based frontend |

---

## openspec/

| Archivo | Contenido usado |
|---------|-----------------|
| [`openspec/config.yaml`](../MiAyudaTics_v1.0/openspec/config.yaml) | Fases 1–3, reglas SDD |
| [`openspec/specs/phase-1-quality-setup.md`](../MiAyudaTics_v1.0/openspec/specs/phase-1-quality-setup.md) | ADRs, tooling |
| [`openspec/specs/phase-2-backend-migration.md`](../MiAyudaTics_v1.0/openspec/specs/phase-2-backend-migration.md) | Migración backend (stale) |
| [`openspec/specs/phase-2-final-report.md`](../MiAyudaTics_v1.0/openspec/specs/phase-2-final-report.md) | Cierre fase 2 |
| [`openspec/specs/phase-2.5-zod-migration.md`](../MiAyudaTics_v1.0/openspec/specs/phase-2.5-zod-migration.md) | Zod migration |
| [`openspec/specs/phase-2.5-final-report.md`](../MiAyudaTics_v1.0/openspec/specs/phase-2.5-final-report.md) | Cierre 2.5 |
| [`openspec/specs/phase-3-frontend-migration.md`](../MiAyudaTics_v1.0/openspec/specs/phase-3-frontend-migration.md) | Pendiente frontend TS |
| [`openspec/specs/phase-3-deploy-confidence-final-report.md`](../MiAyudaTics_v1.0/openspec/specs/phase-3-deploy-confidence-final-report.md) | Tests deploy |
| [`openspec/archive/PROGRESS_HISTORY.md`](../MiAyudaTics_v1.0/openspec/archive/PROGRESS_HISTORY.md) | UI redesign, historial ejecución |
| [`openspec/archive/DECISIONS_HISTORY.md`](../MiAyudaTics_v1.0/openspec/archive/DECISIONS_HISTORY.md) | ADRs, rechazos de upgrades |

---

## Código — puntos de anclaje

| Área | Archivos clave |
|------|----------------|
| Entry server | `server/src/index.ts`, `server/src/core/app.ts` |
| Rutas API | `server/src/core/routes.ts`, `server/src/features/**/routes/*.ts` |
| Auth | `server/src/features/auth/controllers/auth.ts` |
| Middleware | `server/src/shared/middleware/session.ts`, `rol.ts` |
| JWT | `server/src/shared/utils/handleJwt.ts` |
| Modelos | `server/src/core/models.ts`, `server/src/features/**/models/*.ts` |
| Validators | `server/src/shared/validators/*.ts` |
| Socket | `server/src/shared/utils/handleSocket.ts` |
| Client router | `client/src/app/router/Allroutes.jsx`, `private.routes.jsx` |
| Auth client | `client/src/app/providers/Auth.context.jsx`, `client/src/services/axios.js` |
| Tests | `server/src/tests/*.test.ts`, `server/src/tests/integration/production-simulation.test.ts` |

---

## Ejecución baseline (12-jun-2026)

Comandos ejecutados en `MiAyudaTics_v1.0/`:

```bash
pnpm -C server run build   # FAIL
pnpm -C server test        # 10 pass, integration fail
pnpm -C client run build   # OK
pnpm -C client run lint    # 13 warnings
pnpm -C server run lint    # 103 warnings
```

---

## Code review — metodología

| Componente | Referencia |
|------------|------------|
| Judgment Day skill | `~/.cursor/skills/judgment-day/SKILL.md` |
| Judge A (auth) | Subagent f22a400b |
| Judge B (auth) | Subagent 76dd8285 |
| Security review | Subagent ca89da22 (diff-only) |
| Backend slices 2–4 | Subagent d7bd6b3f |
| Frontend slices 5–6 | Subagent 909dd449 |
| Arch + deploy slices 7–8 | Subagent fce5efeb |

---

## Afirmaciones → fuente

| Afirmación en briefs | Fuente primaria |
|---------------------|-----------------|
| Tres roles: funcionario, técnico, líder | `agentic-os.md` §1 |
| Stack MERN + Socket.IO | `agentic-os.md`, `openspec/config.yaml` |
| Deploy Vercel + Render | `ARCHITECTURE.md` §5 |
| ~56 archivos JSX en client | Conteo explore agent + glob |
| Rutas públicas en solicitud/usuarios/storage | `grep` routes + Judge backend |
| Registro público lider | `auth.ts` + Judge A/B CONFIRMED |
| Rediseño AyudaTIC 2026 | `CHANGELOG.md`, `PROGRESS_HISTORY.md` |
| Fase 3 frontend pending | `openspec/config.yaml`, `phase-3-frontend-migration.md` |

---

## Documentos generados (esta carpeta)

| Archivo | Generado |
|---------|----------|
| `README.md` | Índice y smoke test |
| `01-brief-producto.md` | Producto |
| `02-brief-tecnico.md` | Técnico |
| `03-flujos-usuario.md` | UX / operaciones |
| `04-superficie-api.md` | API |
| `05-deuda-roadmap.md` | Planificación |
| `06-code-review.md` | Judgment Day |
| `07-elevator-pitch.md` | Comunicación ejecutiva |
| `fuentes.md` | Este archivo |

---

## Notas de limitación

- **briefs/** está fuera del repo git `MiAyudaTics_v1.0` — no se versiona con el código salvo copia manual.
- Security-review subagent analizó solo diff de branch; hallazgos de código preexistente vienen de Judges A/B.
- No se modificó `openspec/` ni `docs/` en el repo según plan.
- URLs de producción pueden cambiar; verificar en dashboards Vercel/Render antes de comunicar externamente.
