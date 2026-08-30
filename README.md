# MiAyudaTIC

Monorepo de la mesa de ayuda institucional SENA (CTPI-Cauca).

**Producción:** [miayudatics.vercel.app](https://miayudatics.vercel.app) · API [miayudatics-v1-0.onrender.com](https://miayudatics-v1-0.onrender.com)

## Agentes Cursor

**Entrypoint:** [AGENTS.md](AGENTS.md) — roles, skills, verify, QA subprocess.

| Capa | Ubicación |
|------|-----------|
| Instrucciones proyecto | [`AGENTS.md`](AGENTS.md) |
| Reglas | [`.cursor/rules/`](.cursor/rules/) |
| Subagents | [`.cursor/agents/`](.cursor/agents/) |
| Skills | [`.cursor/skills/`](.cursor/skills/) |
| Hooks | [`.cursor/hooks.json`](.cursor/hooks.json) |

## Requisitos

- Node.js 22+
- pnpm 9+
- MongoDB Atlas

## Inicio rápido

```bash
pnpm install
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edita server/.env y client/.env

pnpm -C server run dev    # http://localhost:8000
pnpm -C client run dev    # http://localhost:5173
```

Seed del líder inicial (solo desarrollo; credenciales en `.env` local, no en el repo):

```bash
# En server/.env (local, gitignored):
# SEED_LIDER_EMAIL=...
# SEED_LIDER_PASSWORD=...
cd server && npx ts-node --transpile-only src/scripts/seed-lider.ts
```

## Calidad

```bash
pnpm -C server run typecheck && pnpm -C server run test && pnpm -C server run build
pnpm -C client run typecheck && pnpm -C client run test && pnpm -C client run build
```

## Estructura del repo

| Ruta | Descripción |
|------|-------------|
| `client/` | Web React + Vite (Vercel) |
| `server/` | API Express (Render) |
| `mobile/MiAyudaTIC-Mobile/` | App móvil oficial (Expo) |
| `packages/contracts/` | Tipos compartidos `@miayuda/contracts` |
| `docs/` | Documentación operativa canónica |
| `archive/` | Histórico (briefs, openspec, auditorías, QA) |
| `AGENTS.md` | Entrypoint para agentes Cursor |
| `.cursor/` | Rules, skills, hooks |

## Documentación operativa (`docs/`)

| Memo | Contenido |
|------|-----------|
| [product.md](docs/product.md) | Visión, ICP, métricas, anti-goals |
| [architecture.md](docs/architecture.md) | Diseño del sistema, deploy, seguridad, datos, móvil |
| [contracts.md](docs/contracts.md) | Invariantes, RBAC, estados, payloads |
| [design-system.md](docs/design-system.md) | Tokens SENA, patrones UI web+móvil |
| [analytics.md](docs/analytics.md) | Eventos y métricas north-star |
| [agents.md](docs/agents.md) | Roles, review matrix, QA subprocess |
| [operating-model.md](docs/operating-model.md) | Cómo operar con Cursor + runbook |
| [execution-rhythm.md](docs/execution-rhythm.md) | Cadencia y ceremonias |
| [quality-bar.md](docs/quality-bar.md) | Estándares de excelencia |
| [handoff-template.md](docs/handoff-template.md) | Plantilla de transferencia |

**Regla:** el código manda si hay conflicto con docs. Verificación en `archive/audits/`.

## Skills de proyecto

| Skill | Cuándo usar |
|-------|-------------|
| `ticket-lifecycle` | Estados, solicitud, solucionCaso |
| `rbac-review` | Auth, checkRol, endpoints |
| `mobile-field-ux` | Pantallas móvil campo, cámara |
| `design-system` | UI, tokens, premium bar |
| `release-readiness` | Deploy, smoke, go/no-go |
| `docs-handoff` | Cerrar workstream |

## Despliegue

- Frontend: Vercel (`client/`) — ver [docs/architecture.md](docs/architecture.md#deployment)
- Backend: Render (`server/`) — ver [docs/architecture.md](docs/architecture.md#deployment)
- Operaciones e incidentes: [docs/operating-model.md](docs/operating-model.md#runbook)
- CI: `.github/workflows/ci.yml`
