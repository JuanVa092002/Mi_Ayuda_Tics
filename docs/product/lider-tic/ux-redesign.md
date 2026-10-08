# Líder TIC — UX redesign

Conceptual only. No product code was changed.

Sources: `discovery.md`, `product-strategy.md`, `LeaderNav` / `RoleNavigation`, `AppShell`, `Workspace` (`CommandBar`, `SplitWorkspace`, `Pane`, `Metric`), `StatusBadge`, `EmptyState`, `ErrorState`, `SlideOverDrawer`, `AdaptiveSkeleton`, `Button`.

The north star stays median wait from `nuevo` to `asignado`. This document does not add inventory, a mobile app, auto-assign, or leader confirm.

## Current IA

Primary nav, six peers (`RoleNavigation.tsx` and a duplicate list in `features/users/components/LeaderNav.tsx`):

1. Cola de nuevos `/adminSolicitud` — assign and cancel
2. Seguimiento `/seguimiento` — history table, reassign, cancel
3. Técnicos
4. Estadísticas — pie and bar
5. Ambientes
6. Tipo de soporte `/adminCasos`

There is no alerts destination, no settings destination, and no separate “sites” product. Sedes live on ambientes. Reports are the two charts.

## Target IA

**Primary (the job)**

- **Despacho** — today’s unassigned queue. Default landing. Replaces “Cola de nuevos” as the name of the home, same route until a later rename.
- **En curso** — cases already assigned that may need a look: not started, reassigned, waiting on the requester. This is seguimiento filtered to action, not a second archive.

**Secondary (the bench)**

- Técnicos (aprobación primero, activos después)
- Catálogo: Ambientes and Tipo de soporte, grouped, not two top-level jobs
- Volumen: the existing two charts, labeled as history, not as the desk

**Not in the nav**

- Alerts as a product. The queue age is the alert.
- Settings. None exist for this role.
- SLA administration. No clock target is stored. Show age in state, do not invent a policy screen.
- Escalation to another center. Reassign is the only escalation.

**Case detail** is a pane or `SlideOverDrawer`, not a new route. Assignment happens there. History of that case is inside the pane, not a third page.

## First 10 seconds

| Band | Content | Not this |
| --- | --- | --- |
| NOW | Count of `nuevo`, oldest wait | A pie |
| ATTENTION | Count of assigned-not-started and waiting-on-requester | Monthly bar |
| TREND | One line: median wait today vs yesterday, only if the timestamps exist | A chart grid |
| ACTION | The first unassigned case, selected, with Assign | A catalog form |
| CONTEXT | Ambiente, sede, symptom, approved technicians and their open counts | A biography of the requester |

`Metric` and `CommandBar` already express NOW and ATTENTION. `SplitWorkspace` expresses ACTION + CONTEXT. Do not put `AdminEstadisticas` charts on this screen.

## Case management

List columns, in order: age in current state, code, status (`StatusBadge`), ambiente · sede, one-line description. Technician only after assign.

Filters that change a decision: sin asignar, asignado sin iniciar, esperando funcionario. A free-text search may stay (`SearchField`). Do not add priority labels the domain does not have.

Assignment: one control, approved technicians only, each row shows open-case count and whether the sede matches. The leader confirms. No auto-assign. Cancel stays a second action with a required reason, disabled with an explanation when the state is past `asignado`.

Reassign stays on En curso, same drawer, reason required.

History: timeline of `HistorialSolicitud` for the open case. The wide all-cases table remains available as “archivo”, not the default.

## User flows

**Dispatch.** Land on Despacho → skeleton list → select the oldest `nuevo` → see room and roster → assign → toast and the row leaves the queue → empty state if none remain.

**Correct.** Open En curso → case in `en_progreso` or `esperando_usuario` → reassign with reason → state follows the existing machine (`en_progreso` returns to `asignado`; waiting stays waiting).

**Stop.** From Despacho, cancel only if `nuevo` or `asignado`, reason required, confirm by typing is unnecessary if the reason field is empty-blocked.

**Gate.** Técnicos shows inactive accounts first. Approve and deny stay explicit. Deny explains that the person cannot open the field queue.

## Defensive UX

| Workflow | Prevent | Detect | Explain | Recover |
| --- | --- | --- | --- | --- |
| Assign | Only approved technicians; disable while the request is in flight | 409 or state conflict if someone else assigned | Name the current state and the assignee | Reload the case; do not send a second assign blindly |
| Reassign | Reason required; show previous technician | Same conflict | “El caso volvió a asignado” or “sigue esperando al funcionario” per the machine | Keep the typed reason if the request fails |
| Cancel | Hide or disable after `start` | Server rejection if the UI is stale | “El técnico ya inició; no se puede cancelar” | Return to En curso |
| Approve technician | Do not offer approve on an already active account | Error toast from API | What `estado` will become | Retry |
| Stale queue | — | Poll or the existing notification stream is optional | Show “actualizado hace N s” | Reintentar, already on the queue error state |

## States

| State | Behavior |
| --- | --- |
| Loading | `AdaptiveSkeletonList` and `AdaptiveSkeletonDetail`. No layout jump. |
| Empty queue | `EmptyState`: no unassigned work. Do not show charts instead. |
| Error | `ErrorState` with Reintentar. Keep the last good list if a silent refresh fails; mark it stale. |
| Offline | Banner: actions disabled, data marked stale. Do not pretend the assign succeeded. |
| Permission denied | 401/403: leave the leader shell only if the session is gone. A 403 on one mutation stays on the case with the message. |
| Stale | Timestamp of last successful fetch. Assign disabled until refresh if the case revision changed. |
| Partial | Queue visible, technician roster failed: assign disabled, roster error inline, queue still readable. |
| Success | Short confirmation: code, technician name, new state. |
| Conflict | Another leader assigned or the technician started. Show the server state. Do not overwrite. |

## Responsive

The Expo app stays blocked (`lider-not-supported`, ADR-04). Away-from-desk means the **web** shell.

- Desktop: `SplitWorkspace`, queue left, case right.
- Tablet: same split if width allows; otherwise list, then drawer.
- Phone browser: Despacho and En curso only. Catalog and charts behind a “Más” control. Assign still fits in `SlideOverDrawer`. Do not build a second mobile information architecture.

## Accessibility

- One `h1`: Despacho de solicitudes (the shell already uses a single title pattern).
- Nav `aria-label` already exists (“Navegación líder”). Keep one nav, not two components announcing the same list.
- `StatusBadge` text must not rely on color. The label is the state name.
- Assign, reassign, and cancel are real buttons, keyboard reachable, visible focus. Destructive cancel is not the first control in tab order.
- Errors sit on the field (`motivo` vacío) and in a region announced on submit failure.
- Drawer traps focus while open and returns focus to the row that opened it.
- Respect `prefers-reduced-motion`. Do not use motion as the only sign of success.
- Contrast: keep `#04324d` on white for text actions and `#102c3b` body ink already used on the web shell. Do not introduce a new palette.

## Design system reuse

Use these. Do not add a parallel kit.

| Need | Use |
| --- | --- |
| Page chrome | `AppShell`, `WorkCanvas`, `PageHeader` |
| Queue + detail | `SplitWorkspace`, `Pane` |
| Counts | `Metric` inside `CommandBar` |
| Status | `StatusBadge` |
| Empty / error | `EmptyState`, `ErrorState` |
| Assign / reassign | `SlideOverDrawer` |
| Actions | `Button` |
| Loading | `AdaptiveSkeleton*` |
| Search | `SearchField` |

**Inconsistencies to stop spreading**

- Two leader nav sources: `RoleNavigation.tsx` and `LeaderNav.tsx`.
- Three metric widgets: `Metric`, `KpiCard`, `LeaderKpiCard`.
- `Button`, `PrimaryButton`, and `SecondaryButton` side by side.
- `AdminCasos` filename versus “Tipo de soporte”.
- Seguimiento as a raw table while Despacho uses the workspace split.

New leader screens should import from `shared/ui`. They should not add `Leader*` duplicates.

## Interaction principles

1. The oldest unassigned case is the default selection.
2. One primary button per pane: Asignar. Cancel is secondary.
3. A reason blocks the action when the domain requires it. The button stays disabled until the reason exists.
4. Optimistic removal from the queue only after the server accepts. On failure, the row returns.
5. Charts never replace an empty queue.

## Screen hierarchy

1. Despacho (home)
2. En curso (actionable seguimiento)
3. Case pane (same component for assign and reassign)
4. Técnicos, inactive first
5. Catálogo (ambientes, tipos)
6. Volumen (existing charts)

## Component strategy

No new visual library. One `LeaderCasePane` concept can wrap `SlideOverDrawer` plus the existing assign form. It is a composition, specified here, not built in this pass. Lists use the same row pattern as the queue so En curso does not invent a table language.

## UX priorities

1. Home is the unassigned queue with age, not the chart page.
2. Collapse catalog under one secondary group.
3. Delete the duplicate nav component when implementation starts (use `RoleNavigation` only).
4. Conflict and stale states on assign, because two leaders can open the same queue.
5. Phone web: queue and assign only.
6. Leave charts and mobile-app parity untouched.

## Out of scope

Pixel polish unrelated to dispatch, a new SLA product, AI ranking, and any change to funcionario or técnico flows except reading their states in the leader pane.
