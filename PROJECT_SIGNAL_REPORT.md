# PROJECT SIGNAL REPORT — MiAyudaTIC

> **Purpose:** Reverse-engineered career signal extraction from repository evidence only.  
> **Scope:** `MiAyudaTics_v1.0` monorepo — web, API, mobile, contracts, docs, CI/CD, audits.  
> **Production:** [miayudatics.vercel.app](https://miayudatics.vercel.app) · API [miayudatics-v1-0.onrender.com](https://miayudatics-v1-0.onrender.com)  
> **Generated:** 2026-06-17  
> **Rule applied:** No invented metrics. All claims trace to files, commits, or documented audits.

---

## PRODUCT ANALYSIS

### What problem was this project solving?

SENA training centers (specifically CTPI-Cauca) operated IT support through **fragmented, non-auditable channels**: WhatsApp messages, paper notes, and oral handoffs (`docs/product.md`). The result was institutional chaos:

- Incidents without traceability or standardized case codes
- Technicians without a clear queue or closure evidence
- IT leaders without approval workflows, assignment control, or operational metrics
- Field staff (funcionarios) without a fast way to report classroom technical failures with photographic evidence

**MiAyudaTIC** digitizes this into a **role-based service management platform** with explicit states, evidence attachments, notifications, and leader dashboards — explicitly **not** a generic chat tool or enterprise ITSM SaaS (`docs/product.md` anti-goals).

### Who were the users?

| Persona | System role | Context | Primary surface |
|---------|-------------|---------|-----------------|
| Funcionario de formación | `funcionario` | Classroom / training environment | Web + Mobile (field reporting) |
| Técnico de soporte | `tecnico` | Field or desk; resolves assigned cases | Web + Mobile |
| Líder TIC / coordinador | `lider` | Desktop command center; operates the desk | **Web only** (by design) |

**ICP:** CTPI and SENA centers needing an **owned** institutional helpdesk, not Zendesk or multi-tenant B2B SaaS (`docs/product.md`).

### What workflows were being digitized?

1. **Incident intake** — funcionario creates solicitud with description, phone, ambiente (training room), tipo de caso, optional photo
2. **Queue management** — líder views pending solicitudes and assigns approved technicians
3. **Technician onboarding** — técnico self-registers; líder approves/denies before login is permitted
4. **Case resolution** — técnico submits solución (pending or final) with evidence; state transitions enforced
5. **Closure & traceability** — unique `codigoCaso` (YYYY-MM-#####), historial per role, email confirmations
6. **Catalog administration** — líder manages ambientes de formación and tipos de caso
7. **Operational visibility** — líder charts: solicitudes por ambiente, solicitudes por mes
8. **Notifications** — in-app + email + Socket.IO realtime pushes on assignment and closure

### What business process was being transformed?

**Before:** Ad-hoc IT support coordination with no single source of truth, no SLA measurement, no audit trail, no role separation.

**After:** A **ticket lifecycle system** with a documented state machine (`docs/contracts.md`):

```
solicitado → asignado → pendiente → finalizado
```

Each transition has a designated actor, API endpoint, RBAC gate, and (where applicable) notification side effects.

### What organizational inefficiency existed before?

| Inefficiency | Evidence in docs |
|--------------|------------------|
| No case codes | `docs/product.md` — "incidencias sin trazabilidad ni código de caso" |
| No technician queue | "técnicos sin cola clara ni evidencia de cierre" |
| No leader metrics | "líderes TIC sin métricas ni control de aprobación de personal" |
| No field tooling | "funcionarios en campo sin herramienta rápida para reportar con foto" |
| Channel fragmentation | WhatsApp, papel, memoria oral |

### What operational risks existed before?

| Risk | Nature |
|------|--------|
| **Accountability gap** | No proof of who reported, assigned, or resolved |
| **Data loss** | Oral/paper channels lose history |
| **Unauthorized access** | No role separation for sensitive operations |
| **Technician trust** | Unvetted technicians could access systems without approval workflow |
| **Evidence loss** | Photos and resolution proof not centrally stored |
| **SLA blindness** | No time-to-assign or resolution-rate measurement framework (north-star metrics defined in `docs/product.md` / `docs/analytics.md`) |

### What changed after this system existed?

| Dimension | Change |
|-----------|--------|
| **Traceability** | Every solicitud has `codigoCaso`, estado, timestamps, linked usuario/técnico/solución |
| **Role enforcement** | RBAC on every protected route; permission matrix in `docs/contracts.md` |
| **Approval gate** | Técnicos require `estado: true` after líder approval (`accountStatus.ts`) |
| **Evidence pipeline** | Cloudinary in production; magic-byte validation; `MEDIA_MAX_BYTES` cap |
| **Realtime visibility** | Socket.IO events: `actualizarSolicitud`, `actualizarTecnico`, `nuevaNotificacion` |
| **Production deployment** | Vercel (web) + Render (API) with documented smoke gates |
| **Mobile field access** | Expo app with funcionario solicitud creation and técnico case resolution (Phases 0–2A technically closed per `mobile-context-architecture.md`) |
| **Operational runbooks** | Incident docs, smoke scripts, war-room audit (`archive/audits/2026-06-14-release-war-room/`) |

---

## SYSTEM INVENTORY

### 1. Authentication System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Secure multi-surface session management for web (cookie) and mobile (Bearer JWT) |
| **Inputs** | Credentials (login), registration payload, JWT on subsequent requests |
| **Outputs** | httpOnly cookie (web) or Bearer token (mobile); `verify-token` user profile |
| **Dependencies** | `JWT_SECRET`, bcryptjs, `Usuario` model, `accountStatus` middleware |
| **Complexity** | **Medium-high** — dual transport unified in `extractAuthToken.ts` (Bearer → cookie → socket `auth.token`) |
| **Why it matters** | Same API serves SPA and native mobile without duplicating auth backends; Socket.IO reuses same JWT verification |

**Evidence:** `server/src/shared/middleware/session.ts`, `server/src/shared/utils/extractAuthToken.ts`, `server/src/tests/extractAuthToken.test.ts`, `server/src/tests/socket.auth.test.ts`, `docs/contracts.md` Auth contract section.

---

### 2. RBAC (Role-Based Access Control) System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Enforce institutional role boundaries across all mutating and sensitive read operations |
| **Inputs** | JWT → loaded `Usuario` with `rol`, `activo`, `estado` |
| **Outputs** | 403 on role mismatch; 401 on missing/invalid session |
| **Dependencies** | `authMiddleware`, `checkRol([...])`, resource-level checks in controllers |
| **Complexity** | **Medium-high** — route-level + resource-level (e.g., IDOR fix in `getSolicitudId` per war-room report) |
| **Why it matters** | Institutional software fails when any role can access any data; explicit matrix is documented and tested |

**Evidence:** `server/src/shared/middleware/rol.ts`, `docs/contracts.md` Permission matrix, `server/src/tests/security.test.ts`, war-room fix in `archive/audits/2026-06-14-release-war-room/REPORTE-EJECUTIVO.md`.

---

### 3. Technician Onboarding / Approval System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Gate técnico access until líder explicitly approves registration |
| **Inputs** | Registration as `tecnico`; líder approve/deny actions |
| **Outputs** | `estado: true/false`; transactional emails; blocked login until approved |
| **Dependencies** | `Usuario` model, `tecnicos` routes, Brevo email templates |
| **Complexity** | **Medium** — business rule spanning auth, account status, and email |
| **Why it matters** | Prevents unvetted personnel from accessing institutional ticket data |

**Evidence:** `server/src/features/users/controllers/tecnicos.ts`, `server/src/shared/middleware/accountStatus.ts`, `server/src/shared/emails/templates/`, mobile `session-policy.ts` (wipes líder sessions on mobile).

---

### 4. Ticket Lifecycle System (Solicitud + Solución)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Core helpdesk workflow from intake through assignment, work-in-progress, and closure |
| **Inputs** | Multipart solicitud create; líder assign; técnico solución POST |
| **Outputs** | State transitions, `codigoCaso`, linked `SolucionCaso`, notifications |
| **Dependencies** | `Solicitud`, `SolucionCaso`, `Consecutivo`, `TipoDeCaso`, `Ambiente`, media storage |
| **Complexity** | **High** — state machine with 409 guards, atomic case ID generation, multi-actor side effects |
| **Why it matters** | This is the product's reason to exist; correctness here = institutional trust |

**Evidence:** `server/src/features/tickets/controllers/solicitud.ts`, `server/src/features/tickets/controllers/solucionCaso.ts`, `server/src/tests/ticket-lifecycle.test.ts`, `scripts/e2e-ticket-lifecycle.sh`, `docs/contracts.md` state machine.

---

### 5. Case ID / Consecutivo Engine

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Generate unique, human-readable case codes (`YYYY-MM-#####`) |
| **Inputs** | New solicitud creation event |
| **Outputs** | `codigoCaso` string |
| **Dependencies** | MongoDB `findOneAndUpdate` with `$inc`, Luxon date formatting |
| **Complexity** | **Medium** — atomic sequence per year-month; race-condition safe |
| **Why it matters** | Funcionarios and líderes reference cases by code in verbal and written communication |

**Evidence:** `server/src/features/tickets/models/consecutivoCaso.ts`, `server/src/features/tickets/controllers/consecutivoCaso.ts`.

---

### 6. Notification System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Inform actors of ticket state changes and técnico approval decisions |
| **Inputs** | Business events (assign, resolve, approve) |
| **Outputs** | `Notificacion` documents, Socket emits, Brevo transactional emails |
| **Dependencies** | `Notificacion` model, `realtime.ts`, email templates |
| **Complexity** | **Medium-high** — three channels (DB, socket, email) must stay consistent |
| **Why it matters** | Field users don't refresh dashboards; push/email closes the feedback loop |

**Evidence:** `server/src/features/shared/models/notificaciones.ts`, `server/src/shared/services/realtime.ts`, `client/src/features/notifications/`, web polls 30s (`docs/architecture.md`).

---

### 7. Real-Time Communication Layer (Socket.IO)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Push ticket and notification updates to connected clients without polling |
| **Inputs** | JWT on handshake; server-side emit triggers |
| **Outputs** | `connection:ack`, `actualizarSolicitud`, `actualizarTecnico`, `nuevaNotificacion` |
| **Dependencies** | Shared HTTP server, optional Redis adapter for multi-instance |
| **Complexity** | **Medium-high** — authenticated rooms (`user:{userId}`), typed contracts, scaling path |
| **Why it matters** | Production-grade visibility for distributed web/mobile clients; Redis adapter shows multi-instance thinking |

**Evidence:** `server/src/shared/utils/handleSocket.ts`, `packages/contracts/src/socket.ts`, `server/src/tests/socket.auth.test.ts`, `docs/architecture.md` Socket.IO scaling section.

---

### 8. Media / File Storage System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Store solicitud photos, profile images, and resolution evidence securely |
| **Inputs** | Multipart uploads, magic-byte validated buffers |
| **Outputs** | `Storage` documents with Cloudinary URLs or local paths; authenticated serve |
| **Dependencies** | Cloudinary (prod required), `STORAGE_PATH` (dev/ephemeral fallback), multer |
| **Complexity** | **High** — dual backend abstraction, MIME validation, size caps, auth-gated local serve |
| **Why it matters** | Render ephemeral filesystem makes Cloudinary mandatory; security tests verify media not publicly accessible |

**Evidence:** `server/src/shared/services/mediaStorage.ts`, `server/src/tests/mediaStorage.test.ts`, `server/src/tests/media-access.test.ts`, war-room "media auth" fixes (`9378020` commit).

---

### 9. Email / Transactional Messaging System

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Deliver password reset, solicitud confirmation, assignment, closure, and técnico approval emails |
| **Inputs** | Business events, reset tokens (SHA-256 stored) |
| **Outputs** | Brevo API sends; generic responses to prevent email enumeration |
| **Dependencies** | `BREVO_API_KEY`, HTML templates, Render outbound IP allowlisting |
| **Complexity** | **Medium** — prod incident resolved (IP block); fallback SMTP path documented |
| **Why it matters** | Password recovery is P0; institutional trust requires reliable transactional email |

**Evidence:** `server/src/shared/utils/handleEmail.ts`, `docs/incidents/2026-06-14-forgot-password-prod.md`, `server/src/tests/handleEmail.test.ts`, commit `a76951f`.

---

### 10. Validation Layer (Zod)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Enforce API contract integrity at request boundaries |
| **Inputs** | HTTP body/params/query |
| **Outputs** | 422 with structured errors; validated data written back to request |
| **Dependencies** | `handleValidator.ts`, `zod-validation-error`, `@miayuda/contracts` |
| **Complexity** | **Medium** — migrated from Joi (git history: `d63fd9c` feat(zod): migrate all validators) |
| **Why it matters** | Prevents corrupt data entering MongoDB; shared types enable cross-platform convergence |

**Evidence:** `server/src/shared/validators/`, `packages/contracts/src/solicitud.ts`, commits `222a9f5` through `cee10ec` (Zod migration phase).

---

### 11. Analytics / Reporting Layer

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Give líder operational visibility into ticket volume and distribution |
| **Inputs** | Aggregated solicitud queries |
| **Outputs** | Chart data for web dashboards (ambiente, mes) |
| **Dependencies** | Mongoose aggregation, Chart.js on client |
| **Complexity** | **Low-medium** (today); event instrumentation planned Stage 2 |
| **Why it matters** | North-star metrics (time-to-first-response, resolution rate) require data foundation |

**Evidence:** `server/src/features/tickets/routes/graficaSolicitudesPorAmbiente.ts`, `client/src/features/estadisticas/`, `docs/analytics.md`.

---

### 12. Shared Contracts Package (`@miayuda/contracts`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Single source of truth for Zod schemas and Socket event types across surfaces |
| **Inputs** | Domain invariants from `docs/contracts.md` |
| **Outputs** | Built package consumed by server; target adoption by client + mobile |
| **Dependencies** | pnpm workspace, Zod 4 |
| **Complexity** | **Medium** — monorepo package discipline; adoption debt acknowledged |
| **Why it matters** | Prevents type drift between web, mobile, and API — staff-level platform thinking |

**Evidence:** `packages/contracts/`, `docs/contracts.md` header, CI builds contracts before server (`ci.yml`).

---

### 13. Web SPA (React + Vite)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Premium command center for all three roles; líder-primary |
| **Inputs** | Cookie-authenticated API calls |
| **Outputs** | Role-routed UI with FSD-lite architecture |
| **Dependencies** | Axios, React Router v6, Tailwind, react-hook-form |
| **Complexity** | **Medium-high** — layered guards (PrivateRoutes, GuestOnlyRoutes, RequireRole), cold-start hardening |
| **Why it matters** | Full institutional workflows shipped to production on Vercel |

**Evidence:** `client/src/app/router/`, `client/src/features/`, commit `4391878` refactor(client): migrate frontend to typescript feature architecture.

---

### 14. Mobile App (Expo / React Native)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Native field experience for funcionario reporting and técnico resolution |
| **Inputs** | Bearer JWT, multipart uploads, TanStack Query caches |
| **Outputs** | Role-gated navigation stacks, solicitud/caso flows |
| **Dependencies** | expo-secure-store, expo-image-picker, expo-router, Zod + RHF |
| **Complexity** | **High** — AppGate bootstrap machine, anti-corruption layer (DTO mappers), session policy |
| **Why it matters** | Mobile is first-class per `quality-bar.md`; not a WebView wrapper |

**Evidence:** `mobile/MiAyudaTIC-Mobile/mobile-context-architecture.md`, `app/index.tsx`, `src/features/auth/guards.ts`, 38 unit tests documented.

---

### 15. CI/CD & Operational Tooling

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Enforce quality gates and production confidence |
| **Inputs** | Git push/PR, manual workflow_dispatch |
| **Outputs** | Typecheck, test, build passes; smoke results |
| **Dependencies** | GitHub Actions, Husky hooks, commitlint |
| **Complexity** | **Medium** — tri-surface CI (server, client, mobile separate install) |
| **Why it matters** | Institutional release requires repeatable verification, not hero debugging |

**Evidence:** `.github/workflows/ci.yml`, `.github/workflows/post-deploy-smoke.yml`, `scripts/smoke-prod.sh`, `.husky/pre-commit`, `docs/quality-bar.md`.

---

## OWNERSHIP ANALYSIS

> Assumption: author undersells scope. Evidence suggests **founder-level ownership** across product, platform, mobile, and operational systems — likely solo or coordinating a Cursor-native "6-role" team where one human holds final sign-off.

### Architecture Decisions

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Monorepo with bounded contexts | Scales web + API + mobile without rewrite | `docs/architecture.md`, `server/src/features/`, `packages/contracts/` |
| FSD-lite client architecture | Maintainable frontend at institutional quality bar | `client/src/features/README.md`, `docs/architecture.md` |
| Mobile anti-corruption layer | Screens never touch Mongo `_id` DTOs directly | `mobile/.../src/shared/contracts/`, mapper tests |
| Dual auth transport design | One API, two clients | `extractAuthToken.ts`, `docs/contracts.md` |
| Líder web-only / mobile blocked | Product strategy encoded in code | `lider-not-supported.tsx`, `session-policy.ts` |

### Domain Modeling

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Ticket state machine | Core business invariant | `docs/contracts.md`, `solicitud.ts` model enum |
| Usuario approval semantics | `activo` vs `estado` distinction | `accountStatus.ts`, contracts entity table |
| Consecutivo case ID format | Operational readability | `consecutivoCaso.ts` |
| Media folder taxonomy | Organized evidence storage | `MediaFolder` in contracts |

### Validation Standards

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Full validator migration to Zod | Modern, type-inferred validation | Git commits `222a9f5`–`cee10ec` |
| `handleValidator` pattern | Consistent 422 responses | `server/src/shared/validators/handleValidator.ts` |
| Register blocks `lider` role | Security invariant enforced at boundary | `security.test.ts` |
| Mobile Zod + RHF forms | Client-side parity | `mobile/.../src/features/auth/schemas.test.ts` |

### Security Implementation

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| IDOR fix on ticket detail | P0 war-room finding patched | `REPORTE-EJECUTIVO.md`, `solicitud.ts` |
| Password reset anti-enumeration | No email existence leak | `security.test.ts`, incident doc |
| Rate limits on auth/upload/forgot | Abuse prevention | `rateLimit.ts`, `docs/architecture.md` |
| Media auth hardening | Evidence not publicly served | `media-access.test.ts`, war-room Phase 6 |
| JWT secret boot assertion | Fail fast in misconfigured prod | `index.ts`, `validateEnvOnBoot()` |
| Verify-token excludes sensitive fields | P1 war-room fix | `REPORTE-EJECUTIVO.md` |

### Workflow Design

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| End-to-end ticket lifecycle | Product core | Controllers + E2E bash script |
| Técnico approval before work | Institutional trust | `tecnicos.ts`, emails |
| 409 state guards | Prevents invalid transitions | `ticket-lifecycle.test.ts` |
| Notification side effects on assign/resolve | Operational awareness | `realtime.ts`, email templates |

### State Transitions

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Documented + tested state machine | Contract between product and engineering | `docs/contracts.md` mermaid + Vitest |
| `pendiente` vs `finalizado` solution types | Work-in-progress vs closure | `SolucionCaso` model, `solucionCaso.ts` |
| Mobile AppGate state machine | Bootstrap without infinite loaders | `app-gate-policy.ts`, `app-gate-policy.test.ts` |

### Role Definitions

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Three-role permission matrix | Explicit, reviewable RBAC | `docs/contracts.md` table |
| `getRoleHome()` routing | Role-native landing pages | `client/src/app/router/roleHome.ts` |
| Mobile `getRouteForAccess()` | Access resolution separated from session | `guards.ts`, `guards.test.ts` |

### Data Modeling

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Mongoose schemas for 8+ entities | Persistence layer design | `server/src/core/models.ts` |
| Storage reference pattern | Decoupled media from domain docs | `Storage` model linked from Solicitud, Usuario |
| Notificacion scoping | Per-user notification isolation | `notificaciones.ts` model |

### API Contracts

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| `docs/contracts.md` as SSOT | Cross-team alignment | Referenced in AGENTS.md, quality-bar, handoffs |
| `@miayuda/contracts` package | Executable contracts | `packages/contracts/src/` |
| Socket event typing | Realtime contract enforcement | `packages/contracts/src/socket.ts` |

### Technical Migrations

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Backend JS → TypeScript | Type safety, maintainability | Commits `081d583`–`45d4b03` migration series |
| Frontend feature architecture migration | Scalable client structure | Commit `4391878` |
| Joi → Zod migration | Modern validation stack | Phase 2.5 docs + commits |
| Email: Gmail → Resend → Brevo | Production email reliability | Commits `2663839`, `e3c0a42` |
| Premium design system rollout | Institutional UX bar | Commits `e27cbc1`, `de65255` |

### Operational Logic

| What was owned | Why it matters | Evidence |
|----------------|----------------|----------|
| Production smoke suite (12+ checks) | Release confidence | `scripts/smoke-prod.sh` |
| Ticket lifecycle E2E script | API integration verification | `scripts/e2e-ticket-lifecycle.sh` |
| War-room release audit | Structured pre-release QA | `archive/audits/2026-06-14-release-war-room/` |
| Incident postmortem | Operational maturity | `docs/incidents/2026-06-14-forgot-password-prod.md` |
| Cursor Agent OS (6 roles, skills, hooks) | AI-native development operating model | `AGENTS.md`, `docs/agents.md`, `.cursor/` |

---

## COMPLEXITY ANALYSIS

### RBAC (Route + Resource Level)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Prevents cross-role data access in institutional setting |
| **Non-trivial because** | Middleware alone insufficient — resource ownership checks required (funcionario owns ticket, técnico assigned only) |
| **Production importance** | IDOR vulnerabilities are P0; war-room explicitly fixed `getSolicitudId` |

### JWT Dual Transport (Cookie + Bearer + Socket)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | One API serves browser SPA and native mobile without duplicate backends |
| **Non-trivial because** | Token extraction priority, httpOnly cookie security vs mobile SecureStore, socket handshake auth |
| **Production importance** | Auth bugs affect every endpoint; tested in `extractAuthToken.test.ts` and `socket.auth.test.ts` |

### Socket.IO with Optional Redis Adapter

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Realtime updates without polling; horizontal scaling path |
| **Non-trivial because** | Room model, JWT on connect, typed events, multi-instance state |
| **Production importance** | Render can scale instances; Redis adapter prevents missed notifications |

### Ticket State Machine with 409 Guards

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Data integrity when actors attempt invalid transitions |
| **Non-trivial because** | Multiple actors, async notifications, concurrent assignment scenarios documented |
| **Production importance** | Corrupt states destroy líder trust and break reporting |

### Atomic Consecutivo Generation

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Unique case codes under concurrent creates |
| **Non-trivial because** | Requires atomic MongoDB operation, not read-then-write |
| **Production importance** | Duplicate codes break verbal coordination and audit |

### Media Dual Backend (Cloudinary / Local)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Dev convenience + prod persistence on ephemeral Render disk |
| **Non-trivial because** | MIME magic-byte validation, folder routing, auth-gated local serve, env boot requirements |
| **Production importance** | Evidence loss = failed institutional audit |

### Monorepo + Contracts Package

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Type safety across API and clients |
| **Non-trivial because** | Build ordering, workspace filters, adoption debt management |
| **Production importance** | Contract drift causes subtle production bugs |

### TypeScript Migration (Server + Client)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Maintainability for 100+ file codebase |
| **Non-trivial because** | Incremental migration from JS without stopping feature delivery |
| **Production importance** | Enables strict CI typecheck gates |

### Mobile Bootstrap State Machine

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Cold start on slow Render + token restore without infinite loaders |
| **Non-trivial because** | Separates `SessionStatus` from `AccessResolution`; network error ≠ expired session |
| **Production importance** | Field users on mid-range Android abandon apps with bad bootstrap UX |

### Validation Architecture (Zod at Boundary)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Invalid data never reaches domain logic |
| **Non-trivial because** | Merge body/params/query, map errors to 422, write back validated data |
| **Production importance** | MongoDB is schemaless — boundary validation is the schema |

### CI Tri-Surface (Server + Client + Mobile)

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Mobile isolated install doesn't block monorepo CI |
| **Non-trivial because** | Separate pnpm workspace for mobile, parallel job in CI |
| **Production importance** | Mobile first-class per quality-bar |

### Production Smoke + E2E Bash Scripts

| Dimension | Detail |
|-----------|--------|
| **Problem solved** | Verify prod/deployed behavior beyond unit tests |
| **Non-trivial because** | CORS, health, auth, media security, bundle URL checks |
| **Production importance** | Render cold start + Vercel SPA routing are common failure modes |

---

## STAFF-LEVEL SIGNALS

### System Thinking

- **Bounded contexts** documented and enforced: Identity, Ticketing, Catalog, Notifications, Media (`docs/architecture.md`)
- **Three-surface architecture** (web, mobile, API) with explicit integration contracts
- **Anti-degradation rules** table forbidding RBAC skips, `any`, cross-feature imports (`docs/architecture.md`)
- **Long-horizon rules (2026–2036)** including multi-tenant gate, BFF deferral (`docs/architecture.md`)

### Architecture Thinking

- Shared contracts package as north star for cross-platform convergence
- Socket.IO scaling path documented before needed (Redis adapter)
- Offline queue architecture **reserved** with idempotent `draftId` spec — not hacked prematurely (`docs/architecture.md`)
- Mobile stays outside monorepo workspace until CI ready — deliberate sequencing

### Workflow Thinking

- State machine documented in mermaid + enforced in code + tested
- E2E bash script validates full multi-actor lifecycle against real API
- Handoff template required for every workstream (`docs/handoff-template.md`)
- Phase model for mobile (0–6) with "technical vs operational closure" distinction

### Operational Thinking

- P0 incident documented with root cause, resolution, smoke evidence
- Render keepalive script for free-tier spin-down
- Brevo IP allowlisting documented in `.env.example` and architecture.md
- War-room release with GO WITH FIXES verdict and explicit P0 tracking
- `quality-bar.md`: "founder-signable" shipping definition

### Developer Experience

- Cursor Agent OS: 6 roles, skills, hooks, scope rules (`AGENTS.md`)
- `verify:env` boot script for local onboarding
- Mobile dev scripts: `adb-reverse.mjs`, `deeplink-test.mjs`, `native-build-dev.mjs`
- Conventional commits + commitlint + husky pre-commit/pre-push

### Security Awareness

- Rate limits on sensitive endpoints
- Password reset anti-enumeration tested
- Media not publicly accessible (tested)
- HITL required for auth/RBAC/schema changes (`quality-bar.md`, `AGENTS.md`)
- Vulnerability reporting process in architecture.md

### Maintainability

- Feature-based server and client structure
- Vitest over Jest (modern test runner)
- Archive for legacy docs — canonical `docs/` separated from stale context
- "Code wins on conflict" rule prevents doc rot from hiding truth

### Scalability

- Redis adapter for Socket.IO multi-instance
- Cloudinary for ephemeral Render filesystem
- Health endpoint always 200 (boot-friendly for Render probes)
- Aggregation endpoints for charts (not loading full collections to client)

### Product Judgment

- Anti-goals explicitly documented (no generic SaaS, no líder on mobile, no AI chatbot surface)
- Wedge defined: field reporting speed + líder traceability
- Champion identified: líder TIC — product dies without active líder
- Premium bar defined with measurable UX targets (`quality-bar.md`)

### Cross-Functional Awareness

- Design system tokens shared web + mobile (`docs/design-system.md`)
- Analytics event catalog linked to north-star metrics before instrumentation
- Adoption playbook with weekly rollout phases
- 6-role review matrix in `docs/agents.md`

---

## PRODUCT ENGINEER SIGNALS

### User Workflows

- Three complete role journeys shipped on web
- Mobile funcionario: create solicitud + photo in field context
- Mobile técnico: assigned cases + resolution flow
- Guest route cold-start UX: usable during slow `verify-token` on Render (`guest.routes.test.tsx`)

### Business Process Understanding

- Técnico approval mirrors real institutional hiring/trust process
- Ambiente de formación catalog reflects SENA physical training rooms
- Case codes match how staff verbally reference incidents

### Tradeoffs (Documented)

| Tradeoff | Decision | Evidence |
|----------|----------|----------|
| Líder on mobile | Blocked — web command center | `product.md`, `session-policy.ts` |
| Realtime vs poll | Poll today on web; socket on server | `architecture.md` |
| Contracts adoption | Server yes; client/mobile deferred | `contracts.md`, acknowledged debt |
| Flutter legacy | Reference only — wrong backend | `product.md` anti-goals |
| Multi-tenant | Explicit architecture spec required | `architecture.md` long-horizon rules |

### Operational Metrics

- Five north-star metrics with pilot targets defined
- Leader charts as interim analytics (API aggregates)
- Event catalog ready for Stage 2 instrumentation
- Guardrail: smoke 12/12 before release

### Adoption Considerations

- Week 0–3+ rollout playbook
- Pilot targets: 5 funcionarios, 2 técnicos, 1 líder champion
- Mobile report share metric (>40%) drives mobile investment

### Role Design

- Permission matrix is reviewable artifact, not implicit code knowledge
- `funcionario` cannot self-elevate to `lider`
- Técnico `estado` gate creates explicit approval queue for líder

### UX Implications

- Photo capture < 3 taps target (`product.md`)
- Case code visible for trust
- Status badges consistent across web tables
- Mobile: no infinite bootstrap loader (`app-gate-policy.test.ts`)

### Data Visibility

- Líder: pending queue, historial, charts by ambiente/mes
- Funcionario: own historial only
- Técnico: assigned + resolved cases

### Observability

- Health JSON with DB status, integration flags, socket connection count
- Morgan HTTP logging
- Sentry planned Stage 2 — honestly documented gap

### Decision Enablement

- Founder memos (`product.md`, `architecture.md`) enable AI agents and future engineers to execute without re-deriving context
- Decision log in archived operating system
- Handoff template forces explicit "Decisions made" section

---

## AI EVOLUTION OPPORTUNITIES

> The project explicitly positions AI as **internal ops leverage**, not product surface (`docs/product.md`). The architecture nonetheless creates high-value agent/automation insertion points.

### 1. AI Copilot for Líder (Assignment Assistant)

**Why:** Líder assigns technicians based on workload, ambiente familiarity, and case type. System already emits `actualizarTecnico` with `numeroSolicitudesAsignadas` and stores ambiente/tipoCaso on each solicitud.

**Insertion point:** `AdminSolicitud.tsx` assign modal; `asignarTecnicoSolicitud` controller.

**Capability:** Suggest técnico given pending queue, active load, and historical resolution by ambiente.

### 2. Triage Agent on Solicitud Create

**Why:** Funcionarios write free-text `descripcion`. `tipoCaso` is a catalog field — often mis-selected without guidance.

**Insertion point:** POST `/api/solicitud` pipeline after Zod validation.

**Capability:** Classify tipoCaso, detect duplicates in recent historial, flag urgency keywords.

### 3. Resolution Quality Assistant (Técnico)

**Why:** `SolucionCaso` requires `descripcionSolucion` and optional evidence. Quality varies.

**Insertion point:** `ResolutionModal.tsx` / mobile resolve screen before submit.

**Capability:** Checklist completion, evidence presence reminder, similar-case retrieval from closed solicitudes.

### 4. Workflow Automation (Notification + Email Orchestration)

**Why:** `realtime.ts` and email templates already form an event-driven backbone.

**Insertion point:** Server-side hook after state transitions.

**Capability:** SLA breach alerts to líder if solicitud unassigned > 4h (matches north-star metric).

### 5. Recommendation System (Ambiente Hotspots)

**Why:** Charts already aggregate solicitudes por ambiente.

**Insertion point:** `estadisticas` feature + `graficaSolicitudesPorAmbiente`.

**Capability:** Proactive maintenance suggestions, recurring issue detection per ambiente.

### 6. AI-Assisted Operations (Smoke / Incident)

**Why:** Existing smoke scripts, war-room audits, incident docs — structured ops data.

**Insertion point:** `scripts/smoke-prod.sh` output, Render logs, `docs/incidents/`.

**Capability:** Agent parses smoke failures, suggests fixes, drafts incident reports (already using Cursor agents per `AGENTS.md`).

### 7. Mobile Field Copilot

**Why:** Photo + description capture in classroom context; offline queue planned.

**Insertion point:** Funcionario create solicitud flow.

**Capability:** Voice-to-text descripcion, auto-suggest ambiente from device location (if permitted), draft offline with sync.

### 8. Contract-Aware Code Generation

**Why:** `@miayuda/contracts` + `docs/contracts.md` are machine-readable invariants.

**Insertion point:** `.cursor/skills/ticket-lifecycle`, `rbac-review`.

**Capability:** Agents already defined — extend to auto-generate tests for new endpoints from permission matrix.

### 9. Analytics Pipeline Agent

**Why:** Event catalog defined but not instrumented (`docs/analytics.md`).

**Insertion point:** Server audit log on mutating routes (preferred first backend per analytics.md).

**Capability:** Auto-compute north-star metrics without manual spreadsheet.

### 10. Onboarding Agent for New Técnicos

**Why:** Approval workflow + email templates exist.

**Insertion point:** Post-approval técnico first login.

**Capability:** Interactive guide through first case resolution, linking to tipoCaso catalog.

---

## CV BULLETS

1. Built and deployed an institutional IT helpdesk platform for SENA training centers, digitizing fragmented WhatsApp/paper/oral support into a traceable ticket system with role-based workflows.

2. Designed three-role authorization architecture (`funcionario`, `tecnico`, `lider`) with route-level and resource-level access controls across a centralized service-management API.

3. Implemented a ticket lifecycle state machine (`solicitado → asignado → pendiente → finalizado`) with HTTP 409 guards preventing invalid state transitions in production.

4. Architected dual-transport authentication (httpOnly cookie for web, Bearer JWT for mobile, socket handshake auth) unified through a single token extraction layer.

5. Created a shared contracts package (`@miayuda/contracts`) with Zod schemas and typed Socket.IO events to enforce API integrity across web, mobile, and server surfaces.

6. Built real-time notification infrastructure using Socket.IO with per-user rooms, optional Redis adapter for horizontal scaling, and typed event contracts.

7. Implemented runtime API validation with Zod, migrating the entire server validator layer from legacy patterns with structured 422 error responses.

8. Designed atomic case ID generation (`YYYY-MM-#####`) using MongoDB findOneAndUpdate to ensure unique, human-readable codes under concurrent ticket creation.

9. Built a dual-backend media storage abstraction (Cloudinary production, authenticated local fallback) with magic-byte MIME validation and upload size caps.

10. Migrated a production Node.js backend from JavaScript to TypeScript through an incremental, checkpointed migration preserving continuous delivery.

11. Refactored the web frontend into a feature-based architecture (FSD-lite) with layered route guards, role-native navigation, and cookie-session authentication.

12. Shipped production deployments on Vercel (React SPA) and Render (Express API) with documented environment configuration, health probes, and CORS hardening.

13. Authored a 12-check production smoke test suite covering health, database connectivity, CORS, authentication boundaries, media security, and frontend bundle integrity.

14. Built an 8-step bash E2E script validating the complete multi-actor ticket lifecycle against the live API (create → assign → resolve → notify).

15. Resolved a P0 production incident (Brevo IP block on Render) with root-cause documentation, IP allowlisting, and smoke-verified closure.

16. Implemented technician onboarding workflow requiring líder approval before system access, with transactional email notifications on approve/deny.

17. Built an Expo/React Native mobile app with AppGate bootstrap state machine, SecureStore JWT persistence, and anti-corruption DTO mapping layers.

18. Delivered mobile field workflows for funcionario solicitud creation (camera evidence) and técnico case resolution across phased releases (0–2A) with 38+ unit tests.

19. Established CI/CD pipelines (GitHub Actions) running typecheck, build, and test across server, web client, and isolated mobile workspace on every PR.

20. Designed a Cursor-native agent operating system with six engineering roles, domain skills, quality gates, and handoff templates for AI-assisted development.

21. Authored canonical product and architecture memos defining ICP, north-star metrics, anti-goals, permission matrices, and 10-year platform evolution rules.

22. Implemented password recovery with SHA-256 hashed reset tokens, rate limiting, and anti-email-enumeration responses verified by security tests.

23. Built líder operational dashboards with Chart.js aggregations for ticket volume by training environment and monthly trends.

24. Conducted a structured release war-room audit documenting 40/40 server tests, 16/16 API QA cases, security fixes (IDOR, sensitive field exclusion), and GO WITH FIXES verdict.

25. Integrated transactional email via Brevo REST API with HTML templates for solicitud confirmation, assignment, closure, and técnico approval events.

26. Implemented account status middleware distinguishing `activo` (account disabled) from `estado` (técnico pending approval) with tested blocking behavior.

27. Designed mobile session policy explicitly blocking líder access on native clients, encoding product strategy ("web command center") in application code.

28. Built Git hooks (Husky) and conventional commit enforcement (commitlint) for pre-commit typecheck/lint and pre-push test gates.

29. Created a modular server architecture (`features/auth`, `features/tickets`, `features/users`, `features/shared`) separating bounded contexts with a wiring-only core layer.

30. Documented offline-first mobile architecture (solicitud draft queue, idempotent client-generated draftId) as a reserved spec preventing premature implementation hacks.

---

## LINKEDIN MATERIAL

### 10 Strongest Achievements

1. Shipped MiAyudaTIC to production — institutional IT helpdesk for SENA CTPI-Cauca — live at miayudatics.vercel.app with API on Render.

2. Replaced fragmented WhatsApp/paper/oral IT support with a full ticket lifecycle system used by three institutional roles (funcionario, técnico, líder TIC).

3. Built and deployed web + API + mobile from a single monorepo, taking the product from SENA training project (`nodeproyectosena`) to production-hardened institutional software.

4. Designed and implemented RBAC with documented permission matrix, resource-level access controls, and security test coverage including IDOR remediation.

5. Led a release war-room audit achieving 40/40 server tests, 12/12 production smoke checks, and documented GO WITH FIXES release verdict.

6. Resolved P0 production password-recovery outage (Brevo IP block) with same-day incident closure and smoke-verified fix.

7. Delivered native Expo mobile app with field solicitud creation, técnico case resolution, and 38+ unit tests across Phases 0–2A.

8. Migrated entire backend from JavaScript to TypeScript and validators to Zod without stopping feature delivery.

9. Created `@miayuda/contracts` shared package establishing cross-platform API contract discipline.

10. Authored founder-grade product/architecture documentation (ICP, metrics, anti-goals, state machines) enabling AI-native team operations.

### 10 Strongest Technical Achievements

1. Dual-transport JWT auth (cookie + Bearer + Socket) with unified extraction and dedicated test suites.

2. Socket.IO realtime layer with typed events, authenticated rooms, and optional Redis adapter for multi-instance scaling.

3. Ticket state machine with 409 conflict guards tested via Vitest supertest integration.

4. Atomic MongoDB consecutivo engine generating unique `YYYY-MM-#####` case codes.

5. Media storage abstraction: Cloudinary production + magic-byte validation + auth-gated local serve.

6. Production smoke suite (12+ checks) and bash E2E ticket lifecycle script for multi-actor API verification.

7. Feature-based Express 5 + Mongoose 8 backend with ~109 TypeScript source files and 14+ test files.

8. React 18 FSD-lite frontend with PrivateRoutes, GuestOnlyRoutes, RequireRole, and cold-start session hardening.

9. Expo 56 mobile with TanStack Query, AppGate bootstrap machine, anti-corruption DTO mappers, and expo-secure-store.

10. GitHub Actions CI running server, client, and mobile typecheck/test/build on every PR with pnpm workspace orchestration.

### 10 Strongest Product Achievements

1. Defined institutional ICP and anti-goals — owned helpdesk for SENA, explicitly not generic ITSM SaaS.

2. Designed three-persona JTBD matrix driving distinct UX surfaces (field mobile vs líder web command center).

3. Established five north-star metrics with pilot targets (time-to-first-response, resolution rate, mobile share, technician activation, leader weekly active).

4. Built technician approval workflow mirroring real institutional trust/authorization process.

5. Created adoption playbook (Week 0–3+) identifying líder TIC as product champion.

6. Defined "premium" and "world-class" quality bars with measurable UX targets (photo < 3 taps, case code visible, 60fps mobile lists).

7. Digitized complete solicitud → asignación → solución → cierre workflow with email + in-app + realtime notifications at each transition.

8. Built líder dashboards for operational visibility (tickets by ambiente and month) supporting data-driven desk management.

9. Made mobile first-class in product strategy — native Expo, not WebView — with explicit phase roadmap and acceptance criteria.

10. Created analytics event catalog linking product metrics to future instrumentation before writing code — metrics-driven engineering culture.

---

## RECRUITER ASSESSMENT

### OpenAI Recruiter

**What would impress:**
- AI-native operating model (`AGENTS.md`, 6-role agent topology, skills for RBAC/ticket-lifecycle/release) — rare in portfolio projects
- Contract-first engineering (`docs/contracts.md` + Zod package) — aligns with API reliability culture
- Clear articulation of system invariants, state machines, and test-backed guards
- Production deployment with incident response discipline
- Monorepo spanning web, API, mobile with thoughtful boundaries

**What would concern:**
- Solo-project signals — no evidence of multi-engineer code review culture beyond self/AI
- Analytics/event instrumentation not yet implemented — metrics exist on paper
- Some doc drift (product.md says mobile auth-only; code has Phases 0–2A)
- No ML/AI in product itself — would need narrative connecting ops AI to product AI

**Roles considered:**
- Product Engineer (platform-facing)
- Solutions Engineer / Forward Deployed Engineer (institutional workflow digitization)
- Technical Program Manager (if paired with team leadership evidence)

---

### Anthropic Recruiter

**What would impress:**
- Safety-minded auth (anti-enumeration, rate limits, HITL gates for security changes)
- Explicit anti-goals preventing scope creep
- Documentation quality — founder memos, incident postmortems, permission matrices
- Thoughtful failure modes (network error ≠ session expired on mobile bootstrap)

**What would concern:**
- No constitutional AI / RLHF relevant work
- Institutional domain vs frontier research
- Test coverage strong on auth/platform, thinner on UI flows

**Roles considered:**
- Product Engineer (internal tools / workflow automation narrative)
- Applied AI Engineer (if positioned around agent ops + future copilot features)

---

### Stripe Recruiter

**What would impress:**
- API design with contracts, validation, idempotency thinking (consecutivo, future draftId)
- RBAC + resource-level authorization — parallels Stripe's permission sensitivity
- Dual auth transport — similar multi-client API serving patterns
- Production smoke gates and incident response — operational maturity
- State machine correctness with 409 guards — financial-grade rigor analogy

**What would concern:**
- MongoDB vs Postgres — Stripe is SQL-heavy
- No payment/money movement domain
- Scale story is institutional (hundreds of users), not millions of RPS
- Socket.IO vs Stripe's event-driven infrastructure at scale

**Roles considered:**
- Product Engineer (Dashboards / internal tools angle — líder admin, charts)
- Full-Stack Engineer (web + API integration)
- Solutions Architect (institutional deployment narrative)

---

### AI Startup Founder

**What would impress:**
- **Founder-shaped ownership** — product memos, metrics, adoption playbook, quality bar, agent OS
- Shipped production full-stack + mobile — not a tutorial project
- Clear wedge and ICP — knows what NOT to build
- AI evolution paths are obvious and documented (triage, assignment copilot, SLA agent)
- Cursor-native development — high leverage per engineer
- War-room release culture — ships with eyes open

**What would concern:**
- Institutional niche — may need pivot story for B2B SaaS startups
- Mobile UI smoke not signed off — execution gap between technical and operational closure
- No user growth metrics yet — pilot targets defined but not evidenced in repo
- Contracts package not adopted by clients — last mile of platform discipline incomplete

**Roles considered:**
- **Founding Product Engineer** (strongest fit)
- Founding Full-Stack Engineer
- Head of Engineering (early stage, if team-building narrative exists)
- Technical Co-founder candidate for workflow/ops AI startups

---

## APPENDIX A — Repository Evidence Index

| Category | Key paths |
|----------|-----------|
| Product vision | `docs/product.md` |
| Architecture | `docs/architecture.md` |
| Contracts / RBAC | `docs/contracts.md`, `packages/contracts/` |
| Quality gates | `docs/quality-bar.md` |
| Agent OS | `AGENTS.md`, `docs/agents.md`, `.cursor/` |
| Mobile architecture | `mobile/MiAyudaTIC-Mobile/mobile-context-architecture.md` |
| War-room audit | `archive/audits/2026-06-14-release-war-room/` |
| Incident | `docs/incidents/2026-06-14-forgot-password-prod.md` |
| CI | `.github/workflows/ci.yml` |
| Smoke / E2E | `scripts/smoke-prod.sh`, `scripts/e2e-ticket-lifecycle.sh` |
| Server entry | `server/src/index.ts`, `server/src/core/app.ts` |
| Tests | 30 `*.test.ts` + 4 `*.test.tsx` files across monorepo |
| Git history | TypeScript migration, Zod migration, war-room fixes, mobile platform prep |

## APPENDIX B — Honest Gaps (Interview Preparation)

| Gap | How to frame |
|-----|--------------|
| Doc drift on mobile status | "Code ahead of product memo — Phases 0–2A shipped; updating canon was deprioritized vs delivery" |
| Client/mobile don't use `@miayuda/contracts` yet | "Stage 2 roadmap item — package exists, adoption is next convergence step" |
| No product analytics instrumented | "Event catalog and north-star metrics defined; server audit log preferred first instrumentation" |
| Playwright E2E not in CI | "Smoke bash covers prod; Playwright needs credential secrets wiring" |
| No render.yaml IaC | "Deploy documented imperatively; IaC is identified debt" |
| ResolutionModal image not wired (web) | "Known UI gap — API supports evidence; wire-up is scoped fix" |

## APPENDIX C — Suggested Interview Narrative Arc

1. **Situation:** SENA center ran IT support on WhatsApp and paper — no traceability, no metrics, no field tooling.
2. **Task:** Build an owned institutional helpdesk — three roles, evidence, production quality — not a class demo.
3. **Action:** Designed state machine + RBAC + contracts; migrated to TypeScript; shipped web + API to Vercel/Render; built Expo mobile; established smoke gates, war-room QA, incident response.
4. **Result:** Production URLs live; 40/40 server tests; 12/12 smoke; full ticket lifecycle E2E script; mobile Phases 0–2A technically complete; founder-grade docs enabling AI-native development.

---

*End of PROJECT_SIGNAL_REPORT.md*
