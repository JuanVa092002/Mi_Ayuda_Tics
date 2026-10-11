# Workflow v2

Cómo funciona el ticket nuevo en producción. El contrato canónico sigue siendo [contracts.md](./contracts.md). Si este texto y el código discrepan, gana el código.

**No hay migración masiva.** `workflowVersion` ausente = v1. `2` = este flujo.

Web consumes this workflow via `client/src/features/tickets/api/workflow.service.ts`. Mobile funcionario/técnico flows also call the same ticket API. None of those facts prove which Git SHA Render currently runs.

| Fuente | SHA | Cómo se verificó | Fecha | Estado |
|--------|-----|------------------|-------|--------|
| HEAD local | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | `git rev-parse HEAD` | 2026-09-14 | verified |
| origin/master | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | `git rev-parse origin/master` | 2026-09-14 | verified (matches HEAD) |
| Render live | — | no Render inspect / no deploy revision API | 2026-09-14 | **not verified** |
| último smoke | n/a (health 200 connected; OPTIONS `/api/auth/login` 204) | `pnpm run smoke:prod` in Phase 0 | 2026-09-14 | smoke executed; SHA not inferred from it |

Older documents that cite `48a67f8f2686e186e79c6e867142eb99630ed35c` as “API live” are historical. That commit exists in git history; it is **not** evidence of production live.

## Quick path

1. El funcionario crea una solicitud → `estado: nuevo`, `workflowVersion: 2`, evento `created`.
2. El líder asigna (o reasigna) un técnico → `asignado` (o se mantiene `esperando_usuario` si reasigna ahí).
3. El técnico inicia → `en_progreso`. Puede actualizar, pedir info, registrar **solución parcial** (sigue abierto) o **solución total** → `resuelto`.
4. El funcionario confirma → `cerrado`, o reabre → `en_progreso`. El líder puede cancelar solo desde `nuevo` o `asignado`.

## Arquitectura

```
Cliente (web cookie / mobile Bearer)
    → rutas /api/solicitud/:id/<acción>
    → assertWorkflowV2RuntimeReady (transacciones + índice unique)
    → transacción: update Solicitud + insert HistorialSolicitud
    → respuesta con lifecycle (displayStatus, capabilities, historial en detalle)
```

| Pieza | Rol |
|-------|-----|
| `Solicitud` | Estado persistido, `workflowVersion`, `workflowRevision`, `lastWorkflowOperationId` |
| `HistorialSolicitud` | Evento append-only (quién, qué, cuándo, mensaje, adjunto opcional) |
| `SolucionCaso` | **Solo v1.** No se usa para cerrar v2 |
| Atlas | Replica + índice `uniq_historial_solicitud_operationId`. Sin eso, v2 no arranca (503) |

Producción (`mongodb+srv`) **no** cae a standalone. Local simulation puede usar update condicional + rollback acotado a esa operación.

Listados **nunca** mandan `historial`. El detalle sí (`historial` + cursor).

## Estados y transiciones

```
nuevo → asignado → en_progreso ⇄ esperando_usuario
                 → en_progreso → resuelto → cerrado
                 ↘ cancelado (desde nuevo | asignado)
```

| Estado | Significado |
|--------|-------------|
| `nuevo` | Enviada; espera asignación |
| `asignado` | Técnico responsable; aún no inicia |
| `en_progreso` | En atención. Incluye solución parcial |
| `esperando_usuario` | Falta información del funcionario |
| `resuelto` | Solución total; **esperando confirmación** (no es “cerrado”) |
| `cerrado` | El funcionario confirmó |
| `cancelado` | El líder canceló; el documento se conserva |

| Acción | Desde | Hacia | Quién |
|--------|-------|-------|-------|
| `assign` | `nuevo` | `asignado` | líder |
| `reassign` | `asignado` | `asignado` | líder + motivo |
| `reassign` | `en_progreso` | `asignado` | líder + motivo |
| `reassign` | `esperando_usuario` | `esperando_usuario` | líder + motivo |
| `start` | `asignado` | `en_progreso` | técnico asignado |
| `update` | `en_progreso` | `en_progreso` | técnico asignado |
| `wait_for_requester` | `en_progreso` | `esperando_usuario` | técnico asignado |
| `requester_reply` | `esperando_usuario` | `en_progreso` | funcionario dueño |
| `partial_solution` | `en_progreso` | `en_progreso` | técnico asignado |
| `resolve` | `en_progreso` | `resuelto` | técnico asignado |
| `confirm` | `resuelto` | `cerrado` | funcionario dueño |
| `reopen` | `resuelto` | `en_progreso` | funcionario dueño |
| `cancel` | `nuevo`, `asignado` | `cancelado` | líder |

Reasignar está prohibido en `nuevo`, `resuelto`, `cerrado`, `cancelado`. Acciones v2 sobre un ticket v1 → 409.

## HistorialSolicitud

Colección `historialsolicituds`. Un documento por evento. Orden `createdAt` / `_id` ascendente.

Tipos: `created`, `assigned`, `reassigned`, `started`, `updated`, `waiting_for_requester`, `partial_solution`, `resolved`, `reopened`, `closed`, `cancelled`.

| Campo | Uso |
|-------|-----|
| `solicitud` | Ticket dueño |
| `type` + `message` | Qué pasó (mensaje de sistema o texto del actor) |
| `author` | Usuario que ejecutó la acción |
| `attachment` | Adjunto del evento si existe |
| `operationId` | Misma clave que `Idempotency-Key` |
| `metadata` | Motivo, nextAction, resolutionType, etc. |

Paginación del detalle: `historialLimit` (1–100, default 50), `historialBefore`, `historialNextCursor`.

Tickets v1 no tienen esta colección; el detalle puede mostrar `historyNote`.

## Idempotency-Key

Header HTTP `Idempotency-Key`. Sin header (y sin `operationId` de cuerpo legado) → **400** `IDEMPOTENCY_KEY_REQUIRED`. El servidor **no** genera la UUID.

Alcance: ticket + actor + tipo de acción + hash del payload de negocio (nunca password ni JWT).

| Caso | Resultado |
|------|-----------|
| Misma key + mismo actor + misma acción + mismo payload | 200 del resultado original. No duplica evento |
| Misma key + payload o acción o actor distinto | 409. No muta |
| 429 | No se reintenta solo. `Retry-After` solo apaga el CTA hasta que expire |

Clientes: una UUID por **intención** (acción + ticket + payload). Retry automático de mutaciones v2 = **0**. El CTA “Reintentar acción” reutiliza la misma key y el mismo payload.

Índice: ver [runbooks/historial-operation-id-unique.md](./runbooks/historial-operation-id-unique.md).

## Compatibilidad v1 / v2

| | v1 (ausente) | v2 (`2`) |
|--|----------------|----------|
| Alta nueva | Ya no. Las altas actuales son v2 | `nuevo` |
| Estados | `solicitado` → `asignado` → `pendiente` → `finalizado` | tabla de arriba |
| Cierre | `POST /solucionCaso` `finalizado` | `resolve` + `confirm` |
| Avance intermedio | `SolucionCaso` `pendiente` | `partial_solution` (sigue `en_progreso`) |
| Historial | `historyNote` en detalle | `HistorialSolicitud` |
| Mutaciones del otro flujo | 409 | 409 |

No se reescriben tickets viejos. No se inventa historial para v1.

## Checklist

- [ ] Ticket nuevo tiene `workflowVersion: 2` y evento `created`
- [ ] Solución parcial no pasa a `resuelto` ni `cerrado`
- [ ] Solución total deja `resuelto` hasta `confirm`
- [ ] Sin `Idempotency-Key` → 400
- [ ] Listado no incluye array `historial`
- [ ] Ticket v1 sigue cerrándose con `SolucionCaso`

## Siguiente

- Operar: [rollback-procedure.md](./rollback-procedure.md)
- Mobile: [mobile-deployment.md](./mobile-deployment.md)
- Release: [RELEASE_NOTES.md](../RELEASE_NOTES.md)
