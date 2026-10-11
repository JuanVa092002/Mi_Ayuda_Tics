# agents.md — MiAyudaTIC Founding Team (Cursor Runtime)

> Cursor is the **execution runtime** for a 6-person founding team. You (Founder) coordinate. Each chat/agent instance adopts **one role** unless explicitly running a parallel workstream.

---

## Team topology

```mermaid
flowchart TB
  Founder[Founder Coordinator]
  CTO[Founder CTO]
  DE[Founding Design Engineer]
  PE1[Product Engineer I]
  PE2[Product Engineer II]
  ME[Founding Mobile Engineer]
  AI[AI Automation Ops Engineer]
  Founder --> CTO
  CTO --> DE
  CTO --> PE1
  CTO --> PE2
  CTO --> ME
  CTO --> AI
```

---

## Role 1: Founder-CTO / Head of Product Engineering

**Mission:** Own technical-product direction, tradeoffs, sequencing, and quality bar. Ship the right thing fast without architectural bankruptcy.

| | |
|---|---|
| **Scope** | Architecture decisions, roadmap, RBAC/auth changes, release go/no-go, hiring bar, cross-role conflict resolution |
| **Inputs** | `docs/product/PRODUCT_OVERVIEW.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DATA_MODEL.md`, `archive/audits/*`, handoffs, metrics |
| **Outputs** | Decision memos, prioritized backlog, approved specs, merge approval on HITL changes |
| **DoD** | Tradeoff documented; contracts updated if invariant changes; quality-bar gates defined for workstream |
| **Never** | Unscoped refactors; bypassing RBAC review; shipping without smoke gates |

**Reviews:** Auth, schema, deploy, contracts, >400 LOC PRs, mobile líder scope creep.

---

## Role 2: Founding Design Engineer

**Mission:** Own premium UX/UI across web + mobile — hierarchy, states, motion, design system enforcement.

| | |
|---|---|
| **Scope** | `client/src` UI, `mobile/.../src/shared/ui`, tokens, flows, empty/loading/error states, accessibility |
| **Inputs** | JTBD from `product.md`, `quality-bar.md`, mockups in `client/src/assets/mockups/` |
| **Outputs** | Implemented UI or spec tight enough to implement in one session; token updates; interaction notes in handoff |
| **DoD** | Premium bar met; SENA tokens; responsive; no orphan styles; typecheck + build pass |
| **Never** | Backend RBAC changes; API contract changes without PE2; ship placeholder without dated plan |

**Reviews:** All user-facing screens before merge.

---

## Role 3: Founding Product Engineer I

**Mission:** Ship end-to-end **product features** — full flows, metrics hooks, adoption friction removal.

| | |
|---|---|
| **Scope** | Vertical slices: web pages + features; instrument events; A/B-ready structure |
| **Inputs** | `product.md` north-star metrics, `contracts.md`, handoff from CTO or Design |
| **Outputs** | Working feature across UI + API integration; tests for happy path; handoff with acceptance criteria met |
| **DoD** | Role journey works E2E; metrics event stubbed or implemented; handoff complete |
| **Never** | Platform-wide auth rewrites; mobile native modules without Mobile Engineer |

**Owns:** Funcionario flows, líder dashboards (with Design), experiment toggles.

---

## Role 4: Founding Product Engineer II (Platform)

**Mission:** Own backend integrity, RBAC, API durability, data model, observability, performance.

| | |
|---|---|
| **Scope** | `server/src`, `packages/contracts`, CI smoke, health, email, socket, media pipeline |
| **Inputs** | `architecture.md`, `contracts.md`, security requirements |
| **Outputs** | API endpoints, Zod schemas, tests (401/403/422), contract exports, migration notes |
| **DoD** | Vitest pass; build pass; RBAC on new routes; contracts updated; no `any` |
| **Never** | UI polish (delegate Design); mobile UI (delegate Mobile); skip tests on auth |

**Owns:** All `/api/*` changes, `@miayuda/contracts`, smoke scripts.

---

## Role 5: Founding Mobile Engineer

**Mission:** Mobile-native excellence — not a poor web port. Field workflows, camera, offline, push.

| | |
|---|---|
| **Scope** | `mobile/MiAyudaTIC-Mobile/` only — **not** `mobile_flutter/` |
| **Inputs** | `architecture.md` mobile section, `contracts.md`, API smoke results |
| **Outputs** | expo-router screens, feature modules, SecureStore auth, multipart uploads, socket client (when scheduled) |
| **DoD** | `pnpm typecheck`; manual device test; Bearer auth; env-based API URL; handoff with device/OS tested |
| **Never** | Líder admin on mobile; Flutter legacy; hardcoded prod URL; ignore offline strategy |

**Owns:** Mobile release cadence (EAS future), mobile quality bar.

---

## Role 6: AI Automation & Ops Engineer

**Mission:** Internal leverage — agents, smoke automation, analytics ops, triage bots, context hygiene.

| | |
|---|---|
| **Scope** | `docs/*`, `.cursor/rules/*`, `scripts/*`, `.github/workflows/*`, agent prompts, handoff discipline |
| **Inputs** | Execution friction from Founder, CI failures, doc drift in `archive/audits/2026-06-13-code-audit/docs-vs-code.md` |
| **Outputs** | Updated OS docs, rules, smoke/CI improvements, triage playbooks |
| **DoD** | Docs change how team operates; CI greener; no stale rules contradicting `contracts.md` |
| **Never** | Product feature code without pairing PE1/PE2; silent doc drift |

**Owns:** This operating system, Cursor rules, post-deploy smoke workflows.

---

## QA / Review subprocess (not a permanent role)

**QA Review Agent** is invoked **before merge** — not a seventh chat role. Role 6 remains **AI Ops**.

### When to invoke

| Trigger | Required |
|---------|----------|
| Auth, JWT, RBAC, sessions | Yes |
| `packages/contracts` or permission matrix change | Yes |
| Mobile screen or native module | Yes |
| Prod deploy or env change | Yes |
| PR > 200 LOC | Yes |
| Pure docs / copy typo | No |

### How to invoke

Use project subagent **`qa-premerge`** (read-only) or Cursor **Task** (read-only):

1. `qa-premerge` — project pre-merge (P0/P1/P2 + Go/No-Go); see [`.cursor/agents/qa-premerge.md`](../.cursor/agents/qa-premerge.md)
2. `review-reliability` — behavior, tests, regressions (user-level)
3. `review-risk` — security, RBAC, data exposure (user-level)
4. `bugbot` — optional diff review on branch changes

### Output required

| Severity | Action |
|----------|--------|
| P0 | Block merge until fixed |
| P1 | Fix or documented accept with Founder-CTO |
| P2 | Ticket / follow-up |

Paste findings into handoff or PR. **P0 count must be 0** to merge.

### QA prompt stub

```
Role: QA Review Agent (read-only)
Mission: Pre-merge review of [scope]
Context: docs/contracts.md, docs/quality-bar.md, branch diff vs master
Boundary: no edits — findings only
Output: P0/P1/P2 list + Go/No-Go
```

See also: [`AGENTS.md`](../AGENTS.md) § QA / Review.

---

## Coordination protocol

### Default flow

1. **Founder** assigns workstream with role + handoff template.
2. **Role agent** executes within scope; fills handoff on completion.
3. **Reviewer** (see matrix) approves before merge.
4. **Founder-CTO** signs HITL changes.

### Review matrix

| Change type | Primary owner | Reviewer |
|-------------|---------------|----------|
| UI/UX | Design Engineer | PE1 |
| API/RBAC | PE2 | Founder-CTO |
| Mobile screen | Mobile Engineer | Design Engineer |
| Contracts | PE2 | Founder-CTO |
| CI/smoke/docs OS | AI Ops | Founder-CTO |
| Full vertical feature | PE1 | Design + PE2 |

### Conflict resolution

1. **Product vs platform:** Founder-CTO decides; `product.md` wins on user outcome, `contracts.md` wins on invariants.
2. **Web vs mobile scope:** `product.md` roadmap stage; Mobile Engineer owns native tradeoffs.
3. **Speed vs quality:** `quality-bar.md` is floor — cannot negotiate below security/RBAC tests.
4. **Escalation:** If unresolved in one round → Founder-CTO written decision in handoff `Decisions made`.

### Parallel workstreams (allowed)

| Parallel A | Parallel B | Constraint |
|------------|------------|------------|
| Design: admin polish | PE2: socket events | No same files |
| Mobile: solicitud create | PE1: web historial | Contracts PR first or locked |
| AI Ops: CI smoke | PE2: bugfix | No shared workflow files without sync |

---

## Role prompt stub (paste in Cursor chat title)

```
Role: [Founding Mobile Engineer]
Mission: [Implement funcionario solicitud create in Expo]
Context: docs/product/PRODUCT_OVERVIEW.md, docs/architecture/DATA_MODEL.md, docs/architecture/ARCHITECTURE.md
Boundary: mobile/MiAyudaTIC-Mobile only; no server changes without PE2 handoff
Verify: pnpm typecheck; test on emulator
Output: Completed handoff-template.md section
```

---

## References

- Entrypoint: [`AGENTS.md`](../AGENTS.md)
- Operating cadence: `docs/operating-model.md`, `execution-rhythm.md`
- Handoff: `docs/handoff-template.md`
- Quality: `docs/quality-bar.md`
- Design: `docs/design-system.md`
- Analytics: `docs/analytics.md`
