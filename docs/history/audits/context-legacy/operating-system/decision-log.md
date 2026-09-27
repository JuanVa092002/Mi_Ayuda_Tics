# Decision Log — MiAyudaTIC

Registro de decisiones arquitectónicas y de producto. Formato: ADR-lite.

---

## DEC-001 — Monorepo pnpm (client + server + contracts)

| Campo | Valor |
|-------|-------|
| Fecha | Fase 1 openspec |
| Estado | Aceptado |
| Decisión | pnpm workspaces; mobile fuera por ahora |
| Evidencia | `pnpm-workspace.yaml` |
| Consecuencias | Mobile install separado |

---

## DEC-002 — Auth dual cookie + Bearer

| Campo | Valor |
|-------|-------|
| Fecha | Fase 4 mobile |
| Estado | Aceptado |
| Decisión | Web cookies httpOnly; mobile Bearer JWT |
| Evidencia | `extractAuthToken.ts`, Expo `client.ts` |

---

## DEC-003 — @miayuda/contracts (no @miayuda/types)

| Campo | Valor |
|-------|-------|
| Fecha | 2026 |
| Estado | Aceptado |
| Decisión | Package `packages/contracts`; server only hoy |
| Evidencia | `packages/contracts/package.json` |
| Nota | ARCHITECTURE.md dice types — stale |

---

## DEC-004 — Mobile oficial = Expo MiAyudaTIC-Mobile

| Campo | Valor |
|-------|-------|
| Fecha | 2026-06-13 |
| Estado | Aceptado |
| Decisión | Expo RN oficial; Flutter MBO_ULT = LEGACY |
| Evidencia | `context/architecture/mobile-architecture.md` |
| Consecuencias | No invertir en Flutter; portar flujos a Expo |

---

## DEC-005 — Líder web-only en mobile

| Campo | Valor |
|-------|-------|
| Fecha | Implementado en Expo |
| Estado | Aceptado |
| Decisión | Rol líder bloqueado en app mobile |
| Evidencia | `lider-not-supported.tsx`, `auth-context.tsx` |

---

## DEC-006 — Health check siempre 200

| Campo | Valor |
|-------|-------|
| Fecha | 2026-06 |
| Estado | Aceptado |
| Decisión | Liveness Render: HTTP 200; degraded en body si DB down |
| Evidencia | `server/src/core/health.ts`, RUNBOOK |

---

## DEC-007 — Context architecture como fuente agente

| Campo | Valor |
|-------|-------|
| Fecha | 2026-06-13 |
| Estado | Aceptado |
| Decisión | `context/` + `audit/` canónicos para AI; consolidar `.cursor/rules/` |
| Evidencia | Este repositorio |

---

## Pendientes de decisión

| ID | Pregunta | Opciones |
|----|----------|----------|
| DEC-P01 | ¿Mobile en pnpm workspace? | sí / no / npm workspace separado |
| DEC-P02 | ¿Archivar mobile_flutter? | delete / move archive / keep |
| DEC-P03 | ¿Socket en web client? | poll / socket.io |
| DEC-P04 | ¿Client importa contracts? | sí v2 / openapi codegen |

---

## Cómo añadir entradas

1. Copiar template DEC-00X.
2. Estado: Propuesto | Aceptado | Deprecado.
3. Enlazar evidencia en código.
4. Actualizar `context/architecture/*` si afecta arquitectura.
