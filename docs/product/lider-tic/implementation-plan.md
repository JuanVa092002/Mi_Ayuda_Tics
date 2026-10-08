# Líder TIC — implementation plan

For an implementer. Do not rediscover the product. Read `discovery.md`, `product-strategy.md`, and `ux-redesign.md` first.

This plan does **not** change auth, RBAC, the state machine, Mongo schemas, or `@miayuda/contracts`. The leader already has the mutations. The work is presentation and navigation on top of existing calls.

## Reuse

| Need | Use | Do not create |
| --- | --- | --- |
| Shell and nav | `AppShell` + `RoleNavigation` / `LEADER_NAV_ITEMS` | A third nav |
| Queue layout | `WorkCanvas`, `CommandBar`, `Metric`, `SplitWorkspace`, `Pane` | A new dashboard kit |
| Status | `StatusBadge` | Color-only pills |
| Empty / error | `EmptyState`, `ErrorState` | Ad hoc paragraphs |
| Assign / reassign UI | `SlideOverDrawer`, `LeaderTicketDrawer` if it already wraps assign | A new modal system |
| Loading | `AdaptiveSkeletonList`, `AdaptiveSkeletonDetail` | Spinners that shift layout |
| Buttons | `Button` | New `PrimaryButton` usages |
| Pendientes | `getSolicitudesPendientes` in `client/src/features/tickets/api/solicitud.service.ts` | A new list endpoint |
| Assign | `asignarSolicitudTecnico` → `PUT /api/solicitud/:id/asignarTecnico` | A body field beyond `tecnico` and optional `operationId` (`asignarTecnicoBodySchema`) |
| Reassign / cancel | `reasignarTecnico`, `cancelarSolicitud` in `workflow.service.ts` | Weaker reason rules. Server already requires motivo (`reasignarTecnicoBodySchema`, min 3) |
| All-cases list | `historialSolicitudesLider` | A new “en curso” API. Filter on the client |
| Transitions | `canTransitionSolicitud` / `solicitud-lifecycle.ts` | New states |
| Tests already guarding dispatch | `role-workspaces.test.tsx`, `server/src/tests/solicitud-lifecycle.test.ts`, `server/src/tests/integration/workflow-v2.test.ts` | A parallel suite |

`LeaderNav.tsx` duplicates `LEADER_NAV_ITEMS` and is only imported by `LeaderNav.test.tsx` and re-exported from `features/users/index.ts`. `AppShell` already renders `RoleNavigation`. Prefer the shell nav.

`createdAt` for age: use it only if `getSolicitudesPendientes` already returns it. Do not add `assignedAt` or an SLA field in this pass.

## Boundaries

| Layer | Boundary |
| --- | --- |
| Frontend | `pages/admin/*`, `RoleNavigation`, leader tests. May sort and filter arrays. May not invent states. |
| Backend | No route or controller edits in the first slice. `getSolicitudesPendientes`, `asignarTecnicoSolicitud`, `reasignarTecnicoSolicitud` stay as they are. |
| Contracts | No publish. If a DTO lacks `createdAt` or sede, stop and report. Do not widen the contract silently. |
| Data | No migration. |
| Validation | Zod schemas in `server/src/features/tickets/validators/solicitud-workflow.ts` stay. Client must keep sending `tecnico` and, for reassign/cancel, `motivo`. |
| Auth | `authMiddleware` + `checkRol(['lider'])` on `server/src/features/tickets/routes/solicitud.ts`. Do not touch `session.ts`. |

## Change map

### Slice A — navigation (LOW)

| File | Symbol | Reason | Dependency | Risk | Test |
| --- | --- | --- | --- | --- | --- |
| `client/src/shared/ui/RoleNavigation.tsx` | `LEADER_NAV_ITEMS` | Rename visible label of `/adminSolicitud` to “Despacho”. Add “En curso” as the label for `/seguimiento` or keep “Seguimiento” if copy must stay stable for tests. Group catálogo by order: técnicos, then ambientes, tipo de soporte, estadísticas last. | `AppShell` | LOW | `app-shell-navigation.test.tsx` if it asserts labels |
| `client/src/features/users/components/LeaderNav.tsx` | `LEADER_NAV_ITEMS` | Keep in lockstep or stop exporting it | `LeaderNav.test.tsx` | LOW | Update assertions to the same labels |
| `docs/system-overview/03-FEATURE-MAP.md` | Historial row | Point historial at `SeguimientoSolicitud.tsx` only; `/adminCasos` is tipo de caso | None | LOW | None |

Do not add routes. `/seguimiento` remains the en-curso URL.

### Slice B — despacho (MEDIUM, UI only)

| File | Symbol | Reason | Dependency | Risk | Test |
| --- | --- | --- | --- | --- | --- |
| `client/src/pages/admin/AdminSolicitud.tsx` | `fetchSolicitudes` | Sort pendientes oldest-first when `createdAt` exists. Select that row by default. | `getSolicitudesPendientes` | MEDIUM: this file is large and already dirty in the working tree. Read it before editing. | `role-workspaces.test.tsx` |
| same | `CommandBar` / `Metric` | NOW = count of unassigned. ATTENTION = do not fake “en atención” if this response is only pendientes. If the payload is only `nuevo`, show that count and oldest age. Do not call the chart APIs here. | Existing metrics | MEDIUM | Component test for empty and error already expected (“No hay requerimientos…”, Reintentar) |
| same | assign handler | On non-2xx, keep the row and show the server message. Do not optimistic-remove before success. | `asignarSolicitudTecnico` | MEDIUM | A unit or RTL test that a failed assign leaves the item |
| same | cancel | Keep motivo required. Disable when the selected state is not `nuevo` or `asignado`. | `cancelarSolicitud` | MEDIUM | Existing cancel copy |

### Slice C — en curso (MEDIUM, UI only)

| File | Symbol | Reason | Dependency | Risk | Test |
| --- | --- | --- | --- | --- | --- |
| `client/src/pages/admin/solicitud/SeguimientoSolicitud.tsx` | `historialSolicitudesLider` | Default filter: `asignado`, `en_progreso`, `esperando_usuario`. Offer “Archivo” for the rest. Same reassign and cancel handlers. | No new endpoint | MEDIUM: wide table. Do not rewrite the table into a new grid in the same change. Add the filter first. | `role-workspaces.test.tsx` if it looks for seguimiento headings |

### Slice D — duplicate nav cleanup (LOW, after A)

| File | Symbol | Reason | Risk | Test |
| --- | --- | --- | --- | --- |
| `LeaderNav.tsx`, `features/users/index.ts`, `LeaderNav.test.tsx` | `LeaderNav` | Unused by `AppShell`. Remove only after grep shows no production import. | LOW | Delete or retarget `LeaderNav.test.tsx` onto `RoleNavigation` |

### Explicitly not in this plan

| Item | Why |
| --- | --- |
| `session.ts`, `checkRol`, JWT | CRITICAL. Out of scope. |
| `asignarTecnicoBodySchema` and workflow routes | HIGH. Behavior already correct. |
| Mongoose models, `aprobadoPor` | HIGH. Schema. Later roadmap. |
| `DELETE /api/solicitud/:id` | HIGH. Confirm mounted or not in a read-only pass. Do not unmount inside the UX slice. |
| `AdminEstadisticas.tsx` | Leave the two charts. Do not place them on despacho. |
| `sortTicketsByProximityRadar` | Technician queue. Do not call it from the leader assign drawer in this plan. |
| Mobile `guards.ts` | Do not unblock `lider`. |
| Contracts package | No version bump. |

## Risk summary

| Change | Class |
| --- | --- |
| Label and nav order | LOW |
| Client sort/filter | LOW if the array shape is unchanged |
| `AdminSolicitud.tsx` edit | MEDIUM because of file size and uncommitted work |
| Any edit under `server/src/features/tickets/routes` or `session.ts` | CRITICAL — do not do it here |
| Contract or schema change | CRITICAL — stop and ask |

## Execution order

1. Foundation: read `AdminSolicitud.tsx` and `SeguimientoSolicitud.tsx` as they are on disk (they may be dirty). Note assertions in `role-workspaces.test.tsx` and `app-shell-navigation.test.tsx`.
2. Contracts: none.
3. Backend: none.
4. Frontend: slice A, then B, then C, then D.
5. Tests: run the client tests named below. Do not run the whole monorepo unless a shared UI primitive changed.
6. UX polish: focus order in the drawer, stale label, empty copy. No new palette.
7. Verification: keyboard assign on desktop width; 403 is unchanged (no server diff). Browser check of `/adminSolicitud` and `/seguimiento` only.

## Test plan

| Layer | What |
| --- | --- |
| Unit | Client: sort helper if extracted (oldest `createdAt` first; missing date stays stable). Do not change `solicitud-lifecycle.test.ts` unless a transition assertion breaks, which it should not. |
| Component | `role-workspaces.test.tsx`, `app-shell-navigation.test.tsx`, `LeaderLayout.test.tsx`. Update only assertions that lock old nav strings. |
| Integration | Do not rerun `workflow-v2.test.ts` unless a server file changed. If someone touches a route, that file is mandatory. |
| E2E | None new. Manual: login as líder, open despacho, assign is still the same PUT. |
| Accessibility | One h1, drawer focus return, cancel not the first tab stop, error text on empty motivo. No new axe harness required for the first slice. |
| Security | Grep the diff for `checkRol`, `authMiddleware`, `session`. If present, reject the diff. |
| Performance | Client sort of one page. No new query. If pendientes is unpaginated and huge, do not “fix” with a new API in this slice; record it. |

## Rollback

| Change | Failure looks like | Revert | Do not touch while reverting |
| --- | --- | --- | --- |
| Nav labels | Wrong landing item or failed nav test | Restore `LEADER_NAV_ITEMS` | Routes |
| Despacho sort | Empty queue that is not empty, or wrong case selected | Restore `AdminSolicitud.tsx` | `asignarTecnicoSolicitud` |
| En curso filter | Missing cases leaders still need | Default filter back to full `historialSolicitudesLider` | Reassign endpoint |
| LeaderNav deletion | Import error | Restore the three files | `AppShell` |

Detection: client test command for the files above, plus one manual assign on a non-production stack. There is no feature flag. The rollback is git revert of the slice.

## Done when

- `/adminSolicitud` is the dispatch home: oldest unassigned case first, charts absent.
- `/seguimiento` opens on actionable states, with the full list still reachable.
- Assign, reassign, and cancel still call the same functions and still fail server-side the same way.
- Diff contains no `server/src/shared/middleware/session.ts`, no route RBAC edits, and no contract version change.
- `RoleNavigation` is the only leader nav used by the shell.
