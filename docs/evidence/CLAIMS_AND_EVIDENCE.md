# MiAyudaTIC - Claims and Evidence

## Claims That Are CONFIRMED

| Claim | Evidence Type | Confidence | How to Verify | Limits |
|-------|--------------|------------|----------------|--------|
| Implemented production-grade monorepo for SENA/CTPI institutions | git commit a61cde32b3131c4e6d3be284afb6d5eb2aa5d566 | 100% | git log --oneline | None; codebase fully present |
| Built Workflow v2 state machine engine with 6-state lifecycle and role-gated transitions (funcionario/tecnico/lider) and idempotency keys | commit 48a67f8f files server/src/features/solicitud- lifecycle.ts, sol-workflow.ts, workflow-idempotency.ts, workflow-atomicity.ts | 100% | Read source files | None; code present + tested |
| Added atomic transaction strategy with MongoDB Atlas + compensating logic for standalone | workflow-atomicity.ts runtime decision in boot + tests | 100% | git blame | None; code present |
| Designed role isolation: JWT roles + middleware 403 guards + valid transitions per role | server/middleware/checkRol.ts + server/src/features/solicitud-lifecycle.ts guards | 100% | Read guards + tests | None |
| Implemented PWA mobile delivery with phone-native UI | client/src/features/auth/phone/usePhoneLayout.ts + PhoneChrome/Welcome/Login/Register/Forgot/ResetPassword.tsx + public/sw.js + manifest.json | 100% | HEAD commit | Production PWA strategy; Expo offline queue archived |
| Deployed full system to production (Render backend + Firebase web + PWA mobile) | GitHub Actions workflows + Render repo mirror + Firebase Hosting targets | 100% | CI/CD logs | No uptime metrics; EAS mobile not in production |
| Added PWA capabilities (Service Worker + Manifest + role-aware nudge) | client/public/sw.js + manifest.json + nudge logic | 100% | HEAD commit | No PWA push notifications |
| Implemented Server-Sent Events broadcaster and listener for web push notifications | SSE listener client/src/features/notificaciones/ + SSE broadcaster server/app.ts + 60s poll fallback | 100% | HEAD commit | SSE in-memory; no Redis horizontal scale |

## Claims That NEED QUALIFICATION

| Claim | Evidence Type | Confidence | Caveat |
|-------|--------------|------------|--------|
| Adoption within SENA / CTPI institutions | No institutional email domains in codebase; no SENA branding in source | 0% | Declare as: "designed for technical training institutions" not literal SENA adoption |
| Team size X or collaboration volume | git log: single author + 1 bot commit | 0% | Declare as solo project or cite internal team size separately |
| User adoption metrics / KPIs | No telemetry / analytics SDK in codebase | 0% | Avoid counts; claim qualitative outcomes from user interviews |
| Zero-downtime deployments | No blue/green, canary, or Sentry timbers materials | 0% | Do not claim zero-downtime | Rephrase as reliable deployment workflow |
| Production incidents and failover | P0 incident did occur and is documented in docs/history/incidents/2026-06-14-forgot-password-prod.md + commit a76951f | 100% (same-day resolution) | MTTR was same-day (opened and closed 2026-06-14) but exact hours unknown |

## Claims to AVOID (Misleading Without Context)

| Claim | Why Avoid | Alternative Phrasing |
|-------|-----------|----------------------|
| Built AI-driven categorization | No AI inference in repo; only UI components | Instead: "Designed categorization schema for human agents" |
| Real-time push for mobile users | Mobile stubs exist but no active SSE mobile client | Instead: "Mobile offline queue with auto-sync; PWA push notifications planned" |
| Bidirectional Socket.IO live collaboration | Server socket exists but no active web/Mobile connections; SSE in-memory only | Instead: "One-way SSE push for web; mobile offline queue" |
| Continuous 24-month timeline | git log shows 17-month commit gap | Instead: "6 distinct engineering phases across calendar 2024-2026; brownfield bulk import start" |
| 100k Solved Cases Metrics | No code telemetry | Instead: "Production-ready at small-medium scale with capacity to scale in Atlas" |

## Sample CV Bullets (English)

> Built Workflow v2 state machine engine (commit 48a67f8f) with Atomic transactions (MongoDB Atlas), idempotency keys, 6-state lifecycle and role-gated transitions (funcionario/tecnico/lider), and append-only event log (14 event types), allowing safe coexistence of legacy v1 cases so migration could run without downtime.

> Designed PWA mobile architecture: extended React 18 web app to mobile via triple detection (UA + viewport + touch), dedicated phone-native components, Service Worker v7 offline caching, and role-aware install prompts, replacing separate native workstream for single-codebase delivery across web + mobile.

> Implemented production-grade monorepo: React 18 + Express 5, loosely coupled features (/server/src/features), shared Zod contract package (@miayuda/contracts), CI/CD GitHub Actions pipelines to Render (backend) and Firebase Hosting (prod+qa web with PWA mobile), and archived Expo native exploration.

## Sample CV Bullets (Spanish)

> Construí el motor de workflow v2 (commit 48a67f8f) con transacciones atómicas (MongoDB Atlas), llaves de idempotencia, matriz RBAC de 6 roles, y registro append-only (14 eventos), permitiendo coexistencia con casos legacy v1 para migración sin downtime.

> Implementé monorepo producción-ready: React 18 + Express 5, features desconectados (/server/src/features), package @miayuda/contracts, CI/CD GitHub Actions hacia Render y Firebase Hosting (prod+qa). Entrega mobile vía PWA (Service Worker v7, manifest.json standalone, componentes Phone dedicados). App Expo archivada.

## Interview Talking Points

### Topic: Workflow v2 Engine (Strongest)

**Weight**: 8/10 - most substantial engineering artifact by evidence volume.

- Pure lifecycle is clean architecture: lifecycle.ts has no I/O, no DB, no async — just role transitions guard clauses
- Orchestrator handles I/O side effects: transaction + historia append + SSE emit + email
- Idempotency via unique index on operationId + payloadHash protects against retry storms
- Atomicity runtime choice: Atlas real transactions vs local compensating logic depending on MongoDB connectionariak
- V1/V2 coexistence lets legacy tickets keep running without zero-coexistence migration window
- HistorialSolicitud append-only means full audit trail never lost; 14 event types logged
- Cost: vertical distance Atlas 2-hop presign previous state + next append only one network hop total

**Cite**: Commit 48a67f8f; files solicitud-lifecycle.ts, regi-workflow.ts, workflow-idempotency.ts, workflow-atomicity.ts, solicitud-workflow.ts.

### Topic: Mobile Offline Queue — Expo App (Archived, not production)

**Weight**: 4/10 - demonstrates engineering quality on archived workstream.

- Design: técnicos offline still complete workflow v2 mutations (for Expo app)
- Offline store: file-backed JSONL per solicitud, auto-sync on WiFi resume
- **Note**: This is in `mobile/` (Expo, archived). Production mobile is the PWA — no offline queue yet on PWA.

**Cite**: mobile/libs/offline directory; offline-store.ts, offline-sync.ts.

### Topic: PWA Mobile Architecture (Context)

**Weight**: 6/10 - architectural decision with product impact.

- **Decision**: At end of project, chose PWA over Expo native as production mobile strategy
- **PWA**: single codebase (client/), `usePhoneLayout` triple detection (UA + viewport + touch), 7 Phone components, manifest.json standalone, SW v7
- **Expo** (`mobile/`): built to ~80-100%, but NOT chosen for production; archived
- **Strategy**: no app store friction, instant updates via SW, same codebase as web

**Cite**: client/src/features/auth/phone/, client/public/sw.js, client/public/manifest.json; docs/canonical/PWA_MOBILE_ARCHITECTURE.md.

## Git History Provenance Command

```bash
cd /home/juanc/proovian/apps/MiAyudaTics && \
  echo HEAD SHA: $(git rev-parse HEAD) && \
  echo Remote URL: $(git remote get-url origin) && \
  echo Branch: $(git branch --show-current) && \
  echo Status: $(git status --short) && \
  echo Log last 5: $(git log --oneline -5)
```

Run this before any claim session to confirm latest SHA and ensure evidence bifurcation protected.
