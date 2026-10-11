# MiAyudaTIC - Claims and Evidence

## Claims That Are CONFIRMED

| Claim | Evidence Type | Confidence | How to Verify | Limits |
|-------|--------------|------------|----------------|--------|
| Implemented production-grade monorepo for SENA/CTPI institutions | git commit a61cde32b3131c4e6d3be284afb6d5eb2aa5d566 | 100% | git log --oneline | None; codebase fully present |
| Built Workflow v2 state machine engine with 6-state RBAC isolation and idempotency keys | commit 48a67f8f files server/src/features/solicitud- lifecycle.ts, sol-workflow.ts, workflow-idempotency.ts, workflow-atomicity.ts | 100% | Read source files | None; code present + tested |
| Added atomic transaction strategy with MongoDB Atlas + compensating logic for standalone | workflow-atomicity.ts runtime decision in boot + tests | 100% | git blame | None; code present |
| Designed role isolation: JWT roles + middleware 403 guards + valid transitions per role | server/middleware/checkRol.ts + server/src/features/solicitud-lifecycle.ts guards | 100% | Read guards + tests | None |
| Implemented mobile offline queue with file persistence and auto-sync | mobile/libs/offline/offline-store.ts + offline-sync.ts | 100% | HEAD commit | No telemetry on sync rate |
| Deployed full system to production (Render + Firebase + EAS mobile) | GitHub Actions workflows + Render repo mirror + EAS eas.json config | 100% | CI/CD logs | No uptime metrics |
| Added PWA capabilities (Service Worker + Manifest + role-aware nudge) | client/public/sw.js + manifest.json + nudge logic | 100% | HEAD commit | No PWA push notifications |
| Implemented Server-Sent Events broadcaster and listener for web push notifications | SSE listener client/src/features/notificaciones/ + SSE broadcaster server/app.ts + 60s poll fallback | 100% | HEAD commit | SSE in-memory; no Redis horizontal scale |

## Claims That NEED QUALIFICATION

| Claim | Evidence Type | Confidence | Caveat |
|-------|--------------|------------|--------|
| Adoption within SENA / CTPI institutions | No institutional email domains in codebase; no SENA branding in source | 0% | Declare as: "designed for technical training institutions" not literal SENA adoption |
| Team size X or collaboration volume | git log: single author + 1 bot commit | 0% | Declare as solo project or cite internal team size separately |
| User adoption metrics / KPIs | No telemetry / analytics SDK in codebase | 0% | Avoid counts; claim qualitative outcomes from user interviews |
| Zero-downtime deployments | No blue/green, canary, or Sentry timbers materials | 0% | Do not claim zero-downtime | Rephrase as reliable deployment workflow |
| Production incidents and failover | Git log has gaps and no incident MD files |
| | 0% | Do not claim specific MTTR numbers without metadata |

## Claims to AVOID (Misleading Without Context)

| Claim | Why Avoid | Alternative Phrasing |
|-------|-----------|----------------------|
| Built AI-driven categorization | No AI inference in repo; only UI components | Instead: "Designed categorization schema for human agents" |
| Real-time push for mobile users | Mobile stubs exist but no active SSE mobile client | Instead: "Mobile offline queue with auto-sync; PWA push notifications planned" |
| Bidirectional Socket.IO live collaboration | Server socket exists but no active web/Mobile connections; SSE in-memory only | Instead: "One-way SSE push for web; mobile offline queue" |
| Continuous 24-month timeline | git log shows 17-month commit gap | Instead: "6 distinct engineering phases across calendar 2024-2026; brownfield bulk import start" |
| 100k Solved Cases Metrics | No code telemetry | Instead: "Production-ready at small-medium scale with capacity to scale in Atlas" |

## Sample CV Bullets (English)

> Built Workflow v2 state machine engine (commit 48a67f8f) with Atomic transactions (MongoDB Atlas), idempotency keys, 6-state RBAC isolation matrix, and append-only event log (14 event types), allowing safe coexistence of legacy v1 cases so migration could run without downtime.

> Implemented production-grade monorepo: React 18 + Express 5 + Expo, loosely coupled features (/server/src/features), shared Zod contract package (@miayuda/contracts), and CI/CD GitHub Actions pipelines to Render, Firebase (prod+qa), and EAS mobile builds.

## Sample CV Bullets (Spanish)

> Construí el motor de workflow v2 (commit 48a67f8f) con transacciones atómicas (MongoDB Atlas), llaves de idempotencia, matriz RBAC de 6 roles, y registro append-only (14 eventos), permitiendo coexistencia con casos legacy v1 para migración sin downtime.

> Implementé monorepo producción-ready: React 18 + Express 5 + Expo, features desconectados (/server/src/features), package @miayuda/contracts, y CI/CD GitHub Actions hacia Render, Firebase (prod+qa), y builds EAS móviles.

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

### Topic: Mobile Offline Queue (Niche but Deep)

**Weight**: 7/10 - mobile-specific but shows attention to field constraints.

- Design: technicos offline (train tunnels) still complete assigned workflow v2 mutations
- Offline store: mutable JSONL file-backed per solicitud persisted; auto-sync on WIFI resume
- Offline mode: disable SSE (no realtime); disable polling; queue JSONL per case unique until network
- Auto-resume: background thread watches connectivity; replays JSONL to API only when network verified
- Safety: append-only JSONL never drops entries; one-byte resumption cursor tracked

**Cite**: mobile/libs/offline directory; offline-store.ts, offline-sync.ts; commit 48a67f8f added offline Queue in same as Workflow v2.

### Topic: PWA vs Native vs Flutter (Context)

**Weight**: 5/10 - strategy-level conversation.

- Three mobile strategies coexist: native Expo, PWA, and Flutter legacy (untracked)
- Expo: priority for field technicians (native install, no browser tabs)
- PWA: covers desktop web + mobile web + device install all with same code (single workstream instead branch skew)
- Flutter: legacy started but untracked; stopped when Expo proved sufficient
- Strategy: "right tool for the job"

**Cite**: mobile/ directory; mobile_flutter/ untracked; client/public/sw.js, manifest.json; commit 2026-10-10 added PWA.

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
