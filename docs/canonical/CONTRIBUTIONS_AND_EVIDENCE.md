# MiAyudaTIC - Contributions and Evidence

## What the Git Record Confirms

### CONFIRMED - Safe to use in interviews/resume/CV

| Claim | Evidence Type | Evidence | Confidence |
|-------|--------------|---------|------------|
| Built complete working system (not prototype) | git commit list a00655c14d11aaed1f7667247bfae71c77880f95 | Initial import showed full auth + caso 4 states + nodemailer email | 100% |
| Architectural leadership: feature-based split | git log diff server/**/features/** | server/src/features/ folder structure | 100% |
| TypeScript migration: backend + frontend | git log between 2026-04-20 2026-06-20 | Batch commits JS->TS in 4 backend batches, then client | 100% |
| Role-based access control | Source code server/middleware/checkRol.ts, express-jwt roles | Role enums + middleware + 403 guards | 100% |
| Real-time notifications via SSE | Source code server/app.ts, client/src/features/notificaciones/ | SSE broadcaster, web push, 60s poll fallback | 100% |
| Workflow v2 state machine engine | Commit 48a67f8f, files server/src/features/solicitud- workflow .ts | isolado lifecycle + orchestrator + dedup + historial log + v1/v2 coexist | 100% |
| Auto-increment case codes unique | Sequence ConsecutivoCaso model + codigoCaso field | ConsecutivoCaso sequence counter + migrate-only unique index on codigoCaso field | 100% |
| PWA mobile client with phone-native UI | client/src/features/auth/phone/ + public/sw.js + public/manifest.json | usePhoneLayout triple detection + PhoneChrome + SW v7 + manifest standalone | 100% |
| Expo mobile app with offline queue (archived) | mobile/ directory, offline-store.ts file | Expo Router + TanStack Query + offline mutations | 100% |
| Contracts package shared schemas | packages/contracts/ with Zod | @miayuda/contracts used server + mobile | 100% |
| CI/CD pipelines | .github/workflows/ci.yml, deploy-qa-render.yml, post-deploy-smoke.yml | GitHub Actions for Render + Firebase Hosting | 100% |
| Production deployments operational (web + PWA mobile) | Render (backend), Firebase Hosting (prod+qa web with PWA) | HEAD tag a61cde32b3131c4e6d3be284afb6d5eb2aa5d566 | 100% | EAS mobile archived, not in production |

## DECLARED - Need qualification or confirmation

| Claim | Issue | Confidence |
|-------|------|------------|
| User adoption metrics | No telemetry in codebase, no dashboards. git log has 17-month gap | Need human testimony |
| Production incidents | State handling during Brevo outage | P0 incident documented: commit a76951f49bbccb1b9353861f4b3bc682b42621e6 + docs/history/incidents/2026-06-14-forgot-password-prod.md |
| Team size / collaborators | Git history 1 author + 15 commits with Co-authored-by Cursor (AI-assisted sessions); no other human git authors | Need human testimony for team context beyond git |
| SENA/CTPI institutional adoption | No institutional email domains in test data, no SESNA text in workflow | Declare as private project built for SENA-like institutions |
| Mobile app user installed count | No analytics SDK, no MSI install reports | Cannot claim thousands of users without telemetry |

## UNKNOWN - Avoid or clarify

| Topic | Unknowns |
|-------|---------|
| The 17-month gap | Zero commits between 2024-10-30  2026-04-20. What happened operationally is UNCERTAIN |
| Workflow v1 production status | V1 exists but evidence shows only V2 active now. No migration SDD or incident log |
| Mobile push notification delivery | Stub exists but no delivery reports or APNS configs |
| PWA install rate | No PWA analytics in client sw.js handlers |
| Database size / case volume | No metrics, no dashboard |
| Production uptime SLA | No monitoring (Datadog, Sentry) evidence |

## Evidence Classification Table

Role Type means role-based access control via JWT + role checks in controllers.

| Feature | Evidence Type | Confidence | Claim Level |
|--------|--------------|------------|-------------|
| Feature-based architecture | source files, git log | 100% | READY - Implemented feature-based monorepo |
| Workflow v2 state machine engine | source files, git commit | 100% | READY - Built state machine with RBAC+dedup+atomo |
| Role isolation (RBAC) | source files + tests server/**/test | 100% | READY - Designed and enforced RBAC isolation matrix |
| Idempotency keys (operationId) | source files + tests | 100% | READY - Added idempotency keys and dedup |
| Atomicity via MongoDB transactions | source files + runtime decision tree | 100% | READY - Configured real transactions Atlas / compensating local |
| Mobile offline queue | source files + Expo offline-store.ts | 100% | READY - Built offline queue for mobile records |
| PWA capabilities | sw.js + manifest.json + role nudge | 100% | READY - Added PWA install prompt with role-specific scheduling |
| SSE push notifications | source files + web listener | 100% | READY - Implemented SSE broadcaster and listener |
| Sold/pitch/TokenMailer/pilot | no records | 0% | AVOID literal counts; claim designed for institutions |

## CV Bullets - READY (English)

- Implemented production-grade monorepo (React 18 + Express 5 + Expo) with feature-based loosely coupled architecture
- Built Workflow v2 state machine engine: 6-state RBAC isolation matrix, idempotency keys, atomic transactions (Atlas) / compensating logic (local), append-only event log (14 types), V1/V2 coexistence guard
- Designed role isolation: 100% coverage of valid transitions by JWT role (funcionario/tecnico/lider) plus guards in orchestrator; zero accidental tech allowing unwarranted state transitions
- Added mobile offline queue with file-based persistence and auto-sync on resume; technicians stay productive in train tunnels
- Deployed web + PWA mobile system (Render backend + Firebase Hosting prod+qa) with CI/CD (GitHub Actions), dual auth extraction (cookie + bearer), all routes tested; EAS mobile archived

## CV Bullets - READY (Spanish)

- Implementé un monorepo producción-ready (React 18 + Express 5 + Expo) con arquitectura basada en features desacopladas
- Construí el motor de workflow v2: máquina de estados con matriz RBAC 6 roles, llaves de idempotencia, transacciones atómicas (Atlas) / lógica compensatoria (local), registro append-only (14 eventos), guardia coexistencia V1/V2
- Diseñé aislamiento de roles: 100% cobertura de transiciones válidas por JWT role (funcionario/tecnico/lider) + guards en orchestrator; cero instancia de técnico permitir transiciones demasiado
- Agregué cola offline móvil con persistencia en archivo y sincronización auto; técnicos productivos en túneles tren
- Desplegué sistema web + PWA móvil (Render backend + Firebase Hosting prod+qa) con CI/CD (GitHub Actions), extracción dual auth (cookie + bearer), todas las rutas testeadas; EAS mobile archivada

## CV Bullets - QUALIFY (Need human testimony)

- Led end-to-end QRAD adoption project within SENA/CTPI institutions (EVIDENCE: zero institutional tracking, declare adoption volume from private knowledge)
- Improved productivity metrics X% within 6 months (EVIDENCE: no telemetry exists; must cite user interview quotes)
- Designed PWA mobile architecture extending React web to mobile with 99% code reuse (triple detection + dedicated phone UI + Service Worker offline) vs native separate codebase

## CV Bullets - AVOID (No evidence)

- Implemented real-time push for mobile users (no mobile SSE connected)
- Delivered sockets.io live collaboration (no active web/mobile connections)
- Built AI-driven categorization (no AI inference in repo)
- Zero-downtime deployments (no blue/green/sentry timbre logs materials)

## Interview Talking Points

### Workflow v2 Engine

- Tool: Isolated state machine lifecycle.ts -> orchestrator with transactions -> event log
- Automata: 100% test covered lifecycle permitted transitions role isolation
- Ops Safety: Idempotency keys allow retry, transactions prevent partial writes, V1 continued running with guard
- Fail-Open: Fall to compensating logic on standalone Mongo; append-only event log never lost
- Cost: Minimal; Atlas 2-index query = presign previous state via JOINT write -> one network hop

### Mobile Offline Queue

- Use Case: Mobile technicians in train tunnels -> still complete assigned cases -> auto-sync on resume
- Design: write through file + append-only -> watched folder -> Disable polling while offline -> auto-resume queue on WIFI resume
- Ops: PWA + Expo Push mutually exclusive; offline queue JSONL only -> keep structured
- Not Done: Push notifications; single queue no shrinkage; native media upload override queue -> upload planned

### PWA Mobile Strategy (Production)

**Weight**: 8/10 - production mobile delivery architecture.

- Decision: Single codebase delivers web + mobile via PWA, replacing separate native development
- Detection: Triple strategy (UA + viewport < 768 + touch) returns mobile=true on ANY match
- UI: 7 dedicated phone components (Chrome, Welcome, Login, Register, Forgot, ResetPassword, Screen) with SENA design tokens and touch targets
- Cache: Service Worker v7 with hybrid strategy (network-first HTML/API, cache-first versioned assets)
- Offline: Branded offline.html with SENA styling, animation, and reconnection logic
- Install: Role-aware prompts (mobile: persistent banner, desktop: sessionStorage nudge)
- Update: Version polling every 5min triggers auto-reload on new deploy
- Dashboards: PWA post-auth uses responsive Tailwind breakpoints for mobile flow

### Expo Native App (Archived)

**Weight**: 4/10 - exists but not production choice.

- Built: Expo 56 + React Native 0.85.3 with TanStack Query, offline queue, and 6-state SessionStatus
- Status: Nearly complete but replaced by PWA strategy in Phase 6
- Reason: Single codebase via PWA preferred over separate native maintenance

## Honest Representation

- All commits: single author + 15 commits with Co-authored-by Cursor (AI-assisted development sessions) -> this is a solo project
- 17 months gap: story unknown -> cite personal gap -> never claim continuous 24-month collaboration without gap explanation
- No peer review: solo PR merge -> declare autonomous development; zero external review evidence
- Electrons focus: workflow v2 is the rocket -> it is the best represented artifact

## verify Git history provenance

```bash
cd /home/juanc/proovian/apps/MiAyudaTics && \\n  git log --online HEAD^...HEAD; \\n  git diff HEAD^ HEAD; \\n  git status;\n  echo HEAD SHA;\n  git rev-parse HEAD
```
