# Release notes — Workflow v2

**Fecha:** 2026-09-07  
**API en Render:** `48a67f8f2686e186e79c6e867142eb99630ed35c`  
**Rollback de código:** `050922c2e39453db034d237a365ba97c898f1938`  
**Servicio:** `https://miayudatics-v1-0.onrender.com`  
**Este documento no autoriza un deploy nuevo.**

## Qué se entregó

Tickets nuevos nacen en workflow v2 (`workflowVersion: 2`, `estado: nuevo`). El historial es append-only. La solución parcial no cierra el caso. La solución total espera confirmación del funcionario. Las mutaciones v2 exigen `Idempotency-Key`. Los tickets viejos siguen en v1.

## Features (API)

| Capacidad | Comportamiento |
|-----------|----------------|
| Historial append-only | Colección `historialsolicituds`. No se reescribe ni se borra un evento. |
| Solución parcial | El ticket permanece `en_progreso`. |
| Solución total | Pasa a `resuelto` (esperando confirmación). Cierre real = `confirm` → `cerrado`. |
| Idempotency-Key | Header obligatorio. El servidor no inventa UUID. Replay seguro vs 409. |
| Reasignación | Líder, con motivo, en `asignado` / `en_progreso` / `esperando_usuario`. |
| Cancelación | Líder, desde `nuevo` o `asignado`. El ticket se conserva (`cancelado`). |
| Legacy v1 | `workflowVersion` ausente. `SolucionCaso` y estados `solicitado`…`finalizado`. Sin migración masiva. |

Índice Atlas (ya aplicado, no autoIndex): `uniq_historial_solicitud_operationId` `{ solicitud: 1, operationId: 1 }` unique + sparse.

## Mobile

| Capacidad | Comportamiento |
|-----------|----------------|
| Timeline | Historial agrupado por Hoy / Ayer / fecha. |
| Iconos y color | Cada `type` de evento tiene nodo, color institucional y peso visual. |
| Evidencia | Foto inline en el evento; tap abre lightbox in-app (zoom/pan). |
| Contratos | Detalle mapea `historial`, `attachment`, `lifecycleState`. Las listas no copian historial. |

Mutaciones v2 que mobile llama llevan `Idempotency-Key`. Reasignar y cancelar son de líder: no hay app líder en mobile (siguen en web).

API diaria del teléfono: Render HTTPS. Metro en el loop de desarrollo; no hace falta rebuild nativo para JS/TS.

## E2E (D3, Render ya en v2)

- **21/21** pasos del flujo remoto.
- Tickets: `2026-09-00003` cerrado, `2026-09-00004` cerrado, `2026-09-00005` cancelado. Sin DELETE.
- Health con API caliente: ~378 ms. Aceptable para el plan free (cold start sigue existiendo tras inactividad).

Validación extra en A30s (fuera de esos 21 pasos): timeline + evidencia inline en `2026-09-00003`; alta mobile `2026-09-00006` cancelada después.

## Fuera de alcance de este corte

- Deploy nuevo, force-push, o borrar el índice / los tickets v2.
- App líder en mobile.
- Migrar tickets v1 a v2.

## Documentos

| Doc | Uso |
|-----|-----|
| [docs/workflow-v2.md](docs/workflow-v2.md) | Estados, historial, idempotencia, v1/v2 |
| [docs/mobile-deployment.md](docs/mobile-deployment.md) | Build, env, deploy JS, rollback mobile |
| [docs/rollback-procedure.md](docs/rollback-procedure.md) | Cómo revertir API sin tocar datos |
| [docs/contracts.md](docs/contracts.md) | Contrato canónico (gana el código si hay conflicto) |
| [docs/runbooks/historial-operation-id-unique.md](docs/runbooks/historial-operation-id-unique.md) | Índice unique (migrate explícito) |
