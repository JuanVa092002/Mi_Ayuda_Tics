# analytics.md — MiAyudaTIC

> Event catalog and metric wiring. Links north-star KPIs in [`product.md`](product.md) to instrumentation targets.

---

## North-star metrics (source of truth)

| Metric | Definition | Target (pilot) | Primary signal |
|--------|------------|----------------|----------------|
| Time-to-first-response | Solicitud creada → asignada | < 4h laborables | `solicitud_assigned` timestamp delta |
| Resolution rate | Finalizados / creados (30d) | > 85% | `solicitud_resolved` / `solicitud_created` |
| Mobile report share | Solicitudes desde Expo / total | > 40% (post v2) | `mobile_solicitud_created` |
| Technician activation | Técnicos con ≥1 cierre / aprobados | > 90% | `solicitud_resolved` by técnico |
| Leader weekly active | Líder login + ≥1 acción admin / semana | 100% pilot | `auth_login_success` + admin action |

**Guardrail:** 0 P0 security regressions; `pnpm run smoke:prod` 12/12 before release.

---

## Event catalog

| Event | Actor | When fired | Properties (minimum) |
|-------|-------|------------|----------------------|
| `auth_login_success` | all | Successful login | `rol`, `surface` (web\|mobile) |
| `solicitud_created` | funcionario | POST solicitud success | `solicitudId`, `ambienteId`, `hasPhoto`, `surface` |
| `mobile_solicitud_created` | funcionario | Same, `surface=mobile` | Same as above |
| `solicitud_assigned` | líder | Técnico assigned | `solicitudId`, `tecnicoId`, `timeSinceCreated` |
| `solicitud_resolved` | técnico | Solución finalizado | `solicitudId`, `tipoSolucion`, `hasEvidence` |

**Socket events** (realtime, not analytics): `actualizarSolicitud`, `actualizarTecnico`, `nuevaNotificacion` — see [`contracts.md`](contracts.md).

---

## Implementation status

| Layer | Today | Target (Stage 2) |
|-------|-------|------------------|
| Leader dashboards | API aggregates in web | Keep — source for líder KPIs |
| Client events | Not instrumented | Stub or emit on key actions |
| Server audit log | Not deployed | Preferred first backend for events |
| Third-party SDK | None | Defer until Founder-CTO decision |

**Default decision (pending HITL):** Server-side audit log on mutating ticket/auth routes before client SDK.

---

## Where to instrument

| Surface | Owner role | Files (typical) |
|---------|------------|-----------------|
| Web login | PE Web | `client/src/features/auth/` |
| Web solicitud create | PE Web | `client/src/features/tickets/` |
| Web assign/resolve | PE Web | `client/src/pages/` líder + técnico |
| Mobile solicitud | Mobile Eng | `mobile/.../features/tickets/` (planned) |
| API mutations | PE Platform | `server/src/features/tickets/` controllers |

---

## PE Web DoD (metrics)

When shipping a user-facing flow:

1. Identify which north-star metric it moves.
2. Add event stub (console in dev, no-op in prod) OR wire to server audit if endpoint exists.
3. Document event name in handoff `Decisions made`.
4. Do not ship analytics without a named metric link — see anti-goals in [`product.md`](product.md).

---

## Privacy

- No PII in event payloads (no correo, teléfono, nombres).
- Use IDs (`solicitudId`, `userId` hash optional later).
- Align with data handling in [`architecture.md`](architecture.md) § Data handling.

---

## References

- Architecture events table: [`architecture.md`](architecture.md) § Analytics events
- Contracts entities: [`contracts.md`](contracts.md)
- Skill: [`.cursor/skills/release-readiness/SKILL.md`](../.cursor/skills/release-readiness/SKILL.md)
