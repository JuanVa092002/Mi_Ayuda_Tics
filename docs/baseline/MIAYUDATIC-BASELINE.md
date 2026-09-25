# MiAyudaTIC — Engineering Baseline

**Current recapture:** 2026-09-15T00:37:00-05:00 (orchestrator Fase 0)  
**Historical capture:** 2026-09-14T10:57:42-05:00 (kept below; do not use as live SHA truth)  
**Scope:** Phase 0 only — audit and measurement. No product, platform, mobile, infrastructure, dependency, or remote configuration changes in this recapture.  
**Evidence policy:** code and executed commands are authoritative. Documentation is a claim until it is corroborated.

This recapture ran on worktree `chore/measured-production-system` at `335a9a0b9f637720542421a38855b987b69dcf92`. That SHA is **not** production. Production `origin/master` is `b503755e63effde3fed6557e3368abf67622a979`. Local command results prove this dirty worktree, not the live deploy, unless a live URL was hit.

---

## Recapture 2026-09-15 — orchestrator Fase 0

### Status legend

- **Verified:** observed in current code or from a command executed for this recapture.
- **Inferred:** reasonable conclusion from static configuration or prior same-day closeout; not re-executed here.
- **Pending:** not exercised or lacks sufficient evidence.
- **Contradicted:** current code or execution disproves a documentation or automation claim.
- **Not executable:** command exists but was not run because it is destructive, needs credentials, or would mutate remotes.

### 0. Git inventory (verified)

| Item | Value |
|---|---|
| Branch | `chore/measured-production-system` |
| HEAD | `335a9a0b9f637720542421a38855b987b69dcf92` |
| HEAD subject | `docs(baseline): record verified d2 rollback id-to-sha map` |
| `origin/master` | `b503755e63effde3fed6557e3368abf67622a979` — `fix(api): apply health cors and public assetlinks` |
| local `master` | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` (behind origin by the D2 commit) |
| merge-base(HEAD, origin/master) | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` |
| `origin/master` commits not in HEAD | 1 (`b503755`) |
| HEAD commits not in `origin/master` | 11 (Phase 0.5 docs/e2e/deps/validate + D2 closeout docs) |
| Remote `origin` | `https://github.com/JuanVa092002/MiAyudaTics_v1.0.git` |
| Canonical GitHub name | **Pending** — `gh repo view` failed in this recapture; do not assert the public rename |
| Extra worktree | `C:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_release-d2` at `b503755` (`release/phase-05-d2`) |
| Node | `v24.16.0` |
| pnpm | `10.34.3` |
| Mobile `packageManager` field | `pnpm@11.5.0` (config drift vs root/CI 10.34.3) |

D2 live SHA mapping in `docs/baseline/PHASE-05-D2-CLOSEOUT.md` (same calendar day, provider APIs) is **inferred for this recapture** (not re-queried via Render/Vercel MCP). Live **behavior** was re-hit below.

### 0.1 Pre-existing dirty worktree (verified; not this recapture)

These paths were dirty **before** this Fase 0 run. They are **not** part of this execution. Do not overwrite. Do not commit with Phase 0.

**Modified tracked:**

- `.atl/skill-registry.md`
- `client/src/features/tickets/index.ts`
- `client/src/pages/admin/AdminSolicitud.tsx`
- `client/src/pages/admin/solicitud/SeguimientoSolicitud.tsx`
- `mobile/MiAyudaTIC-Mobile/src/features/funcionario/historial-intent.ts`
- `mobile/MiAyudaTIC-Mobile/src/features/funcionario/historial-intent.test.ts`

**Untracked:**

- `.agents/`
- `client/src/features/tickets/components/LeaderMediaThumb.tsx`
- `client/src/features/tickets/components/LeaderMediaThumb.test.tsx`
- `client/src/shared/media/ticket-photo.ts`
- `client/src/shared/media/ticket-photo.test.ts`
- `marketing/`
- `video/`
- `skills-lock.json`
- `server/storage/file-1788553837325.jpeg`
- `server/storage/file-1788580905737.jpeg`
- `server/storage/file-1788841391174.png`
- `server/storage/file-1788841424997.png`

**This-execution side effect (reverted):** `pnpm -C mobile/MiAyudaTIC-Mobile validate` rewrote `client/public/.well-known/assetlinks.json` line endings via `sync-assetlinks`. Content diff was empty. File restored with `git checkout --` of that path only. No product semantics changed.

**Files modified by this Fase 0 execution:** `docs/baseline/MIAYUDATIC-BASELINE.md` only.

### 0.2 Architecture actually present (verified unless noted)

- pnpm workspace: `client/`, `server/`, `packages/contracts/`. Mobile is `mobile/MiAyudaTIC-Mobile/` with `--ignore-workspace`.
- Server: Node/Express, Mongoose, Vitest. Client: Vite SPA. Mobile: Expo/React Native native (not WebView).
- Surfaces (from `docs/product.md` + source, corroborated): web = Líder TIC / admin; mobile = Funcionario + Técnico; API = Render; web host = Vercel.
- Workflow v2, RBAC, Idempotency-Key, payload hashing, optimistic concurrency, `workflowRevision`, `HistorialSolicitud`, legacy v1 paths, media/storage exist in server source. Production Mongo transactions are required by `workflow-runtime.ts` when production / `mongodb+srv`; **Atlas transaction capability was not probed in this recapture.**
- HTTP bind: `server/src/index.ts` uses `server.listen(port)` with `process.env.PORT || 8000` and **does not** pass `0.0.0.0`. Docs/rollback claim `0.0.0.0:$PORT`. Live API is reachable (smoke). Explicit host bind remains **inferred / contradicted vs docs**.
- Dockerfile: Node 22 Alpine, `CMD ["node", "dist/index.js"]`.

### 0.3 Services and environments

| Service | Status | Evidence |
|---|---|---|
| Web production | Verified reachable | `https://miayudatics.vercel.app` smoke home + SPA deep link; `/.well-known/assetlinks.json` HTTP 200 `Content-Type: application/json` |
| API production | Verified reachable | `https://miayudatics-v1-0.onrender.com` smoke health `ok` / `connected` |
| Health CORS live | Verified this recapture | no Origin → 200, no ACAO; Origin `https://miayudatics.vercel.app` → 200 + exact ACAO + credentials + Idempotency-Key in allow-headers |
| Mongo Atlas topology | Pending | not inspected |
| Cloudinary / Brevo / Redis live config | Pending | health reports configured flags only; no send/upload journey |
| Mobile device / EAS / Play | Pending | validate debug fingerprint only |
| Render/Vercel live SHA | Inferred from D2 closeout same day | not re-queried via provider APIs in this recapture |

No secrets, tokens, PII, or connection strings captured.

### 0.4 Commands executed this recapture

| Command | Result | Classification |
|---|---|---|
| `pnpm -C server typecheck` | PASS (exit 0) | verified |
| `pnpm -C client typecheck` | PASS | verified |
| `pnpm -C mobile/MiAyudaTIC-Mobile typecheck` | PASS | verified |
| `pnpm -C server test` | PASS — 27 files, **151** tests | verified on **this dirty worktree + chore HEAD**; not `b503755` |
| `pnpm -C client exec vitest run` | PASS — 17 files, **59** tests | includes **untracked** LeaderMediaThumb / ticket-photo tests |
| `pnpm -C mobile/MiAyudaTIC-Mobile test` | PASS — 43 files, **265** tests | includes dirty `historial-intent` tests |
| `pnpm -C server build` | PASS (contracts + tsc) | verified |
| `VITE_BACKEND_URL=http://localhost:8000 pnpm -C client build` | PASS — JS 686.49 kB / 202.67 kB gzip; chunk >500 kB warning | verified |
| `pnpm -C server lint` | exit 0 — **0 errors, 155 warnings** | not a clean lint baseline |
| `pnpm -C client lint` | exit 0 — **0 errors, 2 warnings** (one is untracked `LeaderMediaThumb.tsx`) | not a clean lint baseline |
| `pnpm -C server test:integration` | PASS — 5 files, **12** tests; local simulation | verified; not Atlas |
| `pnpm -C mobile/MiAyudaTIC-Mobile validate` | PASS with warnings: debug fingerprint only; Play/EAS/release pending | verified local |
| `pnpm run smoke:prod` | **17 PASS / 0 FAIL**; recovery check skipped (no `SMOKE_REGISTERED_EMAIL`) | verified against **live** URLs |
| `pnpm run smoke:mobile-api` | **2 PASS / 0 FAIL**; login/verify skipped (no `TEST_EMAIL`/`TEST_PASSWORD`) | verified live health + login preflight |
| `pnpm test:e2e` | exit 0 — **4 passed, 19 skipped, 0 failed** | **not** E2E v2 PASS; skipped ≠ pass |
| `pnpm audit --prod --audit-level high` | FAIL exit 1 — **16** vulns: 3 low, 11 moderate, **2 high** (nodemailer, path `server>nodemailer`) | threshold not changed |
| `pnpm -C server test:coverage` | PASS — stmts 33.79%, branches 23.46%, funcs 23.86%, lines 33.73% | verified; no coverage gate in CI |
| `pnpm -C client test:coverage` | PASS — stmts 53.39%, branches 52.1%, funcs 43.85%, lines 54.98% | includes untracked client WIP files |

**Not re-executed:** `format:check` (historical 2026-09-14 FAIL, 157/173 files). **Not executable here:** `scripts/e2e-ticket-lifecycle.sh` (legacy v1 destructive); workflow-v2 Playwright journey (`Not implemented` + `RUN_DESTRUCTIVE_E2E=false` + production host refused); `migrate:*` remote; Render/Vercel deploys.

Vitest still warns that `vi.mock("morgan")` in `server/src/tests/setup.ts` is not top-level and will become an error in a future Vitest.

### 0.5 Playwright / E2E classification (verified)

| Spec | Class | This run |
|---|---|---|
| `e2e/cors.spec.ts` (4 tests) | safe live CORS/SPA | 4 passed |
| `e2e/cors.spec.ts` health browser | skipped unless `E2E_EXPECT_HEALTH_CORS=true` | skipped (live health CORS now works; flag still unset) |
| `e2e/login.spec.ts` | needs `E2E_LIDER_*` | skipped |
| `e2e/solicitud.spec.ts` | needs `E2E_FUNCA_*` | skipped |
| `e2e/workflow-v2.spec.ts` (16) | harness only; journey not implemented | skipped — **do not declare E2E v2 PASS** |
| `scripts/e2e-ticket-lifecycle.sh` | legacy v1 destructive | not run |

### 0.6 CI, release, rollback

**Verified CI** (`.github/workflows/ci.yml`): push/PR to `main`/`master`/`develop`; Node 22; pnpm 10.34.3; contracts build; server typecheck/build/unit; client typecheck/unit/build; mobile install ignore-workspace + typecheck/unit.

**Verified gaps:** CI does not run lint, format, coverage gates, integration, Playwright, `pnpm audit`, or automatic post-deploy smoke. `post-deploy-smoke.yml` is `workflow_dispatch` only. CI has no deploy/rollback job.

**Inferred deploy:** Render auto-deploys `master` (documented + D2 experience). Vercel Root Directory `client`. Not re-read from dashboards this recapture.

**Rollback:** documented in `docs/rollback-procedure.md` and `docs/baseline/PHASE-05-D2-CLOSEOUT.md`. Dashboard rollback of D2 is lost on the next `master` push. Do not drop Atlas index `uniq_historial_solicitud_operationId`. Do not DELETE tickets.

### 0.7 Observability

**Verified:** `/api/health` JSON with status/uptime/db/Cloudinary/Brevo flags/socket count; Morgan; some JSON logs; workflow `operationId` / `workflowRevision` in domain code.

**Pending / absent:** requestId on every log line; metrics endpoint; p50/p95/p99; Mongo latency; transaction abort counters; idempotency counters; hosted APM. No dashboard claimed.

### 0.8 Security

**Verified:** Helmet, CORS allowlist, rate limit, cookie web auth + Bearer mobile, smoke 401s, storage root not public, unauthenticated local media blocked. Audit: nodemailer 8.x, 2 high advisories, path `server>nodemailer`. Prior human classification: **FAIL WITH ACCEPTED RISK** (review 2026-10-14, owner backend, preferred path Brevo REST). This recapture **re-measured** the audit FAIL; it does **not** re-accept the risk.

**Pending:** BOLA/IDOR live, media authorization matrix, CSRF, secret rotation, App Links **release** fingerprints.

**App Links:** package `com.miayudatics.mobile`; published fingerprint is **debug** `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`. Play/EAS/release **pending**. Do not claim production App Links.

### 0.9 Documentation vs this recapture

| Status | Finding |
|---|---|
| Superseded (was contradicted 2026-09-14) | Live `/api/health` now returns ACAO for allowed Origin; live `assetlinks.json` is JSON not SPA HTML |
| Still contradicted | `server.listen(port)` vs docs `0.0.0.0:$PORT` |
| Still contradicted / incomplete | `docs/security.md`, `docs/operations.md`, `docs/testing.md`, `docs/deployment.md`, `docs/observability.md`, `docs/performance.md`, `docs/decisions/`, `docs/case-study/` **do not exist** |
| Present | `docs/architecture.md`, `docs/product.md`, `docs/workflow-v2.md`, `docs/contracts.md`, `docs/quality-bar.md`, READMEs, CI, rollback |
| Incomplete | `client/README.md` still Vite template; server README “Lean Mode” vs integration Mongo |
| Do not collapse SHAs | chore `335a9a0` ≠ `origin/master` `b503755` ≠ historical Phase 0 `ac5ae74` |

### 0.10 Open risks (current)

1. **P0 accepted (not resolved):** nodemailer 8.x, 2 highs; security gate FAIL WITH ACCEPTED RISK until a later human decision.
2. **P1:** chore HEAD and dirty WIP are not the production tree; local 151/59 tests do not prove `b503755`.
3. **P1:** CI green ≠ lint/integration/Playwright/audit/coverage/smoke.
4. **P1:** E2E v2 journey not implemented; 19 Playwright skips; destructive E2E not run; production refused by default.
5. **P1:** App Links release fingerprints missing; debug-only publication.
6. **P2:** coverage ~34% server / ~53% client; no gate; client number includes WIP.
7. **P2:** observability and load/latency baselines absent.
8. **P2:** Atlas transactions/index presence not re-verified this recapture.
9. **P2:** listen host not explicit `0.0.0.0`.
10. **WIP risk:** leader media / historial-intent / marketing / local storage JPEGs must stay out of release commits.

### 0.11 Gate 0

| Criterion | Result |
|---|---|
| Baseline written | yes — this recapture |
| Pre-existing changes identified | yes — §0.1 |
| Exact command results documented | yes — §0.4 |
| No file loss | yes — product not edited; assetlinks line-ending rewrite reverted |
| Product unmodified | yes |

**Gate 0: PASS.** Do not start Fase 1 until this report is reviewed. Fase 0.5 already ran historically (2026-09-14/15 + D2). The next orchestrator step is a **re-triage**, not a silent re-patch.

### 0.12 What this recapture does not claim

- Production-ready / measured production system.
- E2E v2 PASS.
- Security PASS.
- Scalability.
- Production App Links.
- That local HEAD is live on Render/Vercel.

---

## Historical capture 2026-09-14

**Captured:** 2026-09-14T10:57:42-05:00  
**Scope:** Phase 0 only — audit and measurement; no product, platform, mobile, infrastructure, dependency, or remote configuration changes.  
**Evidence policy:** code and executed commands are authoritative. Documentation is a claim until it is corroborated.

> Frozen snapshot. HEAD at that capture was `ac5ae74` = then-`origin/master`. Live production on 2026-09-15 is `b503755`. Do not quote §1–§5 numbers as current without the recapture table above.

## Status legend

- **Verified:** observed in current code or from a command executed for this baseline.
- **Inferred:** a reasonable conclusion from static configuration or documentation, not verified in a deployed runtime.
- **Pending:** not exercised or lacks sufficient evidence.
- **Contradicted:** current code or execution disproves the documentation or automation claim.

## 1. Commit and branch

| Item | Baseline value |
|---|---|
| Commit at audit start | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` |
| Commit subject | `fix(web): allow local vite origin against production api` |
| Commit author date | `2026-09-08T00:49:41-05:00` |
| Branch at audit start | `master` tracking `origin/master` |
| Local baseline branch | `chore/measured-production-system` |
| Remote `origin` | `https://github.com/JuanVa092002/MiAyudaTics_v1.0.git` |
| Canonical repository | **Inferred:** the `origin` GitHub repository above |
| Local Node.js | `v24.16.0` |
| Local pnpm | `10.34.3` |

### Worktree integrity

The audit began with **19 pre-existing worktree paths**: 7 modified tracked paths and 12 untracked paths. They include web/mobile work, `pnpm-lock.yaml`, generated local media, and marketing/video directories. They are not attributable to this Phase 0 work and were not edited by it.

The new branch preserves those pre-existing local changes. This document is an uncommitted snapshot because repository policy requires an explicit user request before committing. It therefore records a reproducible baseline but is **not yet a versioned immutable Git artifact**.

## 2. Architecture actually present

### Verified

- The repository is a pnpm workspace with `server/`, `client/`, and `packages/contracts/`. The Expo project at `mobile/MiAyudaTIC-Mobile/` has its own installation flow (`--ignore-workspace`).
- `server/` is Node/Express 5 with Mongoose 8, Zod, Socket.IO, multipart media handling, and Vitest.
- `client/` is a React 18 SPA built with Vite 8 and deployed configuration for Vercel.
- `mobile/MiAyudaTIC-Mobile/` is a native Expo 56 / React Native 0.85 / React 19 application, not a WebView.
- `packages/contracts/` is `@miayuda/contracts`; server uses it. Client and mobile still have local contract representations rather than consuming it directly.
- Web source includes workflow-v2 API, idempotency, retry-policy, leader inbox, and technician UI paths alongside legacy v1 solution paths.
- Mobile source includes a local technician offline draft/sync model. This is implementation evidence only; no device or offline-sync runtime behavior was exercised.
- Backend routes mount under `/api`; `GET /api/health` is mounted before CORS and Helmet in `server/src/core/app.ts`.
- The ticket implementation contains legacy v1 and workflow v2 code: `workflowVersion: 2`, `workflowRevision`, `HistorialSolicitud`, operation IDs, runtime index checks, and transaction/fallback code live under `server/src/features/tickets/`.
- Workflow v2 production requirements are encoded in `workflow-runtime.ts`: a production or `mongodb+srv` runtime requires Mongo transactions and the `uniq_historial_solicitud_operationId` index; it does not silently use the standalone fallback.

### Inferred

- The intended production topology is Vercel (web), Render (API), MongoDB Atlas, Cloudinary, Brevo, and optional Redis for multi-instance Socket.IO. This follows repository docs, environment examples, `server/Dockerfile`, and CI configuration; provider configuration itself was not read or changed.
- `server/Dockerfile` uses Node 22 Alpine and runs `node dist/index.js`; the application source must be checked separately in a later phase to confirm runtime binding behavior in deployed Render.

### Pending

- Actual Render service configuration, deployment hooks, Atlas topology, critical index presence, Cloudinary mode, Brevo reachability, Redis use, and mobile release distribution.
- Production transaction capability was not directly tested. Local integration tests use a guarded local simulation, not Atlas.

## 3. Services and environments

| Service / environment | Baseline status | Evidence |
|---|---|---|
| Web production | Verified reachable during smoke | `https://miayudatics.vercel.app` returned expected home and SPA deep link status |
| API production | Verified reachable during smoke | `https://miayudatics-v1-0.onrender.com/api/health` reported `ok` / `connected` |
| MongoDB in local integration tests | Verified local simulation only | integration environment loader requires `server/.env.test`, pins `NODE_ENV=test`, and rejects non-local simulation URIs |
| MongoDB production topology | Pending | no Atlas inspection or remote transaction probe was performed |
| Cloudinary production configuration | Pending | health/smoke exposed only configured/local status; no storage authorization journey was run remotely |
| Brevo production configuration | Pending | no email-triggering check was run |
| Redis adapter | Pending | optional code exists; active production configuration was not inspected |
| Mobile device runtime | Pending | no emulator, physical device, EAS, or native build was run in this phase |

No secrets, account values, connection strings, tokens, user records, or evidence URLs were captured in this baseline.

## 4. Available commands and test inventory

### Package scripts discovered

- Root: `smoke:prod`, `e2e:ticket`, `smoke:mobile-api`, `smoke:mobile-client`, `test:e2e`.
- Server: typecheck, lint, format check, unit tests, coverage, integration tests, local/mobile smokes, migration scripts, and Cloudinary test script.
- Client: typecheck, lint, format check, unit tests, coverage, and production build.
- Mobile: typecheck, unit tests, validation, development/native build helpers, and deep-link helpers.
- Contracts: build and typecheck.

### Test assets discovered

- Server: 26 default Vitest files; 5 integration Vitest files, including workflow v2, index, production-simulation, legacy create contract, and case-code uniqueness coverage.
- Root Playwright: `e2e/cors.spec.ts`, `e2e/login.spec.ts`, and `e2e/solicitud.spec.ts`.
- Root shell lifecycle: `scripts/e2e-ticket-lifecycle.sh`.

The shell lifecycle script is **legacy/outdated for workflow v2**: it creates a ticket then uses v1-style assign/resolve endpoints without workflow idempotency headers, and it mutates the selected backend. It was not executed.

Playwright's login and funcionario checks are credential-gated smoke tests. They do not prove a full ticket lifecycle and default to production URLs rather than an isolated QA environment.

## 5. Commands executed and exact results

| Command | Result |
|---|---|
| `pnpm -C server run typecheck` | PASS |
| `pnpm -C client run typecheck` | PASS |
| `pnpm -C mobile/MiAyudaTIC-Mobile run typecheck` | PASS |
| `pnpm -C server run test` | PASS — 26 files, 146 tests; Vitest warned that the `morgan` mock is not top-level and will become an error in a future version |
| `pnpm -C server run test:integration` | PASS — 5 files, 12 tests; local simulation only |
| `pnpm -C client run test -- --run` | PASS — 17 files, 59 tests |
| `pnpm -C mobile/MiAyudaTIC-Mobile run test` | PASS — 43 files, 265 tests |
| `pnpm -C server run test:coverage` | PASS — 33.79% statements, 23.46% branches, 23.86% functions, 33.73% lines |
| `pnpm -C client run test:coverage` | PASS — 53.39% statements, 52.10% branches, 43.85% functions, 54.98% lines |
| `pnpm -C server run build` | PASS — builds `@miayuda/contracts` then server TypeScript |
| `pnpm -C client run build` | FAIL without `VITE_BACKEND_URL` or `VITE_API_URL` |
| `VITE_BACKEND_URL=http://localhost:8000 pnpm -C client run build` | PASS — JavaScript output 678.57 kB / 200.22 kB gzip; Vite warned of a chunk above 500 kB |
| `pnpm -C server run lint` | PASS exit code with 155 warnings; not a clean lint baseline |
| `pnpm -C client run lint` | PASS exit code with 2 warnings; not a clean lint baseline |
| `pnpm -C server run format:check` | FAIL — 157 files reported unformatted |
| `pnpm -C client run format:check` | FAIL — 173 files reported unformatted; this command also scans generated, ignored coverage output |
| `pnpm -C mobile/MiAyudaTIC-Mobile run validate` | FAIL — missing `client/public/.well-known/android-fingerprints.manifest.json`; typecheck/test steps inside validate were not reached |
| `pnpm audit --prod --audit-level high` | FAIL — 55 vulnerabilities: 4 low, 26 moderate, 25 high |
| `pnpm run smoke:prod` | FAIL — 13 pass, 1 fail, password-recovery registered-user check skipped |
| `pnpm run smoke:mobile-api` | PASS — 2 pass, authenticated login/verify skipped because test credentials were absent |
| `pnpm run test:e2e` | FAIL — 4 passed, 1 failed, 2 skipped |

### E2E execution facts

`pnpm run test:e2e` used its default deployed Vercel and Render URLs. Both credential-dependent tests skipped because no E2E credentials were configured. Of five non-credential browser checks, four passed. The failing test was the browser-origin request to `/api/health`; the browser reported `TypeError: Failed to fetch`.

The failure is explained by executed HTTP evidence and source: `/api/health` is registered before the CORS middleware, and its production response had no `Access-Control-Allow-Origin` header. This is not a claim that the health route is unavailable; it returned HTTP 200 to direct HTTP smoke checks. It is a verified cross-origin browser access failure.

`scripts/e2e-ticket-lifecycle.sh` was not executed because all required `WR_*` variables were absent and the script creates and mutates a ticket on its configured backend. It is neither a safe read-only baseline check nor an aligned workflow v2 E2E.

## 6. CI and release baseline

### Verified CI configuration

`.github/workflows/ci.yml` triggers on pushes and pull requests to `main`, `master`, and `develop`. It:

1. installs root dependencies with pnpm 10.34.3 on Node 22;
2. builds contracts;
3. typechecks, builds, and unit-tests server;
4. typechecks, unit-tests, and builds client with `VITE_BACKEND_URL=http://localhost:8000`;
5. installs mobile separately, then typechecks and unit-tests it.

`.github/workflows/post-deploy-smoke.yml` is manual (`workflow_dispatch`) only. It runs `scripts/smoke-prod.sh` against default production URLs unless inputs override them.

### Verified gaps

- CI does not run lint, format check, coverage gates, server integration tests, Playwright, dependency audit, or an automatic post-deploy smoke.
- CI has no deployment or rollback action. Any actual Vercel/Render auto-deploy behavior is provider configuration and remains **pending verification**.
- Mobile declares `pnpm@11.5.0`, whereas root and CI use pnpm 10.34.3. The mobile typecheck and tests pass locally on pnpm 10.34.3, but version alignment remains a configuration risk.

## 7. Observability baseline

### Verified

- `/api/health` returns HTTP 200 with `status`, `uptime`, database connection state, Cloudinary/Brevo configuration state, socket connection count, and timestamp.
- HTTP logging uses Morgan. In production it uses the `combined` format.
- A helper emits JSON-formatted logs in production and is used for several workflow, email, media, and socket errors.
- Code includes operation IDs and workflow revisions in workflow-domain logic and relevant error metadata.

### Not verified / absent from evidence

- No executed evidence of request IDs/correlation IDs propagated through every request and log line.
- No metrics endpoint, metric store, request/status counters, latency histograms, p50/p95/p99, Mongo query latency, transaction abort counters, idempotency counters, or storage/external-service failure counters were found in the baseline audit.
- No hosted log/APM/error-tracking integration was verified. Documentation names Sentry as a target, not an installed integration.
- `/api/health` is a combined liveness-like response. Separate readiness, transaction-capability, critical-index, and storage checks were not verified.

## 8. Security baseline

### Verified in source and/or tests

- Express uses Helmet, explicit CORS origin validation, cookies, and configured rate-limit middleware.
- CORS allows `Content-Type`, `Accept`, `Authorization`, and `Idempotency-Key`; production preflight on `/api/auth/login` returned 204 with explicit production origin, credentials, headers, and methods.
- Web authentication uses an httpOnly cookie and mobile code supports Bearer authentication.
- The Líder restriction in mobile is enforced by mobile session/route policy; it is not evidence that the API refuses Líder Bearer login.
- Workflow v2 source has idempotency, payload-hash, optimistic revision, runtime index, and atomicity mechanisms.
- Server unit/integration tests include auth, CORS, media access, storage access, workflow idempotency, atomicity, and runtime checks.
- Production smoke verified unauthenticated `/api/usuarios` returns 401; invalid login returns 401; storage root is not public; unauthenticated local media is blocked or absent.

### Verified risks

- `pnpm audit --prod --audit-level high` found 55 dependency vulnerabilities, including direct runtime paths for `multer`, `socket.io` parser / `ws`, `express-rate-limit` transitive `ip-address`, `nodemailer`, and client `axios` / `form-data`. The audit output also includes dependencies of untracked marketing tooling; its reported count is not a per-service production exposure analysis.
- `server/src/shared/middleware/customHeader.ts` logs `req.body`. This is a potential sensitive-payload logging risk and must be reviewed before any observability work expands logging.
- Health is not browser-CORS accessible from the Vercel origin because it is mounted before CORS.

### Pending

- BOLA/IDOR and media authorization against deployed users and storage objects.
- Production CORS environment values, cookie behavior in browsers, CSRF posture, secret rotation state, Cloudinary delivery privacy, and deployment secret configuration.
- Dependency remediation requires a dedicated security phase, lockfile review, tests, and human approval; none was attempted here.

## 9. Workflow, concurrency, and legacy baseline

### Verified locally

- Server tests exercised workflow v2 transitions, repeat operation IDs, operation-ID conflict behavior, conditional rollback logic, and runtime requirement checks.
- Local integration tests exercised a cross-role HTTP workflow path in a guarded local simulation and passed.
- Workflow v2 code selects transactions for production/replica conditions and uses a documented operation-ID/revision conditional fallback for local standalone simulation.
- Documentation and source agree that legacy v1 has no `workflowVersion`, while v2 uses `workflowVersion: 2`.

### Pending

- No controlled truly concurrent request test was executed as part of Phase 0; passing sequential/double-submit tests are not proof of concurrency behavior under production topology.
- No production or staging transaction/index verification was performed.
- No full cross-surface workflow v2 E2E (Funcionario mobile → Líder web → Técnico mobile) was executed.
- No executed evidence yet proves legacy compatibility against persisted representative legacy records.

## 10. Performance baseline

### Measured

- Client production build emitted 678.57 kB JavaScript (200.22 kB gzip) and raised Vite's default 500 kB chunk warning.
- Local test durations: server unit 18.58 s; server integration 11.47 s; client unit 25.45 s; mobile unit 2.87 s.

### Not measured

- Endpoint latency, cold versus warm behavior, Mongo query timing, runtime memory/CPU, network payload sizes, load behavior, error rates under load, and p50/p95/p99 values.
- No load test was run and no capacity claim is justified.

## 11. Documentation drift

| Status | Finding | Evidence |
|---|---|---|
| Contradicted | Core product and architecture docs call mobile “auth only” / tickets “not started.” | `context/current-mobile-agent-context.md` and mobile source show funcionario create/history/detail and technician ticket/solution flows. |
| Contradicted | The web/backend v2 context itself says mobile is only auth. | Its heading notes the statement is obsolete; the canonical mobile context confirms implemented ticket flows. |
| Contradicted | Root `smoke:prod` expects CORS preflight HTTP 200. | Server CORS config explicitly sets `optionsSuccessStatus: 204`; direct production request returned 204. |
| Contradicted | Browser E2E expects a cross-origin `/api/health` response. | Health is mounted before CORS; Playwright failed and direct response lacks the CORS header. |
| Contradicted | Mobile validation presumes an Android fingerprint manifest exists. | `mobile validate` stopped because `client/public/.well-known/android-fingerprints.manifest.json` is absent. |
| Inferred / stale | `server/README.md` describes tests as database-free “Lean Mode.” | The current integration suite requires `server/.env.test` and guarded local Mongo simulation. |
| Stale / incomplete | `client/README.md` is the stock Vite template. | It does not document product scripts, environment contract, tests, deployment, or workflow v2. |
| Contradicted | `docs/workflow-v2.md` identifies the live API as commit `48a67f8…`. | Local audited `HEAD` is `ac5ae74…`; neither value proves what Render currently runs. |
| Contradicted | Portions of `context/current-web-backend-behavior-v2.md` describe web as v1-only and omit current v2 detail consumption. | `client/src/features/tickets/api/workflow.service.ts`, idempotency/retry modules, `LeaderTicketDrawer.tsx`, and technician workflow UI show current v2 paths. |
| Incomplete | `docs/contracts.md` says Líder mobile login is blocked. | The mobile app blocks the role after login; this is not an API login prohibition. |
| Contradicted | `quality-bar.md` calls the production smoke gate “12/12.” | The current script can run 14 checks before its optional recovery check; this baseline executed 14 outcomes: 13 pass and 1 fail. |
| Incomplete | Docs describe deployed Vercel/Render flow as automatic after merge. | Repository CI contains no deploy action; provider-side settings were not verified. |
| Incomplete | Docs propose observability targets and health details as operational readiness. | No metric collection, correlation-ID propagation, APM, or dashboard evidence was executed. |

## 12. Open risks

1. **P0 candidate — dependency security:** 25 high-severity findings from production audit require triage by reachable/deployed scope and an update plan.
2. **P1 — health/CORS mismatch:** browser-origin health checks fail while browser E2E expects them to work; smoke automation also has a stale 200-versus-204 assertion.
3. **P1 — release gate mismatch:** CI reports green without lint cleanliness, integration tests, Playwright, dependency audit, coverage policy, or automatic post-deploy smoke.
4. **P1 — mobile release validation:** mobile `validate` fails before its embedded typecheck/test stages due to a missing client artifact.
5. **P1 — formatting debt:** server and client format checks fail extensively; lint warnings are non-blocking.
6. **P2 — documentation drift:** conflicting mobile capability statements can cause incorrect implementation and portfolio claims.
7. **P2 — performance unknown:** only build size is measured; operational latency and load capacity are unknown.
8. **P2 — observability incomplete:** health and logs exist, but safe correlation and metrics contracts are not implemented or verified.
9. **P2 — production workflow proof absent:** v2 code and local tests exist, but transactional capability, critical indexes, and a full deployed v2 journey are unverified.
10. **P2 — dual workflow complexity:** web and mobile contain v2 paths alongside v1 `solucionCaso` compatibility paths. Future E2E must assert that the selected route follows `workflowVersion`, not just that each endpoint returns success.
11. **P2 — realtime/product expectation drift:** Socket.IO exists on the backend, but web uses 30-second polling and mobile has no verified socket/push client. This is not yet reliable real-time delivery evidence.

## 13. Phase 0 conclusion

The repository has a substantial workflow-v2 and test foundation, but it cannot honestly be described yet as a measured, fully observable, production-hardened system. The evidence supports a narrower statement:

> MiAyudaTIC has workflow-v2 integrity mechanisms and passing local unit/integration coverage, alongside a reachable deployed web/API baseline. Its production verification, security closure, release gates, metrics, and full v2 cross-client E2E remain incomplete or failing.

No changes beyond this baseline document and the requested local branch were made. No push, merge, deployment, remote migration, remote configuration change, account creation, or secret operation occurred.

## 14. Recommended next phase

Before Phase 1 documentation consolidation, resolve the P0 dependency-audit triage decision with a focused security workstream, then fix or explicitly re-scope the failed production health/CORS and mobile validation gates. After those blockers have an approved scope, begin Phase 1 with documentation that cites this baseline rather than repeating unverified claims.

## 15. Phase 0.5 — gate triage (2026-09-14)

Phase 0 remains the measurement snapshot. This section records **local** gate work on `chore/measured-production-system`. No push, deploy, Atlas, Render, Cloudinary, or Brevo change.

### SHA distinction (do not treat any row as production live without its verification method)

| Fuente | SHA | Cómo se verificó | Fecha | Estado |
|---|---|---|---|---|
| HEAD local (esta rama) | `ef542d7a021b4367a24151e4c072f86d084c558d` | `git rev-parse HEAD` | 2026-09-15 | verified; 5 commits locales no pusheados |
| origin/master | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | `git rev-parse origin/master` | 2026-09-15 | verified; **distinto** de HEAD local |
| Render live | — | no Render inspect / no deploy revision API | 2026-09-15 | **not verified** |
| último smoke | n/a | `pnpm run smoke:prod` hit live URLs | 2026-09-14 | 17 PASS / 0 FAIL against **currently reachable** prod; does **not** identify a SHA and does **not** prove local HEAD is running on Render |

Phase 0 measured `HEAD` as `ac5ae74` because that was both local HEAD and `origin/master` at audit start. After Phase 0.5 local commits, those two SHAs must not be collapsed.

Working tree after Phase 0.5 includes these local commits/files plus the original 19 pre-existing dirty paths (web/mobile WIP, `marketing/`, `video/`, local `server/storage` media). `pnpm-lock.yaml` was already dirty; G1 install changed it further.

### G1 — dependency highs

See `docs/security/dependency-triage.md`.

- **security gate: FAIL WITH ACCEPTED RISK** (not PASS).
- Workspace `--prod` high metadata: **25 → 2**. That is **2 unique advisories** on **1 package** (`nodemailer` 8.0.11), **1 path** (`server>nodemailer`), **0 duplicate routes**.
- Workspace `--prod` total: **55 → 16**.
- `pnpm audit --prod --audit-level high` still exits 1. Threshold unchanged. No nodemailer override.
- Safe bumps: multer 2.4.0, axios 1.20.0, form-data 4.0.6, ip-address 10.7.0, socket.io-parser 4.2.7, ws 8.21.3.
- Mobile 33 highs remain (Expo toolchain). Not marked resolved.

### G2 — mobile validate

**Classification:** A (missing public manifest) plus a stale validator allowlist that was unreachable until A was fixed.

- Manifest never existed in git. Production `/.well-known/assetlinks.json` was SPA HTML (catch-all rewrite, no static file).
- Added `client/public/.well-known/android-fingerprints.manifest.json` with the documented **debug** SHA-256 from `mobile-android-dev-build.md` (June 2026). Play/EAS/release rows are `pending` without invented fingerprints.
- Generated `assetlinks.json` via `pnpm sync:assetlinks`.
- `client/vercel.json` now sets JSON Content-Type for `assetlinks.json` and excludes `/.well-known/` from the SPA rewrite. **Not live until a Vercel deploy.**
- `validate.mjs` allowlist updated to current `dev:emulator` / `open:*` scripts documented in `MOBILE_DEV.md` (validator was checking a hardcoded set, not the markdown file).
- `pnpm -C mobile/MiAyudaTIC-Mobile run validate` → **PASS** (typecheck + 265 tests inside).

### G3 — health CORS vs smoke 204 (kept separate)

**Health (local code only):** `/api/health` stays unauthenticated and before Helmet. A non-throwing CORS helper adds headers only for allowed origins. Disallowed Origin still gets **200** without `Access-Control-Allow-Origin` (browser blocks; probe does not 500). `OPTIONS /api/health` → 204. Tests: `server/src/tests/health-cors.test.ts` (5). **Render still serves the old mount until a deploy.** Playwright health CORS stays skipped unless `E2E_EXPECT_HEALTH_CORS=true`.

**Smoke:** OPTIONS login now accepts **204 or 200** and asserts exact `Access-Control-Allow-Origin`, credentials, methods presence, and `Idempotency-Key`. GET health remains 200. Result this phase: **17 PASS / 0 FAIL**.

### G4 — Playwright / E2E

Phase 0: 4 passed / 1 failed / 2 skipped.

This phase: **4 passed / 0 failed / 19 skipped**.

| Spec | Class | This run |
|---|---|---|
| `cors.spec.ts` health browser fetch | prod smoke / broken on live until deploy | skipped (`E2E_EXPECT_HEALTH_CORS` unset) — this was the Phase 0 failure |
| other `cors.spec.ts` | safe prod CORS smoke | 4 passed |
| `login.spec.ts` | requires `E2E_LIDER_*` | skipped |
| `solicitud.spec.ts` | requires `E2E_FUNCA_*` | skipped |
| `workflow-v2.spec.ts` | v2 destructive scaffold | skipped (16 tests). Not implemented. Requires `RUN_DESTRUCTIVE_E2E=true` and `E2E_ENV=simulation\|qa\|staging`. Production host refused. |
| `scripts/e2e-ticket-lifecycle.sh` | v1 legacy destructive | **not run** |

Credentials are env-only. E2E v2 is **not** declared implemented.

### G5 — documentation drift

Factual edits only: mobile is not auth-only; web consumes workflow v2; no SHA is production live without verification. Details in `docs/product.md`, `docs/architecture.md`, `docs/quality-bar.md`, `docs/contracts.md`, `docs/workflow-v2.md`, `docs/rollback-procedure.md`.

### Still blocked (do not start Phase 1)

- Production health CORS (needs Render deploy of this branch — not done).
- Production `assetlinks.json` JSON (needs Vercel deploy — not done).
- nodemailer 8.x highs (major).
- Mobile Expo 33 highs.
- CI still does not run lint, integration, Playwright, audit, coverage, or post-deploy smoke.
- Cross-client workflow v2 E2E (scaffold only).
- Observability, load testing, portfolio docs — out of this phase.

## 16. Phase 0.5 review R1–R6 (2026-09-15)

Human review corrections. Still no push, deploy, Atlas, Render mutation, or Phase 1.

### Local vs production

| Gate | Local | Producción Render / Vercel |
|---|---|---|
| Health CORS | PASS (unit tests on this branch) | pendiente de **deploy Render**; live still mounts health before CORS |
| assetlinks | archivo local JSON debug válido | GET live `https://miayudatics.vercel.app/.well-known/assetlinks.json` → **HTML** (`text/html`, `filename="index.html"`) el 2026-09-15. Pendiente deploy Vercel **y** huella release |
| smoke | 17/17 contra URLs live configuradas | no implica SHA local ni que Render ejecute `ef542d7` |
| workflow v2 | unit/integration locales | E2E remoto **no ejecutable** |
| SHA | HEAD `ef542d7` y origin `ac5ae74` verificados | Render **no verificado** |
| índice unique historial | estado según baseline Phase 0 | no tocar ahora |

Regla: un test local verde no prueba que Render ejecute ese código. `smoke:prod` prueba el **deploy actualmente alcanzable**, no el HEAD de esta rama.

### G2 App Links (review)

- Manifest JSON válido. Schema: `package_name`, `fingerprints[]` con `id`/`label`/`sha256?`/`status?`.
- Única huella con SHA-256: **debug** documentada jun 2026 en `mobile-android-dev-build.md`. No es preview ni release. Sirve para **dev client** / validate local. **No valida un APK de Play/EAS.**
- Estado explícito: **debug fingerprint verified; Play/EAS release fingerprint pending; production app-link verification pending.**
- `assetlinks.json`: `com.miayudatics.mobile`, relación `delegate_permission/common.handle_all_urls`, una huella debug, sin placeholders ni secretos.
- `vercel.json` local declara `Content-Type: application/json` y excluye `/.well-known/` del rewrite SPA. Eso **no está live**.
- `validate.mjs` ahora comprueba existencia, JSON, `package_name`, sync de SHA-256, formato hex, y avisa pending release. **No** prueba Content-Type en Vercel ni App Links de un APK de tienda.

Deep linking de producción **no está resuelto**.

### Playwright skipped (19)

Playwright harness green for available tests; **workflow v2 E2E not yet executable.** Do not say E2E completo PASS.

| # | Spec | Por qué skipped |
|---|---|---|
| 1 | `cors.spec.ts` health browser | health cross-origin pendiente de deploy (`E2E_EXPECT_HEALTH_CORS` unset) |
| 1 | `login.spec.ts` | falta `E2E_LIDER_EMAIL`/`PASSWORD` |
| 1 | `solicitud.spec.ts` | falta `E2E_FUNCA_EMAIL`/`PASSWORD` |
| 16 | `workflow-v2.spec.ts` | journey **no implementado** + `RUN_DESTRUCTIVE_E2E` false + entorno no permitido (production host refused) |

4 passed = CORS/SPA read-only contra el frontend/API **live actuales**.

### Commits locales (no enviados a origin)

| Commit | Archivos | Propósito | Fase 0.5 | Preexistente o creado aquí | Reversible |
|---|---|---|---|---|---|
| `5c64639` | `.gitignore`, `client/package.json`, `server/package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `docs/security/dependency-triage.md` | highs alcanzables; nodemailer no | sí | lockfile ya sucio + archivos nuevos/editados aquí | sí, revert local |
| `63b1fbd` | well-known, `client/vercel.json`, `validate.mjs`, `mobile-android-dev-build.md` | manifest debug + validate | sí | creado/editado aquí | sí |
| `56286a8` | `app.ts`, `cors.ts`, `health-cors.test.ts`, `smoke-prod.sh` | health CORS local + smoke 204 | sí | creado/editado aquí | sí |
| `725529e` | `e2e/*` | skip health live; scaffold v2 | sí | creado/editado aquí | sí |
| `ef542d7` | baseline + docs factales | SHA/mobile drift | sí | baseline creado en Phase 0, commiteado aquí | sí |

Confirmado: los 5 commits **no** incluyen JPEG/PNG de `server/storage`, **no** incluyen `server/.env`, **no** hay secretos versionados. Los 19 WIP (leader media, historial mobile, marketing, video, storage local, `.agents`, etc.) **no** están en esos commits. `git log origin/master..HEAD` = 5 commits; **no push**.

`pnpm-lock.yaml` era uno de los 19 dirty y se mezcló porque G1 lo exigía. El resto del WIP permanece untracked/modified fuera de HEAD.

### Decision board

1. **PASS de verdad (local, esta rama):** typecheck; server 151; integration 12; client 59; mobile 265; mobile validate (debug); health CORS unit tests; smoke script semantics (204) contra live OPTIONS que ya era 204.
2. **PASS solo local / no prueba Render:** health CORS del código nuevo; `assetlinks.json` + `vercel.json`; SHA de esta rama.
3. **FAIL:** `pnpm audit --prod --audit-level high` (2 high nodemailer); App Links de producción (HTML live); Playwright health CORS live; E2E v2.
4. **High aceptados:** GHSA-p6gq-j5cr-w38f y GHSA-2x7j-588g-ccc2 en nodemailer 8.0.11. Mobile 33 Expo highs no son el gate workspace.
5. **Requieren deploy:** health CORS → Render; assetlinks JSON + rewrite → Vercel. **No hechos.**
6. **Requieren huella release real:** `release_local` / `eas_production` / `play_app_signing`.
7. **Requieren credenciales E2E:** login líder, panel funcionario; journey v2 además exige tres roles + `RUN_DESTRUCTIVE_E2E` + `E2E_ENV` no prod.
8. **Requieren aprobación humana:** aceptar el riesgo nodemailer; autorizar deploys; no iniciar Fase 1 hasta esa aprobación.
9. **SHA local (review R1–R6):** `ef542d7a021b4367a24151e4c072f86d084c558d`. Later local commits exist; see §17.
10. **SHA Render:** no verificado.

## 17. Phase 0.5 closeout (2026-09-15)

Classification (human-accepted):

```text
PASS local con riesgos aceptados y producción pendiente.
```

Phase 1, observability, load testing, destructive E2E, push, and deploy were **not** started. D2 requires a **separate** human approval. Checklist: `docs/baseline/PHASE-05-DEPLOY.md`.

### Local (this branch)

| Gate | Result |
|---|---|
| typecheck | PASS |
| tests | PASS (server 151, integration 12, client 59, mobile 265) |
| build | PASS |
| mobile validate debug | PASS |
| health CORS tests | PASS (unit, local) |

### Production pending

| Item | Status |
|---|---|
| Render health/CORS | not deployed |
| Vercel assetlinks JSON + Content-Type | not deployed; live GET still SPA HTML as of 2026-09-15 |
| SHA live | unverified |
| release fingerprint | pending |
| workflow v2 E2E | harness only; journey not implemented and not executed |

### Accepted risk

| Item | Detail |
|---|---|
| Nodemailer | 8.0.11, **2** advisories, path `sendViaSmtp()` |
| Preferred prod path | Brevo REST |
| Raw sendMail | not reachable in current audit |
| Owner | backend |
| Review date | 2026-10-14 |
| State | accepted risk, **not resolved** |
| Security gate | **FAIL WITH ACCEPTED RISK** — not PASS |

If Brevo REST fails and SMTP fallback activates, that is an **operational risk** (advisory B applies). Do not switch SMTP to primary. Do not raise audit threshold. Do not hide advisories with overrides.

### Commits on branch vs origin/master (local, unpushed)

| Commit | Subject |
|---|---|
| `5c64639` | fix(deps): patch reachable production highs without a nodemailer major |
| `63b1fbd` | fix(mobile): restore android fingerprint manifest for validate |
| `56286a8` | fix(api): apply non-throwing cors on health and accept 204 preflight |
| `725529e` | test(e2e): skip live health cors until deploy and scaffold v2 safely |
| `ef542d7` | docs(baseline): record phase 0.5 sha table and mobile capability drift |
| `60841e0` | docs(baseline): separate local pass from live risk and nodemailer counts |
| `6de33af` | fix(mobile): validate fingerprint hex and warn when release is pending |
| `037a424` | test(e2e): complete v2 harness without running the journey |

HEAD after the docs closeout commit is recorded in git log. origin/master remains `ac5ae74206bac09d501bb420a349545e5cd7ea0e`.

WIP still dirty and **excluded** from deploy: leader media thumbs, historial-intent mobile, `marketing/`, `video/`, `.agents/`, `skills-lock.json`, `.atl/skill-registry.md`, local `server/storage/file-1788*`.

### D3 E2E v2

Armazón completed: env names, explicit `E2E_ENV`, production host refuse, `RUN_DESTRUCTIVE_E2E=false`, E2E ticket marker helper, cleanup via cancel/confirm (no DELETE), masked screenshots, ticket ID/state report file. **Journey steps still throw Not implemented.** E2E v2 does **not** exist as an executable suite. No accounts created. Destructive run not executed.
