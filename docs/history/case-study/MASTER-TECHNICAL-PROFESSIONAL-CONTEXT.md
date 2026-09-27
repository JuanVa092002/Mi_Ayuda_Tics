# MIAYUDATIC — MASTER TECHNICAL & PROFESSIONAL CONTEXT

**Audience:** CV, LinkedIn, portfolio, case study, technical and product interviews.  
**Captured:** 2026-09-22. **Code HEAD (chore):** `335a9a0`. **Production `origin/master` at last verified deploy:** `b503755` (health CORS + public `assetlinks.json`).  
**Legend:** **Repo** = source/docs in this monorepo. **Git** = commit history. **Measured** = command or HTTP this project actually ran. **Testimony** = your stated role; not proven by Git. **Inference** = reasonable, not proven.

Git author identity is a single username (`JuanVa092002`, ~75 commits). **That is not proof that one person did requirements, interviews, or every layer.** Do not convert a single Git author into “I built 100% of the system alone.”

---

## 1. Executive Summary

MiAyudaTIC is an **institutional IT-support desk** for SENA formation centers (product docs name **CTPI / Regional Cauca**). It is **deployed**: web SPA on Vercel, API on Render, MongoDB (Atlas inferred from `mongodb+srv` and runbooks), media via Cloudinary/local storage, email via Brevo with SMTP fallback.

It is **not** a greenfield architecture that started as workflow v2 + Expo + TypeScript. Git shows a **2024-10-30** JavaScript Express/Mongo/React snapshot, a **2026** TypeScript/Zod/quality migration, then **Expo mobile**, then **workflow v2** (2026-09-07) that **coexists with v1** instead of rewriting tickets.

**What the system actually is today (repo + measured):**

- Three roles: `funcionario`, `tecnico`, `lider`.
- **Field vs command:** Expo native for funcionario/técnico; web for liderazgo and catalogs. Líder is **blocked on mobile** in app policy.
- Tickets are a **state machine**, not CRUD: v2 has assign/start/update/wait/reply/partial/resolve/confirm/reopen/cancel, **Idempotency-Key**, payload hash, **optimistic `workflowRevision`**, **append-only `HistorialSolicitud`**, Mongo **transactions required in production**.
- Tests exist and many pass locally; **E2E v2 journey is not implemented**; CI does not run integration, Playwright, audit, or post-deploy smoke automatically.
- Security gate: **FAIL WITH ACCEPTED RISK** (nodemailer 8.x). App Links: **debug fingerprint only**.

**Honest one-liner for interviews:**

> A deployed institutional helpdesk that evolved from an MVP into web + native mobile with a transactional workflow, dual-generation tickets, and production safeguards — still with real reliability, E2E, and observability gaps.

---

## 2. Original Business Problem

**Product docs (`docs/product.md`):** support ran on WhatsApp, paper, and oral memory. No case codes, no technician queue, no leader metrics, no fast photo report from the classroom.

**Your testimony:** hardware/software failures required **in-person** request; funcionarios, instructors, and students were affected; goal was to **digitize** reporting from a phone with photos and status, and let technicians work in the field.

**Repo does not contain** recorded interviews, transcripts, or a signed requirements pack from 2024. Discovery is **Testimony** plus later product memos (2026 language). Do not cite Git as proof of those meetings.

---

## 3. Users & Operational Context

| Role | Job (docs) | Surface **in code** | Surface **not** in code |
|------|------------|---------------------|-------------------------|
| Funcionario | Report with evidence; know someone will attend | **Web:** create + read-only history. **Mobile:** create, history, detail, **v2 reply/confirm/reopen** | Web funcionario does **not** wire v2 requester mutations (API helpers exist, no page import) |
| Técnico | Assigned cases, evidence, close with trail | **Web:** assigned/resolve tables (v2 + v1 `solucionCaso`). **Mobile:** home, case, resolver; **offline draft/sync for v2 technician actions** | Push notifications: stubs. Socket client: none |
| Líder TIC | Assign, approve technicians, catalogs, stats | **Web only** (`RequireRole` lider). Assign/reassign/cancel, technicians, ambientes, tipos, estadísticas | Mobile: `lider-not-supported`; token **not persisted** even if API login succeeds |

**Why two surfaces (product + code, not “we wanted an app”):**

- Classroom and field need **camera, mid-range Android, session restore**.
- Queue, catalogs, technician approval, and stats are **desktop density**.
- Blocking líder on mobile is an **operational product decision**, not a missing screen only.

Potential users (funcionarios/instructors/students at a center) ≠ **measured active users**. No analytics of 5k/50k users in repo.

---

## 4. Product Evolution

| Era | Evidence | Product shape |
|-----|----------|----------------|
| **2024-10-30** | Git `a00655c` “MiAyudaTics v1.0” | JS Express: auth, solicitudes, solucionCaso, storage, tecnicos, ambientes, gráficas, password recovery. Models: solicitud, consecutivo, usuarios, etc. |
| **2024 snapshots** | Git V1/V2/v4 commits same day | Snapshot dumps, not a documented roadmap |
| **2026-04** | Openspec phase 1–2.5, tag `v2.0.0-backend-ts-migration` | Quality: Husky, ESLint, TS migration, Zod after deferred ADR, pnpm |
| **2026-04/05** | Git email commits | Nodemailer/Gmail → Resend → **Brevo** (portfolio/email deliverability) |
| **2026-06** | Git deploy harden; Expo tree `9378020` | Institutional release hardening; **native Expo** in monorepo |
| **2026-06-14** | Incident doc | Production forgot-password: Brevo IP block — **ops + code logging/SMTP fallback** |
| **2026-07** | Openspec mobile funcionario UX | Productized field UX (not Flutter) |
| **2026-08** | Unique `codigoCaso`; sendmail-after-201 incident **open** | Integrity + email/HTTP coupling debt |
| **2026-09-07** | Git `48a67f8`, `0e4e8a4` | **Workflow v2** + leader web queue + technician mobile |
| **2026-09-15** | D2 `b503755` measured | Health CORS + JSON App Links debug file live |

**Flutter:** on disk `mobile_flutter/MBO_ULT` (`mesa_servicio_ctpi`), **zero tracked files**, nested `.git`, hardcoded **old** Render host. Treat as **legacy prototype / UX reference**, not a git-proven “complete migration.” Expo is a **new app** (2026-06-13+) that **reimplements** field flows against the current API.

---

## 5. SDLC Reconstruction

| Stage | What we can say | Evidence class |
|-------|-----------------|----------------|
| Problem | Fragmented institutional support | Docs + Testimony |
| Discovery / interviews | You met líder TIC and technicians | **Testimony only** |
| Requirements | Roles, photo, codes, assignment exist in 2024 models | Repo + Git; **who wrote the spec** = Testimony |
| Product design | SENA colors, JTBD, field vs command | `docs/product.md` (written later than 2024) |
| Architecture | Feature folders, FSD-lite web, Expo features | 2026 scaffolding commits + current tree |
| Tech stack | Express, Mongo, React/Vite, Expo, pnpm, Zod | Repo |
| Implementation | Full stack in repo | Repo; ownership split = Testimony |
| Testing | Vitest server/client/mobile; Playwright CORS; integration simulation | Measured 2026-09-15 |
| Deployment | Vercel + Render live | Measured smoke; auto-deploy **inferred** from docs/D2 |
| Feedback | Incidents, openspec, UX change archives | Repo |
| Iteration | TS, Zod, Brevo, Expo, v2, CORS/assetlinks | Git |
| Architectural evolution | Dual workflow generations; dual auth; dual mobile stacks | Repo |

**No** complete original specification from 2024 is in git.

---

## 6. Architecture Evolution

### Initial (git 2024)

Monolith-ish **JS** Express + Mongoose, React client, cookie session, `Solicitud` + `SolucionCaso` as the resolution path, local/Cloudinary storage, Socket.IO on server.

### Intermediate (2026 H1)

TypeScript, Zod, Vitest “lean” mocks then later **real local simulation** for integration, Brevo, deploy docs, **Bearer for native**, Expo auth-first then tickets, Flutter frozen.

### Current (2026-09)

Same API host; **v1 + v2 tickets**; historial + operationId index; transactions-or-fail in prod; web FSD-lite; Expo funcionario+técnico; líder web-only; health CORS; static `assetlinks.json`.

**Costs:** two state vocabularies; two close paths (`solucionCaso` vs v2 actions); two mobile codebases on disk; cookie vs Bearer; docs lag (product still says “auth shipped; core v2”).  
**Not automatically “better”:** v2 adds correctness machinery and **operational complexity** (index migrate, 503 if Atlas not ready, client Idempotency-Key).

**Listen host:** `server.listen(port)` without `0.0.0.0` — docs claim Render bind; live API works (**inferred** Node default / platform).

---

## 7. Backend

**Layout:** `server/src/core` wiring; `features/{auth,tickets,users,shared}`; `shared` middleware (session, rol, rate limit, Helmet, CORS).

**Not a thin CRUD API.** Ticket mutations for v2 go through `applySolicitudWorkflowAction` (`solicitud-workflow.ts`): authz → transition → idempotency → conditional revision update → historial insert → compensation or transaction.

**Legacy still live:** `PUT .../asignarTecnico` v1 branch (no Idempotency-Key), `POST /api/solucionCaso/:id`, `DELETE /api/solicitud/:id` (deprecated vs cancel).

**Email:** Brevo REST preferred; SMTP `sendViaSmtp` / nodemailer 8.0.11. **Create ticket:** persist then `sendMail`; incident **201 then second response** still documented **OPEN**.

**Notifications:** server can emit; web **polls 30s**; mobile **no poll**.

---

## 8. Frontend

- Vite 8, React 18 (**major React 19 rejected** in 2026-04 decision log).
- FSD-lite: `app → pages → features → shared`; `RequireRole`; axios `withCredentials`; **localhost Bearer** in `sessionStorage`.
- Leader inbox / technician tables consume v2; funcionario web is **create + historial**, not full requester v2 UI.
- Realtime: **no** Socket.IO client.
- Chunk size warning on production build (~686 kB JS, measured 2026-09-15).

---

## 9. Mobile

**Product reason:** report and attend **without walking to a desk**; camera; técnico in the building; líder stays on a large screen.

**Expo 56 / RN** official. Session: SecureStore JWT, `verify-token` restore, unapproved técnico and líder gated.

**Offline:** technician **file-backed draft queue + replay** of v2 actions; funcionario **in-memory form draft only** (not offline create). Architecture.md “offline not implemented” is **stale** for técnico.

**Flutter:** UX ancestor, **not** the shipped client; different API host in Dart.

---

## 10. Database

**Entities (models):** Usuario, Solicitud, SolucionCaso, HistorialSolicitud, ConsecutivoCaso, TipoDeCaso, AmbienteFormacion, Storage, …

**codigoCaso:** `yyyy-MM` + `$inc` sequence, padded; unique index **migrate-only** (no schema `unique` / no autoIndex) — runbook HITL for Atlas.

**HistorialSolicitud:** app **insert-only**; unique sparse `(solicitud, operationId)`.

**workflowRevision:** optimistic concurrency integer.

**Atomicity:** production/`mongodb+srv` → transactions **required**; local standalone → conditional update + compensate if historial insert fails.

**Design risks (repo):** list endpoints `Solicitud.find(...)` **without `.limit`** in `solicitud.ts` (historial path **has** limit). Dual documents v1 `solucion` vs v2 events. Email after persist (partial success).

---

## 11. Authentication & Authorization

| | Web | Mobile | API |
|--|-----|--------|-----|
| Credential | httpOnly cookie `token` (prod) | Bearer in SecureStore | JWT |
| Local exception | Bearer + cookie | Bearer only | Extract: Bearer → cookie → socket `auth.token` |
| Roles | Route `RequireRole` | Stack guards + no persist líder | `checkRol` + resource checks (owner / assigned técnico) |
| Account | Status middleware | Pending técnico | Approval of technicians (web líder) |
| Reset | Email + token routes | Same API | Incident: Brevo IP |

**Resource-level media:** domain `actorCanAccessStorage`; unit tests with **mocks**. Live IDOR matrix: **pending** (baseline).

---

## 12. Workflow V2

**Why (docs + code):** v1 four states (`solicitado → asignado → pendiente → finalizado`) and `SolucionCaso` cannot express wait-for-user, partial vs total, confirm/reopen, or an audit log. v2 **does not rewrite** old rows (`workflowVersion !== 2` → legacy).

**v2 states:** `nuevo`, `asignado`, `en_progreso`, `esperando_usuario`, `resuelto`, `cerrado`, `cancelado`.

**Who:** líder assign/reassign/cancel; técnico start/update/wait/partial/resolve (must be assigned técnico); funcionario reply/confirm/reopen (must be ticket owner).

**Integrity:** client `Idempotency-Key` 8–80 chars; SHA-256 payload hash; replay 200 `idempotent: true`; mismatch 409; unique operationId; revision filter; prod transactions + index assert on boot.

**Not proven:** concurrent two-winner tests under Atlas; full cross-client E2E; that every list still shows mixed v1+v2 in production data (logic exists; journey unrun).

---

## 13. Testing

**Measured 2026-09-15 (dirty chore tree):** server unit 151; integration 12 (local sim); client 59 (includes WIP); mobile 265; Playwright 4 pass / 19 skip.

**Coverage:** server ~34% statements; client ~53% (WIP inflated). **No CI coverage gate.**

**Strong:** domain workflow tests, idempotency, atomicity branches, some media/CORS, mobile unit volume.

**Weak / obsolete:** Playwright login/solicitud skipped (creds); **workflow-v2.spec.ts harness throws “Not implemented”**; `e2e-ticket-lifecycle.sh` is **v1 destructive**; lean-mode README vs real Mongo integration; format:check historically FAIL.

**Regression risk:** v1/v2 dual paths; list unbounded; sendmail-after-201; clients must send Idempotency-Key.

---

## 14. CI/CD & Deployment

**Pipeline exists:** GitHub Actions typecheck/build/unit (server, client, mobile). **Not a full release strategy:** no lint/audit/integration/e2e/coverage; smoke is **manual** `workflow_dispatch`; deploy is **platform auto-deploy** (inferred), not a gated production job.

**Docker:** Node 22 Alpine image in repo; Render may or may not use it (**not re-verified**).

**Rollback:** documented (D2 dashboard IDs + historical v2 SHA). Dashboard rollback **lost on next master push**. Do not drop historial unique index.

**Staging:** E2E env names exist; **no demonstrated dedicated staging environment** in this review.

---

## 15. Reliability & Observability

**What helps reliability:** health JSON; workflow fail-closed in prod (no silent standalone); unique indexes; idempotency; smoke 17/17 read-only; cookie+CORS allowlist; media 401/404 tests.

**What blocks “production-grade” as a claim:** no APM/metrics/p99; no requestId everywhere; Free Render **spin-down** (platform constraint, **inferred**); open sendmail double-response; nodemailer accepted risk; E2E v2 absent; CI ≠ production proof; observability dashboards **not** built.

---

## 16. Security

| Item | Severity | Status |
|------|----------|--------|
| Nodemailer 8.x (2 highs); SMTP fallback | HIGH (deps) | **FAIL WITH ACCEPTED RISK**; raw option claimed unreachable |
| Live media IDOR | — | **Not demonstrated** (unit mocks only) |
| Health CORS / assetlinks HTML | was HIGH for browser/App Links | **Mitigated live** (measured 2026-09-15) |
| Path traversal local media | — | Unit test 400 |
| Rate limit / Helmet / CORS allowlist | — | Present in code |
| CSRF | MEDIUM? | Cookie session; **no dedicated CSRF token analysis completed here** |
| Secrets in git | — | Do not claim clean without a secrets scan report |
| Mobile Expo lockfile highs | HIGH count | Out of scope of workspace prod audit |
| App Links release certs | MEDIUM (integrity) | Debug only |

Do not list CVEs you did not re-fetch beyond triage doc.

---

## 17. Performance & Scalability

| Question | Class |
|----------|--------|
| Health/login latency, p95 | **NO MEDIDO** |
| Load 10–100 users | **NO MEDIDO** (orchestrator Fase 6 not run) |
| List `find` without limit | **Repo** — will hurt first as ticket volume grows |
| Populate N+1 | **INFERIDO** — populate exists; not profiled |
| 5k / 50k / 500k users | **NO MEDIDO**. Socket unused by clients. Rate limit exists, unknown thresholds vs load. Unique indexes help writes, not list scans. |
| Client bundle ~686 kB | **Measured** build |

Honest scale sentence: *the workflow write path is designed for correctness at modest institutional volume; list APIs and missing metrics would fail a 50k-user story.*

---

## 18. Important Engineering Decisions

1. **v2 beside v1, no mass migrate** — correctness for new tickets; dual-read forever.  
2. **Idempotency client-supplied, not server UUID** — mobile retries; clients can get 400 if they forget the header.  
3. **Transactions mandatory in prod; compensate locally** — safe Atlas; extra runtime 503s.  
4. **Migrate-only unique indexes, no autoIndex** — ops discipline; human-gated Atlas.  
5. **Cookie web + Bearer mobile** — native-friendly; two session bugs classes.  
6. **Líder web-only** — simpler mobile; API may still login líder.  
7. **Expo instead of shipping Flutter** — current API + TS alignment; Flutter unused in git.  
8. **Zod after TS** — reduced blast radius; two validator eras.  
9. **Reject React 19 during TS migration** — stability; later dual React (web 18 / mobile 19).  
10. **Brevo over Gmail/Resend** — deliverability; IP allowlist incident.  
11. **Vitest mocks then simulation DB** — speed vs fidelity.  
12. **Health before Helmet + later CORS helper** — probe vs browser.

Each: problem → trade-off → debt as above.

---

## 19. Product Decisions

- Institutional desk, not Zendesk.  
- Photo + case code as trust.  
- Technician approval workflow.  
- Stats by ambiente/mes (web).  
- Field mobile vs command web.  
- Confirm/reopen and wait-for-user (v2) match real back-and-forth, not one-shot “close.”  
- Do not ship Flutter.

---

## 20. Problems & Lessons

| Problem | Cause | Detection | Solution / status | Lesson |
|---------|-------|-----------|-------------------|--------|
| Forgot-password 500 prod | Brevo unknown Render IP; SMTP 535 | Prod + incident | Allow IP, CORS/CLIENT_URL, SMTP fallback | Email SaaS ≠ “configured in .env” |
| Create 201 then sendMail error | Persist then email; double `res` | Phase C sim | **OPEN** | Side effects after commit need outbox or catch-after-respond |
| Health CORS / App Links HTML | Mount order; SPA rewrite | Playwright + GET | D2 deploy | Static well-known ≠ SPA |
| Duplicate case codes | Missing unique index | Handoff | Migrate-only unique | Don’t rely on app uniqueness |
| Dual workflow | Evolution not rewrite | Design | v2 + 409 on wrong API | Compatibility is a feature and a tax |
| Nodemailer highs | Stay on 8.x | pnpm audit | Accepted risk | Security PASS ≠ deploy |

---

## 21. Evidence Matrix

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Built from (near) zero in this repo | Root commit adds models/routes/controllers | Git | **CONFIRMADO** for *this* git history; pre-git paper process = Testimony |
| Led requirements / TIC meetings | None in repo | — | **REQUIERE TESTIMONIO** |
| Designed architecture | Scaffolding, ADRs deferred, architecture.md | Git + docs | **PARCIALMENTE** (docs often after code) |
| Backend in repo | `server/` | Repo | **CONFIRMADO** as codebase; individual authorship = Testimony |
| Frontend in repo | `client/` | Repo | Same |
| Mobile Expo in repo | `mobile/MiAyudaTIC-Mobile` from 2026-06-13 | Git | **CONFIRMADO** existence; “I implemented all screens” = Testimony |
| Flutter→RN complete migration | Untracked Flutter; Expo new tree | FS + Git | **NO** — reimplementation / successor |
| Workflow v2 + idempotency + concurrency | Domain + tests | Repo | **CONFIRMADO** in code; prod Atlas tx **INFERIDO** by runtime gates + D2 not proving tx |
| Deployed production | Smoke 17/17; live CORS/assetlinks | Measured | **CONFIRMADO** *deployed* |
| High availability / SLO | — | — | **NO** |
| 5k potential/active users | ICP text only | Docs | **REQUIERE TESTIMONIO** for potential; active **NO MEDIDO** |
| Full SDLC participation | Openspec/phases in 2026 | Docs | **PARCIALMENTE**; 2024 interviews = Testimony |
| E2E v2 validated | Harness skip | Repo | **NO** |
| Security hardened | Mixed | Baseline | **PARCIALMENTE** |
| Title “Líder de Proyecto y Desarrollador Full Stack” | — | Testimony | **REQUIERE TESTIMONIO** |

---

## 22. Professional Value

Evidence supports **product-shaped engineering** (roles × surfaces), **backend correctness work** (state machine, idempotency, indexes), **full-stack delivery** (web+API+mobile+cloud), **ops learning** (email IP, CORS, rollback docs), **not** SRE/HA, **not** load-tested scale, **not** complete E2E, **not** automatic “Principal” or “I alone.”

Strongest interviewable craft: **preserving correctness while the product evolved** (v1+v2, dual clients, migrate-only indexes).

---

## 23. Interview Stories

Use **we / the system** unless you answer the questions in §26.

### A — Workflow v2 without rewrite  
**Context:** Live tickets in v1. **Problem:** Need confirm/wait/audit/idempotency. **Decision:** New version flag, no mass migrate. **Implementation:** `applySolicitudWorkflowAction`, historial, revision, tx. **Trade-off:** Two machines forever. **Result:** New creates are v2; old APIs 409 on v2 tickets. **Lesson:** Compatibility is an explicit product feature.

### B — Forgot password in production  
Brevo IP + SMTP. Detected in prod. Fix was **configuration + fallback**, not a new feature. Lesson: third-party email is part of the architecture.

### C — Dual auth for web vs native  
Cookies vs Bearer vs SecureStore; líder blocked only in the app. Lesson: identity is a **cross-surface** design.

### D — 201 then email failure (**open**)  
Honesty story: knowing a bug and **not** claiming it fixed.

### E — Field mobile vs command web  
Camera/offline técnico vs leader queue. Flutter leftover explains **why Expo exists**, not a completed rewrite.

---

## 24. Claims We Can Safely Make

- Institutional helpdesk for SENA-style centers, three roles, web + native mobile, deployed on Vercel + Render.  
- Tickets evolved from a four-state v1 path to a transactional v2 workflow with audit history, idempotency, and optimistic concurrency **in code**, with local tests.  
- Production was iterated (email provider, CORS, App Links JSON, unique case codes).  
- You **can** describe participation as Full Stack **if** you pair it with testimony and do not imply Git-proven sole ownership of discovery.  
- “I do not just add features; the system kept old tickets working” is **aligned with the architecture** (still: team vs you = testimony).

---

## 25. Claims We Should NOT Make

- Production-grade / HA / 99.9% / observed at 5k–500k users.  
- E2E v2 passed / full media authorization in production.  
- Complete Flutter→React Native migration.  
- Security audit PASS.  
- I gathered all requirements **because Git shows one author**.  
- Mobile is only a PWA or only auth.  
- Real-time Socket.IO to clients.  
- Staging-gated CD.  
- “All lists are paginated.”  
- Live SHA always equals local chore branch.

---

## 26. Missing Information / Questions

**[HIGH VALUE]**  
1. Which architecture calls (Express vs Nest, Mongo vs SQL, Expo vs Flutter vs staying web-only, cookie vs token) were **yours** vs instructor/peer?  
2. Who else coded, and on which layers, given a **single Git author name**?  
3. Were SENA interviews documented anywhere **outside** this repo?  
4. Is there a real **active user / ticket volume** you may cite (even order-of-magnitude)?  
5. Did you run or approve the **Atlas unique-index** production migrate?  
6. Was workflow v2 your design, a spec you implemented, or pair-designed?  
7. What was the **institutional go-live date** and who was the first real funcionario/técnico?

**[MEDIUM]**  
8. Why Flutter first, and who decided to freeze it?  
9. Who owns Brevo/Cloudinary/Render accounts operationally?  
10. Is the sendmail-after-201 bug still open in **your** current HEAD on purpose?  
11. Any production data incident besides forgot-password and codes?  
12. Student vs funcionario vs instructor: one role in DB — how did the school map people?  
13. Was there a written original SRS in 2024?

**[LOWER]**  
14. Why React 18 on web and React 19 on Expo, and is that a known debt?  
15. Any unpublished metrics (even internal Google Sheet) for tickets/month?

---

## Direct answers

**What did this project actually build?**  
A deployed, role-based institutional incident desk: API + web + Expo, with a second-generation ticket machine that prefers **not losing history or compatibility**.

**Which engineering decisions mattered?**  
v2 coexistence, idempotency + revision + transactions, migrate-only indexes, dual auth, field/command split, Expo successor to Flutter, email vendor reality.

**What problems did it solve?**  
Digitize reporting and assignment with evidence and case codes — **as a product intent**. Repo proves the **software**; it does not prove campus-wide adoption.

**How did it evolve?**  
JS MVP → TS/quality/cloud email → native mobile → workflow v2 → production hardening (CORS, well-known, indexes).

**What does it show about the engineer?**  
Ability to **evolve a live system** and document incidents/runbooks — if your testimony fills discovery and leadership. Git alone shows a **long, coherent codebase** under one author identity.

**What can you defend in a technical interview?**  
Walk `applySolicitudWorkflowAction`, dual clients, why líder is web-only, why Flutter is not “the app,” why E2E v2 is **not** green, why nodemailer is an accepted risk.

**Why is this evidence you can build a real product from zero?**  
Because the **git root is an application**, not a tutorial clone, and the **2026** history is a series of production-shaped constraints (email, indexes, workflow, mobile field). Pair that with **your** discovery story. Do not let the interviewer think the 2026 docs existed in 2024.
