---
name: ticket-lifecycle
description: Guides solicitud ticket lifecycle — v1 vs v2 states, asignación, historial, SolucionCaso (v1 only), idempotency. Use when implementing or reviewing solicitud, tipoCaso, solucionCaso, ticket estado, or consecutivoCaso in web, API, or mobile.
---

# Ticket Lifecycle (MiAyudaTIC)

## Decision

`workflowVersion` **ausente** = legacy v1. `workflowVersion: 2` = flujo nuevo. Tickets nuevos nacen `estado: 'nuevo'` + v2. No hay migración masiva ni historia inventada.

## Legacy v1

```
solicitado → asignado → pendiente → finalizado
```

Cierre y avances intermedios: `POST /api/solucionCaso/:id` (`tipoSolucion: pendiente | finalizado`). **No usar SolucionCaso en v2.**

## Workflow v2

```
nuevo → asignado → en_progreso ⇄ esperando_usuario
                 → en_progreso → resuelto → cerrado
                 ↘ cancelado (desde nuevo|asignado)
```

`resuelto` = Esperando confirmación (no En atención). Reabrir: `resuelto → en_progreso`.

| Acción | Estados origen | Rol |
|--------|----------------|-----|
| assign | `nuevo` | líder |
| reassign | `asignado`, `en_progreso`, `esperando_usuario` | líder + motivo |
| start / update / wait_for_requester / partial_solution / resolve | ver transiciones en `docs/contracts.md` | técnico asignado |
| requester_reply / confirm / reopen | `esperando_usuario` / `resuelto` | funcionario dueño |
| cancel | `nuevo`, `asignado` | líder |

## List vs detail

- Listas: nunca `historial`.
- Detalle: `historial` + `historialNextCursor`.
- Cursor: `historialLimit`, `historialBefore`, `historialNextCursor`.
- Eventos append-only en `HistorialSolicitud` (solo v2).

## Idempotency-Key

Header `Idempotency-Key` (primario). El servidor no inventa UUID. Sin key → 400 `IDEMPOTENCY_KEY_REQUIRED`. Scope: ticket + actor + actionType + payloadHash. Índice unique sparse solo vía `migrate:historial-operation-id`, no autoIndex.

Web/mobile: una UUID por intención (acción + ticket + payload). Conservarla para CTA manual `Reintentar acción`. Retry automático de mutaciones v2 = 0 (no 5xx, no red, no 429, no polling). Login retry permanece aparte.

## Atomicidad

- Atlas / `mongodb+srv` / production: sesión + transacción; fail-closed 503 si no hay replica o falta el índice unique. Nunca fallback silencioso a standalone. Nunca autoIndex para el unique v2.
- Standalone local: update condicional (`estado` + `workflowRevision` + v2) → insert historial; rollback solo si `estado` + `workflowRevision` + `lastWorkflowOperationId` siguen siendo de esa operación.

## E2E remoto

Sin deployment, el Render actual no valida workflow v2. Un E2E contra Render sin el código desplegado sería una prueba del backend anterior. Bloqueos reales: código desplegado, índice verificado, transacciones, storage aislado, cuentas no personales, credenciales fuera de git, limpieza sin DELETE. No crear cuentas hasta decidir el entorno (preview/QA/staging aislado).

## Adjuntos

Acceso por ticket actual (dueño, técnico asignado, líder). ObjectId/filename solos no bastan. Ver matriz en `docs/contracts.md`.

## Workflow

1. Read `docs/contracts.md` § Ticket state machine
2. Update `@miayuda/contracts` if payload changes
3. Implement API with Zod + RBAC tests
4. Wire web (cookies) or mobile (Bearer) consumer
5. Verify state transitions cannot skip roles

## Tests required

- funcionario cannot assign
- tecnico cannot create solicitud for another user
- invalid state transition returns 422/403/409
- idempotency replay vs 409 de key reutilizada
- rollback standalone no pisa mutación posterior
- matriz de adjuntos por rol

## References

- `docs/contracts.md`
- `server/src/features/tickets/models/solicitud.ts`
- `server/src/features/tickets/domain/solicitud-lifecycle.ts`
