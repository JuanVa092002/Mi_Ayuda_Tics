# execution-rhythm.md — MiAyudaTIC

> Cadence for a tiny, high-density team. Calendars are light; **rhythm is strict**.

---

## Weekly loop

| Day | Ritual | Duration | Owner |
|-----|--------|----------|-------|
| Monday | **Planning** — pick 1–3 workstreams, assign roles, write handoffs | 30 min | Founder |
| Daily | **Async check** — blockers in handoff or single thread | 5 min | Role owners |
| Wednesday | **Mid-week cut** — merge or kill scope creep | 15 min | Founder-CTO |
| Friday | **Ship review** — what merged, metrics, smoke status | 20 min | Founder + AI Ops |

No daily standup theater. **Handoffs are the standup.**

---

## Daily planning (Monday + as needed)

1. Read north-star metrics (`product.md`) — any red?
2. List open handoffs — finish before starting new?
3. Assign **max 2 active workstreams** (Founder capacity limit).
4. Each workstream: role, acceptance criteria, files boundary, verify commands.

**Output:** Handoff stubs in chat or `scratch/handoffs/YYYY-MM-DD-<name>.md` (optional).

---

## Parallel workstreams

| Max parallel | Condition |
|--------------|-----------|
| 2 implementation | Different directories; no shared contract edit |
| 1 + 1 explore | Implementation + readonly audit OK |
| 3 | Only if one is CI/docs (AI Ops) |

**Freeze window:** 24h before prod release — P2/P3 only with CTO approval.

---

## Release rhythm

| Type | Frequency | Gates |
|------|-----------|-------|
| **Prod (web+API)** | When P1 done or planned pilot milestone | CI green + `smoke:prod` 12/12 + handoff |
| **Mobile internal** | After typecheck + device test | No store until EAS pipeline exists |
| **Hotfix** | P0 only | CTO approval; smoke within 1h post |

**No weekly mandatory release.** Release when acceptance criteria met.

---

## PR review rhythm

| PR size | Review SLA | Reviewer |
|---------|------------|----------|
| < 200 LOC | Same day | Peer role per `agents.md` |
| 200–400 LOC | 24h | + Founder skim |
| > 400 LOC | Split PR | CTO must pre-approve split plan |

**One approval minimum**; HITL changes need CTO.

---

## Bug triage

| Severity | Response | Owner |
|----------|----------|-------|
| P0 security/data | Stop workstream; fix now | PE2 + CTO |
| P1 prod broken | Same day | PE2 or PE1 by surface |
| P2 wrong behavior | Next workstream slot | PE1 |
| P3 cosmetic | Batch Friday with Design | Design Eng |

**Triage input:** smoke failures, pilot user reports, logs.

AI Ops maintains triage checklist in handoff notes.

---

## Metrics review (Friday)

| Metric | Source |
|--------|--------|
| Smoke prod | `pnpm run smoke:prod` |
| CI | GitHub Actions |
| Pilot KPIs | Manual spreadsheet / líder feedback |
| Mobile progress | Stage checklist in `product.md` |

**Decision:** continue / pivot / cut scope for next week.

---

## Architecture review

| Trigger | Action |
|---------|--------|
| New bounded context | CTO writes 1-pager in `architecture.md` |
| Contract breaking change | PE2 + CTO; version note in handoff |
| Offline/sync feature | Mandatory architecture section update before code |
| Multi-tenant mention | **Stop** — explicit Stage 4 decision required |

**Monthly (30 min):** CTO reads `archive/audits/2026-06-13-code-audit/docs-vs-code.md` top stale items; assign one fix.

---

## When to refactor

| Refactor | Allowed when |
|----------|--------------|
| Rename/move within one feature | Same workstream |
| FSD layer move | Dedicated workstream + CTO approval |
| Delete Flutter legacy | Dedicated workstream; archive only |
| Client → contracts migration | Planned Stage 2 epic; not drive-by |

**Never refactor** during P0/P1 incident.

---

## When NOT to open new scope

- Smoke prod red
- Open HITL change unreviewed
- Two workstreams already at day 3 without merge
- "Nice idea" without metric link to `product.md`
- New role surface (e.g. líder mobile) without CTO decision

**Scope is a weapon.** Protect it.

---

## References

- Operating model: `docs/operating-model.md`
- Quality gates: `docs/quality-bar.md`
- Release checklist: `archive/audits/context-legacy/delivery/release-checklist.md` (historical)
