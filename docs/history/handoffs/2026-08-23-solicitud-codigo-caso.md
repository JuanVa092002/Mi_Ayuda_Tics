# Handoff — Unique `codigoCaso` + funcionario create/follow contract

**Date:** 2026-08-23  
**Role:** PE II / Mobile Engineer  
**Workstream ID:** `solicitud-codigo-caso-unique`

---

### Goal

Guarantee `codigoCaso` uniqueness with an explicit Mongo index (not schema autoIndex), harden create/detalle/historial contracts, and ship funcionario SuccessCard locally without treating uniqueness as production-true until prod migrate is verified.

### Why this matters

Create/follow showed missing or invented case codes. Uniqueness is an operational index problem. Turning off `autoIndex` on `Solicitud` would skip every index on that schema, not only `codigoCaso`.

### Relevant context

- `docs/runbooks/solicitud-codigo-caso-unique.md`
- `docs/handoff-template.md`
- Approved plan: no new feature flags; no `autoIndex: false` on the schema.

### Constraints

- **In scope:** ownership helper, consecutivo E11000 retry, conditional `telefono` on GET detalle, stable historial sort, audit/migrate scripts, tests, funcionario SuccessCard/filters/mappers for local/staging.
- **Out of scope:** production unique-index migrate, production SuccessCard ship as unique-id UX, técnico/líder redesign.
- **HITL touched:** yes — production audit + migrate remain human-gated (`ALLOW_PROD_SOLICITUD_INDEX=I_UNDERSTAND`).

### Files touched

| Path | Change summary |
|------|----------------|
| `server/src/features/tickets/models/solicitud.ts` | Intent comment only; no `unique` / `autoIndex` |
| `server/src/features/tickets/indexes/*` | Index spec + audit/migrate ops + fingerprint helper |
| `server/src/scripts/audit-solicitud-codigo-caso.ts` | Read-only audit CLI |
| `server/src/scripts/migrate-uniq-solicitud-codigo-caso.ts` | Sole creator of `uniq_solicitud_codigoCaso` |
| `server/src/shared/utils/entity-id.ts` | Ownership / id equality |
| `server/src/shared/utils/mongo-duplicate.ts` | E11000 field detection |
| `server/src/features/tickets/controllers/*` | Retry consecutivo, 409 on duplicate `codigoCaso`, phone projection, sort |
| `server/src/tests/**` | Unit + integration (index preserve / privacy / sort) |
| `mobile/MiAyudaTIC-Mobile/src/shared/contracts/solicitud.ts` | Labels, chips, no fake `—` code |
| `mobile/.../SuccessCard.tsx` + `nueva-solicitud.tsx` | Local SuccessCard with POST payload |
| `mobile/.../historial` + detail | Chip filters; hide phone if absent |
| `docs/runbooks/solicitud-codigo-caso-unique.md` | Schema index audit + commands |

### Decisions made

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| Do not set schema `autoIndex: false` | Would affect all indexes on `Solicitud`, not only `codigoCaso` | yes |
| Do not set `unique: true` on `codigoCaso` | Default Mongoose autoIndex would create `codigoCaso_1` on boot in prod | yes |
| Unique index only via migrate script | Single operational source for `uniq_solicitud_codigoCaso` | yes (HITL drop) |
| No new feature flags | Approved constraint | n/a |
| SuccessCard local/staging now; prod unique UX later | Unique id is false until prod index is verified | yes |

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Duplicates/empty `codigoCaso` in prod | high | Audit STOP; no index; separate HITL normalize |
| Conflicting `codigoCaso_1` already in a DB | high | Migrate refuses; HITL |
| `.env` on this machine is not simulation | high | Did **not** run migrate against it |
| Tecnico `estado` pre-save | medium | Integration test forces `estado: true` after create |
| SuccessCard local UX before prod uniqueness | medium | Runbook: do not ship unique-id UX to prod yet |

### Open questions

1. Who runs `audit:codigo-caso` + `migrate:codigo-caso-unique` on simulation/staging with the real URI?
2. Who approves production `ALLOW_PROD_SOLICITUD_INDEX=I_UNDERSTAND`?

### Next owner

| Role | Task |
|------|------|
| PE II / ops | Audit + migrate simulation/staging; confirm `listIndexes()` fingerprints |
| HITL / Founder-CTO | Production read-only audit; approve migrate; smoke POST create |
| Mobile | Ship SuccessCard unique-id UX to production **only after** prod index verification |

### Acceptance criteria

- [x] `Solicitud` schema has no `autoIndex: false` and no `unique: true` on `codigoCaso`
- [x] Unique index created only by migrate script
- [x] Integration test asserts prior indexes unchanged (name/key/unique fingerprint)
- [x] GET detalle omits `telefono` for técnico/líder
- [x] Historial sort `{ fecha: -1, _id: -1 }`
- [x] SuccessCard uses POST `id` + `codigoCaso` when present; recovery copy if missing
- [ ] Simulation/staging migrate verified on a real cluster
- [ ] Production audit + migrate + smoke
- [ ] Then production SuccessCard unique-id ship

**Verification commands run:**

```bash
pnpm --dir server test
pnpm --dir mobile/MiAyudaTIC-Mobile test src/shared/contracts/solicitud.test.ts
```

Integration (`pnpm --dir server test:integration`) skips unless `DB_URI` contains `miayudatics_simulation`.
