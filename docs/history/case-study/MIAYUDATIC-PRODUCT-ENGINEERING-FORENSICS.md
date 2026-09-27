# MIAYUDATIC — PRODUCT ENGINEERING FORENSICS

**Captured:** 2026-09-22  
**Repo:** `MiAyudaTics_v1.0`  
**Git identity on every commit:** `JuanVa092002 <juan.pastasvalencia@hotmail.com>` (75 commits on HEAD; `git shortlog -sn --all` reports 76)  
**Tag:** `v2.0.0-backend-ts-migration` → `f2d8b7f` (2026-04-21)  
**Evidence taxonomy:** E0 not supported · E1 inferred · E2 repository · E3 git history · E4 measured  

**Scope of this document:** extract the strongest *true* professional signal from the repository. Does not repeat the prior master-context inventory as narrative; goes deeper into decisions, ownership signals, incidents, and hiring-facing evidence.

**Hard rule applied:** Git identity continuity is **not** automatic proof of sole human authorship of discovery, interviews, or institutional ownership. Claims of personal leadership beyond what Git/docs prove are marked **HUMAN TESTIMONY REQUIRED**.

---

## PART 1 — Engineering story (chapters from evidence)

### Chapter A — Initial institutional MVP (2024-10-30)

| Field | Evidence |
|-------|----------|
| Date | 2024-10-30 |
| Commits | `a00655c` “MiAyudaTics v1.0”; same-day snapshots `d307857` V1, `1b7d15b` V2, `22f72d3`/`5d893ef` v4 |
| Change | Full JS Express + React Vite client bootstrap: auth, solicitudes, solucionCaso, storage, tecnicos, ambientes, gráficas, password recovery |
| Problem addressed | Digitize institutional IT support (stated later in product docs; **not** in 2024 commit messages) |
| Architectural consequence | Monolithic JS server + component-oriented React; cookie session; `SolucionCaso` as close path |
| Product consequence | Three-role desk exists as software from day one of this git history |
| Maturity signal | Working multi-surface product in first commit — not a tutorial scaffold only |
| Strength | **E3** for “application existed in git from root”; **E0** for interviews/requirements process |

Gap: ~17 months with no commits between 2024-10-30 and 2026-04-20. What happened operationally is **HUMAN TESTIMONY REQUIRED**.

### Chapter B — Quality platform & TypeScript migration (2026-04-20 → 2026-04-21)

| Field | Evidence |
|-------|----------|
| Commits | `7916176` husky/commitlint → `f2d8b7f` phase-2 close; tag `v2.0.0-backend-ts-migration` |
| Change | pnpm enforcement, ESLint/Prettier, feature scaffolding, group A→D JS→TS migration, then Zod as **separate** Fase 2.5 |
| Problem | Untyped JS + weak gates blocked safe evolution |
| Preserved | Express + Mongo + existing domain models; Express 5 / Multer 2 approved; React 19 / RR7 / Tailwind 4 **rejected** |
| New complexity | Dual-file risk during migration (later removed `allowJs`); validator rewrite deferred then done |
| Maturity | Explicit scope control (`f965134` defer Zod); planned `SKIP_PRE_COMMIT` removal (`06dc197`) |
| Strength | **E3** + **E2** (`archive/openspec/archive/DECISIONS_HISTORY.md`) |

### Chapter C — Email provider churn & UI productization (2026-04-21 → 2026-04-22)

| Field | Evidence |
|-------|----------|
| Commits | `2663839` Gmail→Resend; `e3c0a42` →Brevo; `e27cbc1` funcionario premium; `de65255` técnico/admin UI |
| Change | Transactional email path re-homed; “Zero Noise” / SENA institutional UI |
| Problem | Deliverability / portfolio-friendly email; UX debt |
| Consequence | Brevo becomes production dependency (later causes P0 IP incident) |
| Strength | **E3** |

### Chapter D — Deploy confidence & institutional release (2026-04-21 → 2026-06-12)

| Field | Evidence |
|-------|----------|
| Commits | `99c60a8` phase-3 deploy confidence; `48e5430` harden MVP; `92ad9b7` smoke tooling; `a35b0d3` Render/Vercel docs |
| Change | Smoke scripts, health probes, deploy guides, Dockerfile path for contracts |
| Maturity | Treats “it runs on my machine” as insufficient for institutional release |
| Strength | **E3** / **E2** |

### Chapter E — Native mobile platform (backend first, then Expo) (2026-06-12 → 2026-08-30)

| Field | Evidence |
|-------|----------|
| Commits | `7ff15ba` backend for native (Bearer extract, media routes, contracts package, socket adapter docs); `9378020` war-room + Expo tree; `050922c` funcionario persist + media auth |
| Change | Dual auth (cookie + Bearer); `@miayuda/contracts`; Expo app; líder blocked in mobile policy |
| Product consequence | Field vs command surfaces become explicit |
| Preserved | Web cookie session; Flutter left as untracked legacy (`mobile_flutter/`) |
| Openspec contrast | Phase-4 doc still describes **líder mobile journeys**; later code **blocks** líder — product corrected toward web-only command |
| Strength | **E3** cross-layer; Flutter migration claim **E0** as “complete migration” |

### Chapter F — Integrity ops (codigoCaso) + open email debt (2026-08)

| Field | Evidence |
|-------|----------|
| Docs | `docs/handoffs/2026-08-23-solicitud-codigo-caso.md`; incident `2026-08-27-solicitud-sendmail-post-201.md` |
| Change | Migrate-only unique index pattern; explicit refusal of schema `unique`/`autoIndex:false` |
| Maturity | HITL gates (`ALLOW_PROD_SOLICITUD_INDEX=I_UNDERSTAND`); documents **open** bug instead of hiding it |
| Strength | **E2** documentation + scripts; prod index presence **not re-proven here** |

### Chapter G — Workflow v2 + dual clients (2026-09-07)

| Field | Evidence |
|-------|----------|
| Commits | `48a67f8` backend+web+mobile workflow; `0e4e8a4` leader inbox + técnico offline; `8822595` CORS Idempotency-Key |
| Change | State machine, historial, idempotency, optimistic revision, transactions-or-fail in prod |
| Preserved | All v1 tickets; `SolucionCaso` for legacy close |
| New complexity | Dual machines; client Idempotency-Key mandatory; Atlas index + replica required |
| Strength | **E3** single commit touches server+client+mobile (**cross-layer ownership signal**) |

### Chapter H — Measured production hardening (2026-09-08 → 2026-09-15)

| Field | Evidence |
|-------|----------|
| Commits | `ac5ae74` local Vite vs prod API; Phase 0.5 deps/CORS/assetlinks; D2 live `b503755` on master (worktree release) |
| Change | Health CORS non-throwing; App Links JSON; smoke 204; nodemailer accepted risk documented |
| Maturity | Separates PASS local vs live; refuses to declare E2E v2 PASS when harness-only |
| Strength | **E4** smoke/CORS/assetlinks; security still **FAIL WITH ACCEPTED RISK** |

---

## PART 2 — Architectural decisions (not tech lists)

### D1 — Defer Zod during TS controller migration
- **Evidence:** `f965134`; `DECISIONS_HISTORY.md` (2026-04-21)
- **Problem:** Rewriting validators + controllers doubles risk surface
- **Alternatives visible:** Keep express-validator; migrate Zod in same PR (rejected); ADR-002 deferred
- **Why it makes sense:** Sequencing reduces blast radius
- **Trade-off:** Two validator eras temporarily
- **Judgment:** Scope discipline under migration pressure (**E2+E3**)

### D2 — Reject React 19 / RR7 / Tailwind 4 / Mongoose 9 during migration
- **Evidence:** `DECISIONS_HISTORY.md` “Actualizaciones Major Rechazadas”
- **Problem:** Stability vs fashion upgrades
- **Trade-off:** Later dual React (web 18 / Expo 19) debt **E1**
- **Judgment:** Risk budgeting (**E2**)

### D3 — pnpm only; husky typecheck before eslint
- **Evidence:** engines + lockfile; decision log hooks order
- **Judgment:** Toolchain as product, not afterthought (**E2+E3**)

### D4 — Cookie web + Bearer mobile (+ socket handshake)
- **Evidence:** `extractAuthToken.ts` priority Bearer → cookie → `handshakeAuthToken`; `7ff15ba`
- **Problem:** Native clients cannot rely on httpOnly cookies the same way browsers do
- **Trade-off:** Two session bug classes; localhost web Bearer exception in client axios
- **Judgment:** Surface-appropriate auth (**E2+E3**)

### D5 — Líder blocked on mobile (app policy), not only missing UI
- **Evidence:** `session-policy.ts` `lider_blocked`; does not persist token; Phase-4 openspec previously listed líder mobile journeys
- **Problem:** Command workflows need desktop density
- **Reason:** Product correction from earlier mobile-for-everyone plan (**E1** intent; **E2** outcome)
- **Judgment:** Role × device as product decision (**E2**)

### D6 — v2 beside v1; no mass migration
- **Evidence:** `docs/workflow-v2.md`; `workflowVersion === 2` gate; `SolucionCaso` 409 on v2
- **Problem:** Live tickets in old states
- **Trade-off:** Dual vocabulary forever
- **Judgment:** Compatibility over purity (**E2+E3**)

### D7 — Client-supplied Idempotency-Key (no server UUID invent)
- **Evidence:** `requireClientOperationId`; CHANGELOG; tests
- **Problem:** Mobile/network retries must not double-apply
- **Trade-off:** Clients that omit key get 400; discipline required
- **Judgment:** Make retries safe at the cost of client contract (**E2**)

### D8 — Transactions required in prod; compensate locally
- **Evidence:** `workflow-atomicity.ts` `mongoRequiresTransactions`, `WORKFLOW_FORCE_NO_TRANSACTIONS` blocked in production; `compensateTicketIfEventMissing`
- **Problem:** Ticket update + historial insert must not diverge
- **Trade-off:** 503 if Atlas not ready; local path is weaker
- **Judgment:** Fail closed where money/ops integrity matter (**E2**)

### D9 — Unique indexes only via migrate scripts (no schema unique / no autoIndex)
- **Evidence:** runbooks historial + codigoCaso; handoff 2026-08-23
- **Problem:** Mongoose autoIndex would create unique indexes on boot in prod
- **Trade-off:** Human-gated ops; uniqueness false until migrate verified
- **Judgment:** Operational safety over ORM convenience (**E2**)

### D10 — Email: Gmail → Resend → Brevo; API primary, SMTP fallback
- **Evidence:** commits `2663839`, `e3c0a42`; incident 2026-06-14; `handleEmail.ts`
- **Problem:** Deliverability / portfolio constraints
- **Trade-off:** Third-party IP allowlists become architecture
- **Judgment:** Iterate providers under real prod pressure (**E3+E2**)

### D11 — Vitest lean mocks, later guarded integration simulation
- **Evidence:** DECISIONS lean mode; `test:integration` + `.env.test` rejection of non-local URI
- **Trade-off:** Mocks miss sendMail-after-201 (**documented**)
- **Judgment:** Speed first, then fidelity for critical paths (**E2**)

### D12 — Expo as official mobile; Flutter frozen off-index
- **Evidence:** `docs/product.md`; `mobile_flutter` untracked nested `.git`; Expo tracked from `9378020`
- **Not proven:** “full Flutter→RN migration” (**E0**)
- **Judgment:** Reimplement against current API rather than maintain two live clients (**E2+E3**)

### D13 — Shared `@miayuda/contracts` package introduced; web/mobile still have local contracts
- **Evidence:** `packages/contracts` in `7ff15ba`; docs/contracts debt table
- **Trade-off:** Partial adoption
- **Judgment:** Direction toward shared types without big-bang (**E2**)

### D14 — Health CORS non-throwing; SPA exclude `.well-known`
- **Evidence:** `56286a8`; D2 `b503755`; smoke
- **Problem:** Browser CORS + App Links HTML catch-all
- **Judgment:** Production probe vs SPA rewrite as first-class concerns (**E3+E4**)

### D15 — Accept nodemailer 8.x risk; do not force major / raise audit threshold
- **Evidence:** `docs/security/dependency-triage.md`; `5c64639` patches other highs
- **Judgment:** Honest security gate (**E2**)

---

## PART 3 — Ownership evidence

### What Git can prove

| Fact | Level |
|------|-------|
| Every commit on this history uses author `JuanVa092002 <juan.pastasvalencia@hotmail.com>` | **E3** |
| Root commit already contains web+server application | **E3** |
| Same identity carried TS migration, email, deploy, mobile, workflow v2, hardening | **E3** |
| Large cross-layer commits exist (`48a67f8` server+client+mobile; `050922c` mobile+server; `7ff15ba` server+packages+CI) | **E3** |
| Docs self-style roles “PE II / Mobile Engineer”, “HITL / Founder-CTO” in handoffs | **E2** (role *framing*, not HR proof) |

### What Git cannot prove

| Gap | Status |
|-----|--------|
| Interviews with líder TIC / técnicos | **HUMAN TESTIMONY REQUIRED** |
| Whether AI/pair/other people edited outside this git identity | **HUMAN TESTIMONY REQUIRED** |
| Institutional org-chart title | **HUMAN TESTIMONY REQUIRED** |
| Who clicked Brevo IP allowlist / Atlas migrate in prod | Partly **HUMAN TESTIMONY**; incident doc records operational steps |

### Ownership Evidence Matrix

| Area | Evidence | Repo | Git | Strength | Safe public wording | Testimony |
|------|----------|------|-----|----------|---------------------|-----------|
| Full-stack continuity | Same author across server/client/mobile eras | Y | Y | High continuity | “This repository’s commit history is a continuous full-stack evolution under one Git identity” | Do not say “I alone invented the institution’s process” |
| Workflow v2 | `48a67f8` touches domain + web services + mobile idempotency | Y | Y | Cross-layer | “Workflow v2 was landed as a coordinated API + web + mobile change” | Individual vs pair: testimony |
| Auth dual-stack | `extractAuthToken` + mobile SecureStore + web cookies | Y | Y | Cross-layer | “Auth was extended for native clients without dropping web cookies” | — |
| Mobile field product | Expo routes + session-policy líder block | Y | Y | Product+eng | “Mobile was scoped to field roles” | Why: testimony/docs |
| Data integrity ops | Runbooks + migrate scripts + handoff HITL | Y | Partial | Ops maturity | “Unique indexes are migrate-gated, not boot-created” | Who ran prod migrate |
| Incident ownership | Forgot-password incident closed same day with code+ops | Y | Y (`a76951f`) | Debug | “Production email failure was diagnosed to Brevo IP policy and fixed” | Who owned Brevo console |
| Testing culture | Growing Vitest + intentional E2E honesty | Y | Y | Discipline | “The repo refuses to claim E2E v2 PASS while harness-only” | — |
| Requirements discovery | Absent | N | N | None | Do not claim from repo | **Required** |

---

## PART 4 — Cross-layer engineering (Product Engineer signal)

### Workflow v2
| Layer | Artifact |
|-------|----------|
| Backend | `solicitud-workflow.ts`, `workflow-atomicity.ts`, routes |
| DB | `HistorialSolicitud`, `workflowRevision`, unique operationId index |
| Web | `workflow.service.ts`, idempotency, leader/técnico UI |
| Mobile | mirrored idempotency + técnico actions + funcionario confirm/reopen |
| Tests | unit + integration + Playwright harness (not journey) |
| Ops | runbook + rollback + CHANGELOG SHA |

**Signal:** One product change required coordinated contracts across five layers (**E3**).

### Authentication
Backend extract token → web cookies/axios → mobile SecureStore → socket handshake → CI/smoke login checks.

### Case codes
Consecutivo controller → unique index migrate → mobile SuccessCard contract → handoff HITL (**E2**).

### Password reset
Auth controller → Brevo → smoke `SMOKE_REGISTERED_EMAIL` → incident doc → CORS/CLIENT_URL env (**E2+E3+E4** historically).

### Media
Upload middleware → storage access domain → `/api/media/local` auth → mobile camera multipart → unit media-access tests; live IDOR matrix still pending (**E2** partial).

---

## PART 5 — Why this was hard

| Problem | Evidence | Root cause | Response | Remaining | Interview angle |
|---------|----------|------------|----------|-----------|-----------------|
| Dual workflow | workflow-v2.md | Live v1 data | Version gate, no rewrite | Dual APIs forever | Compatibility engineering |
| Idempotent mobile retries | idempotency modules | Unreliable networks | Client keys + hash + unique index | Clients must cooperate | Distributed write safety |
| Concurrent transitions | workflowRevision | Two actors / double taps | Conditional update + 409 | Atlas concurrency **E1** unless measured | Optimistic concurrency |
| TX vs standalone | atomicity.ts | Local Mongo ≠ Atlas | Fail closed in prod | Local compensate path weaker | Environment-aware integrity |
| autoIndex danger | runbooks | ORM defaults | Explicit migrate + flags | Human can forget migrate | Ops-aware schema design |
| Email after 201 | incident open | Side effect after res.send | Documented debt | Still open | Partial failure honesty |
| Brevo IP | incident closed | SaaS egress allowlist | Ops + SMTP fallback + smoke | SMTP still weak | Production debugging |
| CORS health | Phase 0.5/D2 | Middleware order | Non-throwing CORS helper | — | Platform vs app boundary |
| App Links SPA HTML | validate + D2 | Catch-all rewrite | Static JSON + Content-Type | Release fingerprints pending | Deep linking reality |
| Flutter vs Expo | FS + git | Legacy prototype | Freeze Flutter; ship Expo | Two codebases on disk | Succession vs migration |
| Test fidelity gap | sendmail incident | Mocks hide bug | Keep debt visible | Integration doesn’t catch it | Test strategy limits |

---

## PART 6 — Incident forensics

### I1 — Forgot/reset password (prod) — **FIXED**
- Symptom: `POST /recuperarPassword` 500  
- Detection: production  
- Root: Brevo unrecognized Render IP `74.220.48.235`  
- Fix: allowlist + env CORS/CLIENT_URL + `a76951f` logging/SMTP fallback + smoke  
- Lesson: email SaaS is part of architecture  
- Evidence: `docs/incidents/2026-06-14-forgot-password-prod.md` (**E2**), commit (**E3**)

### I2 — crearSolicitud 201 then sendMail — **OPEN**
- Symptom: second HTTP response / headers already sent  
- Detection: Fase C simulation without mail stub  
- Root: catch wraps create+mail after 201  
- Fix: deferred (`DEBT-solicitud-sendmail-post-201`)  
- Lesson: outbox/side-effect isolation  
- Evidence: incident md + `solicitud.ts` lines ~291–305 (**E2**)

### I3 — codigoCaso uniqueness — **PARTIALLY FIXED** (code+runbook; prod migrate HITL)
- Evidence: handoff + runbook (**E2**)

### I4 — Health CORS / App Links HTML — **FIXED live** (D2)
- Evidence: baseline/D2 closeout; measured ACAO + JSON Content-Type (**E4**)

### I5 — Dependency highs — **PARTIALLY FIXED / ACCEPTED RISK**
- Patched multer/axios/etc.; nodemailer 8.x accepted  
- Evidence: dependency-triage (**E2**), audit measured (**E4** on 2026-09-15)

### I6 — Idempotency CORS preflight — **FIXED**
- Commit `8822595` allow Idempotency-Key on assign preflight (**E3**)

### I7 — Guest UI blocked during verify-token — **FIXED**
- `2d4f249` (**E3**)

### I8 — Workflow concurrency / dual apply — **MITIGATED in code**, not load-proven
- Evidence: tests + domain (**E2**); production race **E0/E1**

---

## PART 7 — Engineering judgment (≥10)

1. Migrate TS without Zod same PR  
2. Reject major frontend upgrades mid-migration  
3. Keep v1 tickets; add v2  
4. Client Idempotency-Key vs server-generated UUID  
5. Transactions mandatory in prod vs silent fallback  
6. Migrate-only unique indexes vs schema unique  
7. Cookie + Bearer coexistence  
8. Block líder on mobile after earlier “all roles mobile” doc  
9. Expo successor vs maintaining Flutter  
10. Lean Vitest mocks vs always-on memory Mongo  
11. Document open sendmail debt instead of silent ship  
12. Accept nodemailer risk explicitly vs fake PASS  
13. Auto-retry 0 on workflow mutations (manual retry UI) — visible in workflow-retry-policy  
14. Listings never serialize historial; detail does — payload control  

Each is interviewable as constraint → option → trade-off (**E2/E3**).

---

## PART 8 — Product engineering signal

### User modeling (E2)
Roles `funcionario` / `tecnico` / `lider`; technician approval gate; field photo; case code trust; confirm/reopen; wait_for_requester.

### Surface decisions (E2)
| Decision | Product reason visible in code/docs |
|----------|-------------------------------------|
| Mobile funcionario create + history | Report from classroom |
| Mobile técnico offline drafts | Work in building with flaky network |
| Líder web-only | Assignment/catalogs/stats density |
| Partial solution keeps ticket open | Real repair is iterative |
| Confirm before closed | Requester owns closure |

### Evolution sophistication
v1 linear close (`solucionCaso`) → v2 confirmation + wait + audit. Phase-4 líder-on-mobile → policy block. Email provider iteration under real users.

---

## PART 9 — From zero (objective)

### Initially (`a00655c`, 2024-10-30)
JS Express routes/models/controllers; React JSX client; auth; solicitudes; solucionCaso; storage; roles; SENA logo assets.

### Now
TS monorepo; Zod; Vitest; Expo native; workflow v2; contracts package; CI; smoke; runbooks; incidents; dual auth; Cloudinary/Brevo; Vercel+Render deploy.

### Added capabilities (E3)
Type safety, validation overhaul, native field app, transactional workflow, idempotency, historial, migrate-gated indexes, prod smoke, measured CORS/App Links hardening.

### Not established by repo
Requirements interviews, headcount, institutional adoption metrics.

---

## PART 10 — Complexity map (qualitative)

| Dimension | Class | Why |
|-----------|-------|-----|
| Domain | Complex | Multi-role institutional desk + approval |
| State | High complexity | Two generations + many transitions + capabilities |
| Authorization | Complex | Role + resource (owner/assigned) + media |
| Data integrity | High complexity | Codes, operationId unique, TX/compensate |
| Concurrency | Complex | Optimistic revision + idempotency (load unmeasured) |
| Frontend | Moderate→Complex | FSD-lite, role routers, workflow UI |
| Mobile | Complex | Expo, session policy, offline técnico queue |
| Backend | Complex | Workflow engine + legacy paths |
| Deployment | Moderate | Vercel+Render+smoke; weak gated CD |
| Testing | Moderate | Strong unit/integration islands; weak E2E v2 |
| Operational | Complex | Runbooks, HITL migrates, incidents |
| Security | Moderate | Real controls + accepted dep risk + pending live media matrix |
| Integration | Complex | Brevo, Cloudinary, optional Redis adapter |

---

## PART 11 — Signals a hiring manager could infer

| Signal | Evidence | Confidence | Safe interpretation |
|--------|----------|------------|---------------------|
| Ownership continuity | Single Git identity across eras | High for git | Can sustain a product codebase over years |
| Systems thinking | v2 + indexes + TX + clients | High | Designs for failure modes, not only happy path |
| Product thinking | Role×surface; confirm/reopen; líder web-only | High | Ships UX shaped by operational roles |
| Legacy evolution | v1 coexistence | High | Improves systems without rewrite theater |
| Debugging under prod | Brevo incident | High | Follows evidence to third-party config |
| Honesty / quality bar | Open sendmail debt; E2E harness honesty; accepted risk | High | Does not launder status |
| Cross-layer PE | `48a67f8` | High | Coordinates API+web+mobile in one change |
| Ops awareness | Migrate flags, rollback docs | Medium-High | Thinks beyond localhost |
| Testing discipline | Many unit tests; known gaps | Medium | Tests where invested; known blind spots |
| Seniority label | — | N/A | **Do not infer title from repo alone** |

---

## PART 12 — Ten strongest engineering stories

1. **v2 without rewrite** — Situation: live v1. Constraint: no data loss. Decision: version flag. Files: `solicitud-lifecycle.ts`, `workflow-v2.md`. Commit: `48a67f8`. Answers: “How do you evolve production schemas?”
2. **Idempotency as client contract** — COMMIT: `48a67f8`. Answers: mobile reliability.
3. **Optimistic concurrency + compensate** — `workflowRevision`, `compensateTicketIfEventMissing`.
4. **Migrate-only unique indexes** — handoff 2026-08-23. Answers: ORM footguns.
5. **Dual auth for native** — `extractAuthToken`, `7ff15ba`.
6. **Field vs command mobile** — `session-policy.ts`.
7. **Brevo IP P0** — incident + `a76951f`.
8. **Open sendmail-after-201** — honesty about partial failure.
9. **Health CORS + App Links** — D2 measured fix.
10. **Defer Zod / reject majors** — migration risk control.

---

## PART 13 — CV claims (candidates)

Format: bullet · evidence · confidence · scope · overclaim risk · ownership tag

1. Evolved an institutional IT helpdesk from a 2024 JS MVP into a TypeScript monorepo with web, API, and Expo clients — **E3** · Repo+Git · overclaim if “alone invented SENA process” · Git-supported continuity  
2. Landed a second-generation ticket workflow with explicit transitions, Idempotency-Key, optimistic concurrency, and append-only history while keeping v1 tickets — **E2+E3** · `48a67f8` · Repository-supported  
3. Coordinated workflow v2 across API, React web, and React Native clients in the same release line — **E3** · Cross-layer · Repository-supported  
4. Implemented dual authentication (httpOnly cookie for web, Bearer for native/Socket) — **E2+E3** · `extractAuthToken` · Repository-supported  
5. Scoped mobile to field roles and blocked líder sessions at policy layer — **E2** · `session-policy.ts` · Repository-supported  
6. Designed migrate-gated unique indexes for case codes and workflow operation IDs (no Mongoose autoIndex) — **E2** · runbooks · Repository-supported  
7. Diagnosed and resolved a production password-reset outage caused by Brevo blocking Render egress IP — **E2+E3** · incident · Git-supported fix  
8. Documented and deferred a create-ticket partial-failure (201 then sendMail) instead of shipping silently — **E2** · incident open · Repository-supported  
9. Built technician offline draft/sync for workflow mutations — **E2** · `offline-sync.ts` · Repository-supported  
10. Added production smoke tooling and post-deploy manual smoke workflow — **E2+E3** · scripts/CI · Repository-supported  
11. Enforced fail-closed workflow boot in production when transactions or historial unique index are unavailable — **E2** · `workflow-runtime.ts` · Repository-supported  
12. Sequenced Zod validation as a dedicated phase after TypeScript migration to control risk — **E2+E3** · decisions · Repository-supported  
13. Rejected concurrent major framework upgrades during a large TS migration — **E2** · decisions · Repository-supported  
14. Hardened health CORS and Android App Links static JSON for production browsers/devices — **E3+E4** · D2 · Measured  
15. Maintained conventional commits, husky typecheck gates, and Vitest suites for server/client/mobile — **E2+E3** · CI · Repository-supported  
16. Wrote operational runbooks for index migration and rollback — **E2** · docs · Repository-supported  
17. Patched reachable dependency highs without force-major on nodemailer; recorded accepted risk — **E2+E4** · triage · Repository-supported  
18. Introduced shared `@miayuda/contracts` package as a cross-client typing direction — **E3** · `7ff15ba` · Repository-supported (adoption still partial)  
19. Built role-based web SPA with feature architecture (FSD-lite) — **E3** · `4391878` · Repository-supported  
20. Iterated transactional email providers (Gmail→Resend→Brevo) under delivery constraints — **E3** · commits · Repository-supported  
21. Separated local simulation integration tests from production Atlas via URI guards — **E2** · integration config · Repository-supported  
22. Published CHANGELOG/RELEASE_NOTES with explicit rollback SHAs for workflow v2 — **E2** · CHANGELOG · Repository-supported  

**Avoid as CV sole bullets:** “senior”, “5k users”, “HA”, “fully migrated Flutter”, “E2E complete”, “security PASS”.

---

## PART 14 — LinkedIn-oriented claims (evidence-backed tone)

1. I work on systems where correctness under retries matters as much as features — idempotent workflow mutations, optimistic concurrency, append-only history.  
2. I prefer evolving production systems with compatibility gates over rewrite theater.  
3. I treat email providers, CORS, and deep links as architecture, not “ops later.”  
4. I scope mobile to field jobs and keep command workflows on web when density matters.  
5. I document open defects and accepted risks instead of painting gates green.  
6. I sequence migrations (types → validators → clients) to keep blast radius small.  
7. I design database uniqueness as an operational migrate, not an ORM surprise.  
8. I build full-stack changes that land API + web + mobile contracts together.  
9. I debug production with smoke scripts and incident write-ups, not guesswork.  
10. I care about fail-closed boots when transactional prerequisites are missing.  
11. I use dual auth models when browser and native clients have different constraints.  
12. I keep legacy close paths alive until the new state machine covers the fleet.  
13. I invest in runbooks and rollback SHAs when releasing workflow changes.  
14. I reject “audit PASS” when a reachable high remains — accept risk explicitly.  
15. I treat test strategy honestly: mocks are fast; they also hide side-effect bugs.  
16. I build institutional software with role-shaped UX, not generic CRUD admin.  
17. I leave successor mobile clients when the prototype stack no longer matches the API.  
18. I write for the next operator: HITL flags, expected DB name, no secret logging.

---

## PART 15 — Portfolio case-study skeleton (factual)

1. **Problem:** Fragmented institutional IT support (product.md).  
2. **Users:** funcionario, tecnico, lider.  
3. **Constraints:** Existing tickets; institutional deploy; mid-range Android; email SaaS.  
4. **Initial architecture:** 2024 JS Express/React cookie desk.  
5. **What changed:** TS/Zod, Brevo, Expo, workflow v2, hardening.  
6. **Why:** Correctness, field mobility, deliverability, release confidence.  
7. **Evolution:** Chapters A–H above.  
8. **Key decisions:** D1–D15.  
9. **Hard problems:** Part 5.  
10. **Incidents:** Part 6.  
11. **Trade-offs:** Dual workflow, dual auth, accepted nodemailer, lean tests.  
12. **Current state:** Deployed web+API+Expo; v1+v2; measured smoke; gaps in E2E/obs/load.  
13. **Limitations:** No HA claim; no user metrics; E2E v2 harness; open sendmail debt; App Links debug-only.  
14. **Improve next:** Fix sendmail-after-201; implement E2E journey in non-prod; release fingerprints; metrics.  
15. **Lessons:** Compatibility is a feature; third parties are architecture; honesty is a quality bar.

---

## PART 16 — Do not say this

- Production-grade / enterprise-ready / HA / 99.9% / zero downtime  
- 5,000+ active users / scaled to 50k–500k  
- Fully migrated Flutter → React Native  
- Real-time to clients (Socket server exists; web polls; mobile no socket client)  
- E2E workflow v2 verified / green  
- Security audit PASS  
- All lists paginated / fully indexed optimally  
- Architected solely by one person as organizational fact (Git identity ≠ HR)  
- Staging-gated continuous delivery  
- Observability complete (APM/p99)  
- Media authorization proven in production against real IDOR suite  
- App Links production-ready (debug fingerprint only)  
- “Lean Mode means no DB ever” (integration now uses simulation Mongo)

---

## PART 17 — What we are missing (repo cannot prove)

| Missing | Why it matters | External testimony? | Exclude from public claims? |
|---------|----------------|---------------------|-----------------------------|
| Interview/discovery records | Ownership of product definition | Yes | Yes until provided |
| Active users / ticket volume | Impact story | Yes | Yes |
| Business outcomes | Hiring impact | Yes | Yes |
| Who ran Atlas migrates | Ops ownership | Yes | Soften wording |
| Load/latency SLOs | Scale claims | Measure or exclude | Exclude |
| Pair/AI contribution outside git | Authorship purity | Yes | Don’t overclaim solitude |
| Institutional go-live date | Narrative | Yes | Optional |
| Student vs instructor mapping | Domain nuance | Yes | Optional |

---

## PART 18 — Recruiter view by role

### A. Product Engineer
**Compelling:** role×surface, confirm/reopen, líder web-only, field offline, incident→product trust, cross-layer v2.  
**Weak:** no user research artifacts; no metrics.  
**CV:** workflow evolution + field/command. **Portfolio:** chapters + incidents. **Interview:** trade-offs D6–D9, I1–I2.

### B. Full-Stack Software Engineer
**Compelling:** TS migration, dual auth, Expo+React+Express, CI/smoke, indexes, concurrency primitives.  
**Weak:** CD gates, coverage %, observability.  
**CV:** cross-layer commits, integrity. **Portfolio:** architecture evolution. **Interview:** atomicity + idempotency deep dive.

### C. AI Product Engineer / Applied AI
**Contribution:** almost none as ML system — **irrelevant** as AI product.  
**Transferable:** structured workflows, contracts, evaluation-like honesty about gates, agent-context docs exist but are process tooling not product AI.  
**Do not force MiAyudaTIC into an AI portfolio core**; use as systems/product engineering evidence beside AI work.

---

## PART 19 — Interview attack surface

| Question | Evidence-based answer | Guarantees | Does not guarantee | Follow-up | Honest response |
|----------|----------------------|------------|--------------------|-----------|-----------------|
| How do transactions work? | `getWorkflowAtomicityStrategy` | Prod requires TX | Local may compensate | What if insert fails after update? | Compensation or 409 if later mutation |
| Is idempotency perfect? | Unique (solicitud, operationId) + hash | Replay safe if same payload | Different payload same key → 409; client must send key | Multi-tab same key? | Same |
| Why keep v1? | Live tickets | No mass rewrite | Dual forever | When delete v1? | When fleet empty / planned |
| Cookie CSRF? | httpOnly cookie | XSS reduced | Full CSRF analysis incomplete | SameSite? | Check cookieOptions; don’t overclaim |
| Media private? | Domain + unit tests | Unit behavior | Live IDOR matrix pending | Cloudinary signed URLs? | Inspect config; don’t invent |
| Offline complete? | Técnico queue yes | Field técnico drafts | Funcionario offline create no | Conflict merge? | Flags exist; keep humble |
| E2E? | Harness | CORS smoke | Journey not implemented | Why? | Creds + destructive gates + not built |
| Scale? | Indexes + rate limit | Write integrity aids | No load numbers | 5k users? | Not measured |
| Security PASS? | No | Accepted nodemailer | — | Why keep 8.x? | Major avoid; Brevo primary |
| Who built it? | Git identity continuous | Commits by that author | Sole institutional ownership | Team? | **HUMAN TESTIMONY REQUIRED** |

---

## PART 20 — Engineering identity this repository supports

This repository shows an engineer (or engineering identity) who repeatedly **owns end-to-end institutional product software**: from a working 2024 MVP through type-safe migration, deployment hardening, native field clients, and a correctness-oriented workflow redesign. The strongest pattern is not novelty of stack choices, but **judgment under constraint**—deferring scope, rejecting risky upgrades, keeping legacy tickets alive, fail-closing production when prerequisites are missing, and writing down open defects and accepted risks. Cross-layer commits demonstrate the ability to land API, web, and mobile contracts together. Production incidents show debugging that reaches third-party configuration, not only application code. The repository does **not** by itself prove interviews, user metrics, HA, or a seniority title; what it does prove is sustained, multi-year, multi-surface product engineering with unusual honesty about what is still unfinished.

---

*End of forensics document. Companion: `MIAYUDATIC-EVIDENCE-MATRIX.md`.*
