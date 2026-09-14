# Rollback — workflow v2 (API)

Cómo volver el **código** de Render al SHA anterior a v2 **sin borrar datos**.  
**No ejecutar esto como parte del cierre de release.** No hay deploy nuevo aquí: solo el procedimiento.

## Quick path

1. Confirmar que el incidente no se arregla con un forward-fix.
2. En Render, rollback del web service al deploy del SHA de abajo (no `git push --force` a `master`).
3. Verificar `GET https://miayudatics-v1-0.onrender.com/api/health` → 200.
4. **Dejar** el índice unique. **No** DELETE de tickets ni de `historialsolicituds`.
5. Avisar: los tickets ya creados en v2 quedan con estados v2; el API viejo no los opera bien.

## SHA

| Rol | Git SHA | Notas |
|-----|---------|--------|
| Live v2 (historical git tag of the feature, **not verified as Render live**) | `48a67f8f2686e186e79c6e867142eb99630ed35c` | `feat(tickets): workflow v2 historial, idempotencia y solución`. Do not treat this SHA as production without a Render revision check. |
| Rollback | `050922c2e39453db034d237a365ba97c898f1938` | Último prod **antes** de v2. Verificado with `git log` as a git object, not as current Render. |

El valor `050922c2e3453…` **no existe** en el repo. Usar `e39453`, no `e3453`.

Render auto-deploya `master`. Un rollback **solo en el dashboard** se pierde en el próximo push a `master`. Para que el rollback aguante: no pushear v2 de nuevo, o revertir el commit en git con un revert explícito (pedido aparte).

## Pasos para revertir (Render)

1. Abrir el servicio API (`miayudatics-v1-0` / deploy id conocido `dep-daf4anrm8hqs73dj7d40`).
2. Manual Deploy / Rollback → seleccionar el deploy construido desde `050922c2e39453db034d237a365ba97c898f1938`.
3. Esperar el deploy. Bind sigue siendo `0.0.0.0:$PORT`.
4. `GET /api/health` 200. No exigir `assertWorkflowV2RuntimeReady`: ese código no está en el SHA viejo.
5. Probar un ticket **v1** (estados `solicitado` / `asignado` / `pendiente` / `finalizado`).
6. No probar mutaciones v2 (`iniciarAtencion`, `solucionParcial`, `confirmarSolucion`, …): no existen o no aplican en ese SHA.

No usar `git push --force` a `master` salvo instrucción explícita. No `--no-verify`.

## Qué hacer con el índice

Índice ya creado en Atlas, DB `miayudatics`, colección `historialsolicituds`:

| Campo | Valor |
|-------|--------|
| name | `uniq_historial_solicitud_operationId` |
| key | `{ solicitud: 1, operationId: 1 }` |
| unique | true |
| sparse | true |

**Dejarlo.** El API v1 no lo usa. Es sparse: documentos sin `operationId` no chocan. Tirarlo obliga a volver a correr `migrate:historial-operation-id:remote` (con flags de aprobación) antes de reactivar v2.

No `autoIndex`. No recrear el índice “por si acaso” en el rollback.

## Qué hacer con los datos

**No borrar. No reescribir estados. No DELETE.**

Ya hay documentos v2 en producción, entre otros:

| Código | Estado al cierre E2E |
|--------|----------------------|
| `2026-09-00003` | `cerrado` |
| `2026-09-00004` | `cerrado` |
| `2026-09-00005` | `cancelado` |
| `2026-09-00006` | cancelado en validación mobile |

Tras rollback de código:

| Dato | Acción |
|------|--------|
| `HistorialSolicitud` | Se queda. Es append-only; no hay “undo” de eventos |
| `workflowVersion: 2` y estados `nuevo`, `en_progreso`, `resuelto`, `cerrado`, `cancelado` | Se quedan. El API v1 no los entiende como máquina v2: tratarlos como congelados hasta reponer v2 |
| Tickets v1 (`solicitado`…`finalizado`) | Siguen el flujo `SolucionCaso` |
| Fotos Cloudinary / `storages` | Se quedan |

No inventar `SolucionCaso` para tickets v2. No pasar `cerrado` a `finalizado` a mano.

## Efecto en clientes

| Cliente | Tras rollback de API |
|---------|----------------------|
| Web v2 | Acciones v2 fallan. UI de tickets v2 incompleta |
| Mobile (Metro o APK) | Igual: detalle puede pintar historial si el JS nuevo sigue, pero mutar v2 no |
| Tickets v1 en ambos | Camino viejo |

Rollback de **solo JS mobile**: [mobile-deployment.md](./mobile-deployment.md). No desinstalar la APK para “deshacer” el workflow.

## Checklist

- [ ] SHA de rollback es `050922c2e39453db034d237a365ba97c898f1938`
- [ ] Render rollback / pin de ese deploy, no force-push
- [ ] Health 200
- [ ] Índice unique **sigue** en Atlas
- [ ] Ningún DELETE de `solicituds` / `historialsolicituds`
- [ ] Equipo avisado: tickets v2 quedan congelados

## Siguiente

Reactivar v2 = volver a `48a67f8f2686e186e79c6e867142eb99630ed35c` (o un commit posterior) **con el índice aún puesto**. Ver [workflow-v2.md](./workflow-v2.md) y [RELEASE_NOTES.md](../RELEASE_NOTES.md).
