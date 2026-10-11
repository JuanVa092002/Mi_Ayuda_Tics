# MiAyudaTIC - New Engineer Onboarding

## Quick System Overview (5 minutes)

MiAyudaTIC is a **feature-based monorepo** for SENA/CTPI institutions that need to digitize paper / WhatsApp support workflows. It provides:

- **Web** (React 18 + Vite + TypeScript) + **Mobile** (Expo + React Native) + **PWA** parallel delivery
- **Workflow v2 engine**: 6-state RBAC machine with idempotency & append-only log
- **Real-time**: SSE push notifications (web) + offline queue (mobile)
- **Deploy**: Render backend + Firebase Hosting prod+qa + EAS mobile

## Run Everything Locally

```bash
# Clone & pnpm
cd /home/juanc/proovian/apps/MiAyudaTics
pnpm install

# Database: MongoDB local (standalone) - create `miayudatic` database
mongod --dbpath /tmp/mongodb

# Backend (http://localhost:3001)
cd server
cp .env.sample .env
# Fix PORT=3001, MONGO_URI=mongodb://localhost:27017/miayudatic
pnpm run dev

# Web Client (http://localhost:3000)
cd ../client
cp .env.sample .env
# Fix VITE_API_URL=http://localhost:3001
pnpm run dev

# Mobile App
taskkill -f -im adb.exe # kill any stale devices
cd ../mobile
cp .env.sample .env
npx expo start --clear
# Use Android Studio Emulator or iOS Simulator; EAS not needed for dev
```

## Key Files to Understand the System

| Task | Key File | Responsibility |
|------|----------|---------------|
| Auth flow | `server/src/features/auth/auth-service.ts` | Login, register, JWT | all roles
| RBAC enforcement | `server/middleware/checkRol.ts` | Role enums, route guards, 403 guards |
| Workflow v2 engine | `server/src/features/solicitud-lifecycle.ts` | Pure state machine, lifecycle transitions, allowed roles |
| Workflow orchestrator | `server/src/features/solicitud-workflow.ts` | Transaction + historia append + SSE emit + email
| Idempotency | `server/src/features/workflow-idempotency.ts` | operationId + payloadHash unique key
| SSE broadcaster | `server/app.ts` | SSE stream + broadcast loop
| Client auth | `client/src/features/auth/` | React + JWT cookie + ProtectedRoute
| Mobile auth | `mobile/libs/session/` | Expo SecureStore + SessionStatus 6-state mobile auth
| Mobile offline | `mobile/libs/offline/` | Offline queue + persistence + sync on resume

## Critical Invariants NEVER Break

1. **Role column isolation**: Never let a user perform action outside their allowed `tipoRol` matrix
2. **Idempotency**: Never change state more than once for same `operationId`; always return 403 Conflict if duplicate
3. **Historial append-only**: Never delete `HistorialSolicitud` events
4. **Dual extraction**: Always check both `Cookie` and `Authorization: Bearer` for JWT
5. **V1/V2 coexistence**: always call `isLegacyWorkflow(s)` guard before state mutations
6. **ConsecutivoCaso**: always check `codigoCaso` uniqueness before commit
7. **SSH router secrets**: NEVER check in Expo push token or Firebase keys

## How to Add a New Endpoint Safely (9 steps)

1. **Define route contract** (add to `/packages/contracts/` if shared): schema, DTO, rules
2. **Life in private lifecycle**: update `solicitud-lifecycle.ts` with valid transition, precondition, role filter
3. **Implement controller** (server/src/features/solicitudes/*.ts): validate input, deserialize, call workflow orchestrator
4. **Write idempotency hash**: compute consistent `operationId` + `payloadHash` string; ensure unique
5. **Call *workflow.ts**: `solicitudWorkflow(action, user, solicitudId, requestPayload)` – includes transaction + historia + SSE + email
6. **Emit SSE event** (inside workflow): `sseBroadcast({ type: nombre_event:update, payload })`
7. **Return dedup token**: `res.setHeader(X-Dedup-Token, operationId)` for retry safety
8. **Write unit tests**: create `test/solicitudes/new-action.test.ts`; cover all role validations and idempotency
9. **Write integration tests**: backend integration + client tests cover UI guard buttons

## How to Add a New Workflow Action (7 steps)

1. **Define action**: name, payload schema, next state, allowed roles
2. **Add lifecycle**: update `solicitud-lifecycle.ts` with validTransition function guard clause
3. **Extend orchestrator**: add case to `solicitud-workflow.ts` switch; compute payload hash; prepare transaction; mutate + append + email
4. **Update idempotency**: `workflow-idempotency.ts` with payloadHas function template
5. **Add historial**: add `HistorialSolicitud.operationId` + `tipoEvent` + `detalles` append line inside transaction
6. **Emit SSE**: add `sseBroadcast({ type: estadoista:update })` inside orchestrator success
7. **Client UI**: web + mobile + PWA client UI badge or nudge update actions available

## Test Commands

```bash
# Server tests (176 unit + integration)
cd server && pnpm test

# Client tests (81 unit tests)
cd client && pnpm test

# Mobile tests (43 unit tests)
cd mobile && pnpm test

# All tests
cd . && pnpm -r test

# TypeScript type-check all surfaces
pnpm -w exec tsc
```

## Architecture Reference

- Real-time: SSE `/api/notificaciones/stream` (web only) + offline queue (mobile)
- Auth: JWT in HttpOnly cookie (web), SecureStore JWT (mobile) OR OIDC planned
- Workflow: state machine + RBAC guards + idempotency key + atomic transactions
- Key files: workflow files (lifecycle, orchestrator, idempotency, atomicity)

## Troubleshooting Tips

1. **Cannot set headers after send**: Check orders: always return res.status(200) last; never send async mail after res.status fired
2. **SSH connection refused**: Run mongod local; confirm MONGO_URI env matches local MongoDB
3. **SSE disconnected**: Ensure SSE header `Accept text/event-stream` + no network hops; disable Adblocker
4. **Mobile offline**: clear Expo cache; Expo start --clear; ensure separate WIFI; check offline-store file permissions
5. **JWT decode fail**: confirm dual extraction (cookie + bearer) in middleware; check mobile token stored in SecureStore

## Onboarding Checklist

- [ ] Clone repo, install pnpm, run all surfaces locally once
- [ ] Generated first test user per role (funcionario, tecnico, lider)
- [ ] Created first solicitud and transition through states
- [ ] Toggled networks: verified web SSE, mobile offline, PWA install nudge
- [ ] Run tests → dancing 176 + 81 + 43 all green
- [ ] Pushed dummy case → viewed server logs → confirmed history append and SSE emit sequence

## Where Does Documentation Live?

| Location | Purpose |
|----------|---------|
| `docs/canonical/` | Canonical reference (this file)
| `README_ROOT.md` | Root README (single page quick start link)
| `PROJECT_OVERVIEW.md` | What MiAyudaTIC is and evolution timeline
| `ARCHITECTURE.md` | System topology and component responsibilities
| `WORKFLOW_V2.md` | Workflow v2 state machine deep guide
| `CONTRIBUTIONS_AND_EVIDENCE.md` | Confidence levels and portfolio claims
| `KNOWN_LIMITATIONS.md` | Known issues, debt, missing features
| `ONBOARDING.md` | this file
| `AGENT_CONTEXT.md` | AI agent entry point optimized format
