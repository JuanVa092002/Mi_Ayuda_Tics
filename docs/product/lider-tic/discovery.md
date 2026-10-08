# Líder TIC — discovery

Date: 2026-10-07. No product code was changed.

Labels: **EVIDENCE** = file, route, or test in this repo. **INFERENCE** = a reading of that evidence, not a field observation of a SENA leader.

## 1. Executive summary

Líder TIC is a web-only dispatch and catalog role (`rol: 'lider'`). The job encoded in the product is: see new requests, assign or reassign a technician, cancel a request that has not started, approve technicians, and maintain rooms and case types. Statistics are two charts. There is no inventory module, no SLA engine, and no recommendation of which technician to send.

The differentiating loop is the ticket state machine: the leader assigns; the technician works; the requester confirms. The leader does not close the case. Mobile blocks this role on purpose.

## 2. Current product definition

**EVIDENCE.** `docs/system-overview/09-ROLES-UX.md` names the objective as triage, assignment, and supervision of technology infrastructure. The home route is `/adminSolicitud` (`AdminSolicitud.tsx`), behind `RequireRole roles={['lider']}` in `client/src/app/router/Allroutes.tsx`.

Navigation in `LeaderNav.tsx`:

| Label | Route |
| --- | --- |
| Cola de nuevos | `/adminSolicitud` |
| Seguimiento | `/seguimiento` |
| Técnicos | `/adminTecnicos`, `/tecnicosActivos`, `/tecnicosInactivos` |
| Estadísticas | `/adminEstadisticas` |
| Ambientes | `/adminAmbientes` |
| Tipo de soporte | `/adminCasos` |

**Doc drift (EVIDENCE).** `docs/system-overview/03-FEATURE-MAP.md` says historial is `AdminCasos.tsx` and `SeguimientoSolicitud.tsx`. The router puts historial on `/seguimiento` and case types on `/adminCasos`. The nav matches the router.

## 3. Users

**EVIDENCE.** The account role is the string `lider`. Seed script: `server/src/scripts/seed-lider.ts` (mentioned in `README.md`). Mobile `guards.ts` sends `lider` to `/(auth)/lider-not-supported`. ADR-04 in `docs/system-overview/15-ARCHITECTURAL-DECISIONS.md` says the mobile block is intentional because the leader UI is dense.

**INFERENCE.** The person is the TIC coordinator of a SENA training center who dispatches field technicians. The repo does not contain an interview or a job description beyond the role docs.

| Need | Evidence |
| --- | --- |
| See unassigned requests | `GET /api/solicitud/pendientes`, leader only |
| Assign a technician | `PUT /api/solicitud/:id/asignarTecnico` |
| Move a stuck case | `PUT .../reasignarTecnico` with a reason |
| Cancel before work starts | `POST .../cancelar` from `nuevo` or `asignado` only |
| Let a technician into the system | `PUT /api/tecnicos/:id/aprobarTecnico` |
| Keep rooms and categories | ambiente and tipoCaso CRUD |

Critical and frequent, from the state machine: assign. Exceptional: cancel, deny a technician. Confirming a fix is the requester’s action, not the leader’s (`docs/system-overview/04-DOMAIN-MODEL.md`).

## 4. Jobs to be done

**EVIDENCE of the job the software implements**

1. Turn a new request into an assigned technician.
2. Change technician when the case is assigned, in progress, or waiting on the requester.
3. Cancel a duplicate or invalid request before the technician starts.
4. Approve or deny a technician account (`estado: false` until approval).
5. Maintain formation rooms and support categories used when a requester files a ticket.
6. Look at volume by room and by month.

**INFERENCE, not implemented as a job**

- Choose the nearest free technician (the proximity radar sorts the technician queue, not the leader inbox).
- Hit a response-time target.
- Escalate outside the center.
- Manage equipment inventory.

## 5. Workflows

### Dispatch

ENTRADA: requester files `POST /api/solicitud` (leader receives 403 on that route).  
CONTEXTO: `/adminSolicitud` loads pendientes and approved technicians.  
DECISIÓN: which technician.  
ACCIÓN: assign.  
RESULTADO: state `asignado`, event `assigned`, notify technician and requester.  
SEGUIMIENTO: `/seguimiento` lists the wider history and can reassign or cancel.

Empty: copy in `AdminSolicitud.tsx` — “No hay requerimientos pendientes de asignación.”  
Error: `fetchError` with Reintentar.  
Cancel without a reason: toast “Debes indicar un motivo de cancelación.”  
Permission: other roles get 403 on pendientes, assign, reassign, cancel (`10-SECURITY-MODEL.md`).

### Reassign and cancel

Reassign requires a reason. From `en_progreso` the case returns to `asignado`. From `esperando_usuario` the state stays waiting. Cancel is refused after `start`. **EVIDENCE:** domain table in `04-DOMAIN-MODEL.md` and `canTransitionSolicitud` tests in `solicitud-lifecycle.test.ts`.

### Technician gate

New technicians register inactive. Leader approves (`TecnicosInactivos.tsx`) or denies. Until approval, `accountStatus` returns 403. **EVIDENCE:** `10-SECURITY-MODEL.md`, feature map row “Aprobar / Denegar Técnico”. Roadmap notes `aprobadoPor` / `aprobadoAt` are not stored yet (`14-ROADMAP.md`).

### Catalogs

Ambientes: create and update. Tipo de caso: create, update, delete if no tickets (409 otherwise). **EVIDENCE:** feature map and security table.

### Charts

`AdminEstadisticas.tsx` loads two series and draws a pie (by ambiente) and a bar (by month). Endpoints: `GET /api/graficaSolicitudesPorAmbiente`, `GET /api/graficaSolicitudesPorMes` (`07-BACKEND-MAP.md`). No action is attached to a bar.

### Not present

Inventory, paging/escalation to another center, SLA clocks, leader actions on mobile, leader confirmation of the technical fix.

Hard delete `DELETE /api/solicitud/:id` is marked **DEPRECATED** in `07-BACKEND-MAP.md`.

## 6. Capability map

| Capability | Existe | Dónde | Usuario | Valor | Calidad | Problema | Clase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cola de nuevos | Sí | `/adminSolicitud` | líder | Alto | Operativa, con vacío y error | Doc de feature map mezcla esta vista con historial | CORE |
| Asignar | Sí | Drawer + `asignarTecnico` | líder | Alto | Motivo no exigido en assign; sí en reassign | El líder elige sin ranking | CORE |
| Reasignar | Sí | Seguimiento | líder | Alto | Motivo obligatorio | Vuelve `en_progreso` a `asignado` | CORE |
| Cancelar antes de iniciar | Sí | Cola y seguimiento | líder | Alto | Bloqueado tras `start` | — | CORE |
| Aprobar técnico | Sí | Técnicos inactivos | líder | Alto | Email de bienvenida documentado | Sin `aprobadoPor` | CORE |
| Denegar técnico | Sí | Misma zona | líder | Alto | — | Efecto exacto “elimina o inhabilita” está en el mapa de backend, no re-leído en el handler en este pase | CORE |
| Ambientes | Sí | `/adminAmbientes` | líder | Medio | CRUD | No es el despacho | SUPPORTING |
| Tipos de soporte | Sí | `/adminCasos` | líder | Medio | Delete protegido | Nombre de archivo sugiere “casos” | SUPPORTING |
| Seguimiento / historial | Sí | `/seguimiento` | líder | Alto | Tabla ancha | Densidad y scroll horizontal ya notados en auditorías UX | CORE |
| Estadísticas | Sí | `/adminEstadisticas` | líder | Bajo para decidir hoy | Dos gráficos | No cambian la cola | DATA DISPLAY |
| Radar de proximidad | Sí, en cola del técnico | `sortTicketsByProximityRadar` | técnico | Alto para campo | Testeado | El líder no lo usa para asignar | SUPPORTING de otro rol |
| Inventario | No | — | — | — | — | La palabra no nombra un módulo | AUSENTE |
| Escalamiento externo | No | — | — | — | — | Reassign es el único “escalar” | AUSENTE |
| Móvil líder | Bloqueado | `lider-not-supported` | líder | — | Intencional | — | DECISIÓN |
| Hard delete de solicitud | Deprecated | `DELETE /api/solicitud/:id` | líder | Riesgo | Marcado deprecated | Sigue en el mapa | DEBT |
| Métricas “en atención / resueltos hoy” | Documentadas | `09-ROLES-UX.md` | líder | — | La cola actual muestra “Por despachar” y técnicos | El doc de bento puede estar por delante o por detrás de la UI sucia | UNKNOWN |

Calidad de la tabla de seguridad: **EVIDENCE** de `10-SECURITY-MODEL.md`, clasificado allí como verificado contra middleware y tests. Este discovery no re-ejecutó esos tests.

## 7. UX findings

**EVIDENCE**

- Six destinations. Dispatch is first. Charts and catalogs are peers of the queue, so catalog work competes with triage in the same nav.
- Assign and cancel live on the queue. Reassign lives on seguimiento. Two places for “quién atiende”.
- Empty and retry exist on the queue (`AdminSolicitud.tsx`).
- Seguimiento is a full-width table (`SeguimientoSolicitud.tsx`).
- Estadísticas has a title and two charts, no empty-decision state in the lines inspected.
- Mobile tells the leader to use the web app.

**INFERENCE**

- A leader who only dispatches still sees Ambientes, Tipo de soporte, and Estadísticas at the same weight as the queue.
- Charts do not answer “a quién asigno ahora”.
- “Tipo de soporte” vs file `AdminCasos.tsx` vs feature-map “Historial General” will confuse the next editor.

## 8. Product findings

The leader **acts** on assign, reassign, cancel, and technician approval. The leader **observes** charts and the history table. The system does not **recommend** a technician or a priority beyond what the pendientes list returns. Understanding of proximity exists in the technician domain, not in the leader assignment drawer.

Closing the loop (confirm or reopen) is the requester’s job. The leader cannot mark a case finished. That is a product boundary, not a missing button, unless a later decision says the desk must override the requester.

## 9. Technical findings

| Item | Class | Note |
| --- | --- | --- |
| State machine and role checks in `solicitud-lifecycle.ts` | P1 strength | Transitions are explicit and tested |
| Deprecated hard delete still listed | P1 | Destructive path should not remain callable without a product decision; not verified live in this pass |
| Feature map points historial at `AdminCasos` | P2 | Docs disagree with the router |
| `aprobadoPor` not stored | P2 | Roadmap item; approval is not attributable |
| Leader UI split across `pages/admin/*` and `features/tickets` | P2 | `LeaderTicketDrawer` is shared; pages are large (`AdminSolicitud.tsx` past line 1100) |
| Charts are aggregations, not ticket mutations | P3 | Low coupling to dispatch |
| N+1 | UNKNOWN | Not measured in this pass |

## 10. Security and risk

**EVIDENCE.** Leader-only mutations are gated with `checkRol(['lider'])` in the security table. Technician mutations also check assignment. Requester mutations check ownership. Cancel and reassign reasons go through `sanitizePublicMotivo`. JWT cookie on web is httpOnly. Leader sessions on mobile are wiped to the blocked screen.

**Risk.** A deprecated delete endpoint, if still mounted, is a larger blast radius than a chart. This pass did not open the route file to prove it is unmounted. Treat that as UNKNOWN until a later read of the router.

Cancel after `start` is forbidden. That protects work in progress.

## 11. Information architecture

```text
Líder (web)
├── Cola de nuevos     dispatch: assign, cancel
├── Seguimiento        all cases: reassign, cancel, history
├── Técnicos           pending approval / active
├── Estadísticas       pie by room, bar by month
├── Ambientes          catalog
└── Tipo de soporte    catalog
```

Field technician and requester are other apps surfaces. The leader does not share their routes (`RequireRole`).

## 12. Strengths

- One role, one web shell, mobile explicitly out.
- Assign / reassign / cancel match a written state machine.
- Approval gate before a technician can work.
- Reasons required for reassign and cancel.
- History events distinguish `MESA_TIC` from technician and requester.

## 13. Weaknesses

- Dispatch and catalog have the same nav weight.
- Statistics do not change a decision.
- Assignment does not use the proximity function the technician queue already has.
- No inventory, no SLA, no external escalation.
- Docs and filenames disagree about `AdminCasos`.
- Approval is not attributed to a leader id.

## 14. Opportunities

These are gaps, not a build list.

1. Make the queue the only primary task; tuck catalogs.
2. Show technician load and room/sede next to the assign control, using data the assign API already needs.
3. Point “stuck” cases (waiting, in progress too long) at seguimiento instead of a monthly bar chart.
4. Align the feature map with `/seguimiento` vs `/adminCasos`.
5. Decide whether deprecated delete stays mounted.

## 15. Unknowns

- Whether the live UI still matches `09-ROLES-UX.md` bento metrics. The working tree has uncommitted edits to `AdminSolicitud.tsx`.
- Whether `DELETE /api/solicitud/:id` is still registered.
- Exact deny-technician persistence (delete row vs flag).
- Real volume, how many leaders, and whether they use charts. Not in the repo.
- Performance of pendientes and historial queries.

## 16. Evidence map

| Claim | Source |
| --- | --- |
| Routes and role gate | `client/src/app/router/Allroutes.tsx` |
| Nav labels | `client/src/features/users/components/LeaderNav.tsx` |
| Role objective | `docs/system-overview/09-ROLES-UX.md` |
| RBAC table | `docs/system-overview/10-SECURITY-MODEL.md` |
| State machine | `docs/system-overview/04-DOMAIN-MODEL.md` |
| Feature rows | `docs/system-overview/03-FEATURE-MAP.md` |
| Charts | `client/src/pages/admin/AdminEstadisticas.tsx`, `07-BACKEND-MAP.md` |
| Reassign on seguimiento | `client/src/pages/admin/solicitud/SeguimientoSolicitud.tsx` |
| Mobile block | `mobile/src/features/auth/guards.ts`, ADR-04 |
| Assign tests | `server/src/tests/solicitud-lifecycle.test.ts` |

## 17. Recommended priority

1. Trust the router over the feature-map row for `AdminCasos` when writing the next spec.
2. Treat assign / reassign / cancel / approve as the product. Treat charts as secondary.
3. Do not add inventory or mobile leader UI until a job in this document is wrong.
4. Before any leader UI change, re-read the uncommitted `AdminSolicitud.tsx`. This document describes the routed capabilities, not a pixel audit of the dirty tree.
