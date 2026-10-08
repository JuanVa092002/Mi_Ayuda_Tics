# Líder TIC — product strategy

Source: `docs/product/lider-tic/discovery.md` and the routes, state machine, and role docs it cites. No product code was changed. Items marked **INFERENCE** are not field measurements.

## First principles

**Para qué existe.** Para que una solicitud nueva deje de estar sin dueño. El líder es el único rol que puede pasar un caso de `nuevo` a `asignado` (`04-DOMAIN-MODEL.md`).

**Problema que elimina.** Una solicitud radicada por un funcionario que nadie ha tomado, y un técnico que aún no está autorizado a trabajar (`estado: false` hasta `aprobarTecnico`).

**Decisión que ayuda a tomar.** A qué técnico aprobado va este caso, si hay que cambiar de técnico, o si el caso no debe empezar (cancelar solo desde `nuevo` o `asignado`).

**Resultado que mejora.** El tiempo que un caso espera un técnico, y que el técnico que lo recibe esté habilitado. El cierre lo confirma el funcionario, no el líder.

**Qué no debe resolver.** Inventario de equipos, despacho en el móvil, escalar fuera del centro, elegir solo con un gráfico mensual, ni cerrar el caso en nombre del solicitante. El radar de proximidad es del técnico, no un auto-despacho.

## JTBD

| Job | When | I want | So I can | Class |
| --- | --- | --- | --- | --- |
| Despachar | When a request is `nuevo` | to give it to an approved technician | the field work can start | PRIMARY |
| Corregir el despacho | When the assignee is wrong or stuck | to reassign with a reason | the case keeps moving without losing history | PRIMARY |
| Frenar un caso inválido | When the request is duplicate or mistaken and work has not started | to cancel with a reason | a technician does not travel for nothing | SECONDARY |
| Habilitar gente | When someone registers as technician | to approve or deny them | only trusted people see the queue | SECONDARY |
| Mantener el catálogo | When a room or support type is wrong | to edit ambientes and tipos de caso | requesters file against real places and categories | SUPPORTING |
| Ver volumen | When I look at `/adminEstadisticas` | to see counts by room and month | I notice patterns later | SUPPORTING |

The first two are what the state machine treats as the leader’s daily mutations. Charts do not change a ticket.

## North star

**Median wait from `nuevo` to `asignado`, for cases that receive a technician.**

Why this and not the alternatives:

- The leader’s core action is `assign`. Time-to-resolution and “confirmed by requester” depend on the technician and the funcionario. Those are outcomes of the whole desk, not of this role.
- Monthly bars and pies (`AdminEstadisticas.tsx`) count volume. They do not say whether today’s queue is waiting.
- “Cases managed” is a vanity count: a cancel and a good assign both increment activity.
- Escalations to another organization do not exist, so “fewer escalations” cannot be the star.
- The product does not store an SLA target. The metric uses states that already exist (`nuevo`, `asignado`). Computing it may require timestamps already on the ticket; if `assignedAt` is missing, that is a measurement gap, not a reason to pick a chart.

Guardrail, not the star: share of assigns that are reassigned within the same day. A fast assign to the wrong person is not a win.

## Product loop

| Stage | What “good” means here | Today | Gap |
| --- | --- | --- | --- |
| OBSERVE | See unassigned work and who is allowed to take it | Cola `/adminSolicitud` and técnicos pendientes | Charts observe volume, not the queue age |
| UNDERSTAND | See room, sede, and current load before choosing | Drawer lists approved technicians | Proximity sort exists for the technician, not for this choice. **INFERENCE:** load may be shown; discovery did not re-verify the dirty UI |
| PRIORITIZE | Order the queue by operational urgency | List of pendientes | No SLA, no “stuck” sort for the leader |
| ACT | Assign, reassign, cancel, approve | Implemented and role-gated | Assign does not require a reason; reassign and cancel do |
| VERIFY | See the case leave `nuevo` and appear under the technician | Seguimiento and notifications on assign | Leader cannot see “technician started” as the success of the assign without opening seguimiento |
| LEARN | Change tomorrow’s dispatch using what happened | Monthly bar and pie | No loop from reassign reasons back to the queue |

The loop is strong at ACT. It is weak at PRIORITIZE, VERIFY, and LEARN.

## Feature hierarchy

| Feature | Class | Invest? |
| --- | --- | --- |
| Cola + assign | CORE | First |
| Reassign with reason | CORE | First, same workflow as assign |
| Cancel before start | CORE | Keep, do not expand past `start` |
| Approve / deny technician | ENABLER | Second: without it, assign has an empty roster |
| Seguimiento | ENABLER | Second: it is where reassign lives today |
| Ambientes, tipos de soporte | COMMODITY | Only when the catalog blocks filing |
| Estadísticas (2 charts) | COMMODITY | Do not lead the roadmap |
| Proximity radar | DIFFERENTIATOR for the technician | Do not clone it into a second product; a hint on assign is a later bet |
| Deprecated hard delete | DEBT | Decide unmount vs keep; do not build on it |
| `AdminCasos` named as historial in the feature map | DEBT | Fix the doc, not a new screen |
| Mobile leader | Out of scope by ADR-04 | Never as parity |

Investment order: dispatch quality, then technician gate and seguimiento as the place to correct a dispatch, then catalog only if filing breaks. Charts last.

## Strategic bets

1. **One desk.** The leader’s home stays the unassigned queue. Catalog and charts stay available and stop competing as equal jobs.
2. **Assignment is the decision.** The UI should answer “who can take this room” with data the case already has (ambiente, sede) and the approved roster. Do not auto-assign.
3. **The requester still closes.** Do not give the leader `confirm`.
4. **Web only.** ADR-04 stands until the job itself changes.

## AI opportunities

| Use | Class | Why |
| --- | --- | --- |
| Chatbot “líder virtual” | AI unnecessary | The job is a state change with a person accountable |
| Summarize the monthly chart | AI unnecessary | The chart is already a summary and it is not the decision |
| Classify `tipoCaso` from free text | AI useful for the requester’s form, not the leader’s desk | The leader does not type the symptom |
| Rank approved technicians for this ambiente/sede using rules already in `sortTicketsByProximityRadar` plus open-case count | AI unnecessary if rules suffice; a model is not required | High leverage as a **deterministic hint**, not as an agent |
| Cluster reassign reasons | AI useful later | Only after reasons are consistently stored and someone reads them |
| Anomaly on queue age | AI unnecessary at current scale | A sort by wait time is enough until volume proves otherwise |

No RAG and no agent for this role. The ledger is the system of record.

## Roadmap by outcome

**NOW — a new case gets a technician without hunting.**

- Treat `/adminSolicitud` as the primary job in any UI pass.
- Show, next to assign, the technician’s open load and the case’s ambiente/sede if those fields are already on the payload. No new domain.
- Correct `03-FEATURE-MAP.md` so historial is `/seguimiento` and `/adminCasos` is case types.
- Confirm whether deprecated `DELETE /api/solicitud/:id` is still mounted. Unmount only with an explicit decision.

**NEXT — a bad assign is visible the same day.**

- A “needs a look” list: `asignado` not started, `en_progreso` reassigned, `esperando_usuario`. Same states, no new lifecycle.
- Surface reassign reason on that list so the next assign is informed.
- Record `aprobadoPor` only if approval disputes become real. It is a schema change; not now.

**LATER — the desk learns from the building.**

- Optional hint that reuses the technician proximity tiers. The leader still confirms.
- Replace or demote the two charts if the queue-age number exists. Do not add a third chart in the meantime.

**NEVER (unless the job statement above is revised).**

- Inventory.
- Leader on mobile.
- Leader confirms or reopens the solution.
- Auto-assign without a person.
- An AI layer that files, assigns, or closes tickets.
- SLA targets copied from ITIL with no clock in the data.

## Success metrics

| Metric | Role | Definition |
| --- | --- | --- |
| Median `nuevo` → `asignado` | North star | Cases that get a technician |
| Cases still `nuevo` at end of day | Guardrail of the queue | Count, not a chart color |
| Reassign within 24h of assign | Guardrail of quality | High means fast wrong assigns |
| Cancels after a technician was assigned | Watch | Should stay rare; cancel is allowed in `asignado` |
| Time to `cerrado` | System metric, not this role’s star | Includes technician and requester |

Do not use page views, chart opens, or “tickets touched” as success.

## Anti-goals

- A dashboard that looks like a SOC and does not name the next assign.
- More nav items for the leader.
- Duplicating the technician radar as a second sorting product.
- Letting the leader override the requester’s confirm.
- Shipping an assistant before the queue shows wait and load.
- Treating `09-ROLES-UX.md` bento copy as truth while `AdminSolicitud.tsx` has uncommitted edits. Re-read that file before any UI bet.

## Principles

1. The leader dispatches. The technician executes. The requester accepts.
2. A reason is required when undoing a dispatch (reassign, cancel). Keep that.
3. Web is the console. Mobile is the field.
4. Prefer a sort and a count over a model.
5. Do not add a module the state machine cannot name.
