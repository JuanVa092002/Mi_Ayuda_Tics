# MiAyudaTIC - Agent Context (Optimized)

## Project Identity (1 paragraph)

MiAyudaTIC is a feature-based monorepo originally created to replace paper and WhatsApp support workflows in SENA technical training centers with a unified, software-based, workflow v2 state machine engine (atomic transactions, idempotency keys, 6-state RBAC matrix isolation, append-only audit log). It supports parallel delivery surfaces: Web (React 18 + Vite + TypeScript + Tailwind) + Mobile (Expo + React Native) + PWA (Service Worker + Manifest), all communicating with a central API (Express 5 + MongoDB Atlas + Zod + JWT dual extractor) deployed on Render, Firebase Hosting, and EAS.

## Repository Structure (compact)

```
miayudatic/
  docs/canonical/     # This document + canonical reference
  client/             # Web React 18 + Vite + TypeScript + PWA
  server/             # API Express 5 + Mongoose 8 + TypeScript + Feature-based
  mobile/             # Mobile Expo 56 + React Native + Expo Router + TanStack Query
  packages/contracts/ # Shared Zod schemas (@miayuda/contracts)
```

## Current HEAD

- SHA: a61cde32b3131c4e6d3be284afb6d5eb2aa5d566
- Date: 2026-10-10 (Sat Oct 10 2026)
- Tag: v2.0.0-backend-ts-migration
- Meaning: Backend TypeScript migration closed; workflow v2 engine landed; PWA implemented; production operational
- Uncommitted: client/public/version.json, client/src/pages/loginMain/LoginMain.tsx
- Branch status: develop branch is 22 commits behind master (entire QA running pre-PWA codebase)

## Architecture (200 words)

MiAyudaTIC is a feature-based monorepo with loosely coupled components. Web (React 18 / Vite / TypeScript) and Mobile (Expo / React Native) independently implement UI over a shared API (Express 5 / Mongoose 8). API serves JWT via dual extraction (Cookie for web, Bearer for mobile) and enforces role isolation (funcionario/tecnico/lider) with middleware guards (403 verboten). Workflow v2 engine (commit 48a67f8f) is the heart: pure lifecycle state machine + orchestrator + idempotency (operationId + payloadHash) + transactions (Atlas) / compensating (local) + append-only event log (14 types). Realtime is Server-Sent Events (SSE) for web push, offline queue for mobile, and 60s poll fallback. Contracts are shared Zod schemas in packages/contracts/@miayuda/contracts. Deploys: Render Docker (backend), Firebase Hosting (prod+qa web), and EAS builds (mobile Android). PWA features were added in HEAD: Service Worker, Manifest, and role-aware install nudge. Three mobile strategies coexist: Expo native, PWA, and Flutter legacy (untracked, abandoned).

## Critical Files (Must Understand)

| File | Surface | Responsibility |
|------|--------|---------------|
| server/src/features/solicitud-lifecycle.ts | API | Pure state machine / role isolation matrix / transition guards
| server/src/features/solicitud-workflow.ts | API | Orchestrator I/O + transactions + historia append + SSE emit + email dispatch, returns dedup token X-Dedup-Token
| server/src/features/workflow-idempotency.ts | API | Deduplication logic (unique index) + conflict 403 HTTP response
| server/src/features/workflow-atomicity.ts | API | Runtime decision: Atlas transactions vs local compensating logic
| server/middleware/extractAuthToken.ts | API | Dual extraction (Cookie bearer) extractor; extracts JWT from either cookie or Authorization header
| mobile/libs/offline/offline-store.ts | Mobile | File-backed persistence for mobile offline mutations (JSONL format) + auto sync on WIFI resume
| mobile/libs/session/session.ts | Mobile | SessionStatus 6-state mobile auth machine using Expo SecureStore
| client/public/sw.js | Web | PWA Service Worker: cache assets + background sync + install prompt role-aware nudge timing
| client/public/manifest.json | Web | PWA manifest: name, icons, theme color, PWA scope route

## Workflow v2 Quick Reference

```mermaid
stateDiagram-v2
  [*] --> nuevo: crear (funcionario)
  nuevo --> asignado: assign (lider)
  nuevo --> cancelado: cancel (lider)
  asignado --> en_progreso: start (tecnico)
  en_progreso --> esperando_usuario: wait (tecnico)
  esperando_usuario --> en_progreso: reply (funcionario)
  en_progreso --> resuelto: resolve (tecnico)
  resuelto --> cerrado: confirm (funcionario)
  resuelto --> reabierta: reopen (any)
  cerrado --> [*]
  en_progreso --> cancelado: cancel (lider)
  reabierta --> resuelto: resolve (tecnico)
```

## Key Invariants (NEVER Violate)

1. Role column isolation: funcionario/tecnico/lider strict RBAC via JWT+403 guards; never allow unauthorized state transition
2. Idempotency: operationId + payloadHash unique -> 403 Conflict on duplicate
3. Historial append-only: never delete events from HistorialSolicitud
4. Dual extraction: always check Cookie THEN Authorization header for JWT across all endpoints
5. V1/V2 coexistence: guard, always wrap legacy calls in `isLegacyWorkflow(s)` 
6. ConsecutivoCaso: ensure unique `codigoCaso` via sequence generator before persistence
7. SSE safe fallback: keep 60s poll fallback + gracefully degrade if SSE unavailable

## What NOT to Do

- Do NOT delete `HistorialSolicitud` events (append-only principle)
- Do NOT bypass `extractAuthToken(req)` dual extractor pattern
- Do NOT assume SSE always works across CDNs; keep 60s poll fallback
- Do NOT commit Expo push private keys or Firebase admin SDK config
- Do NOT rename paths without updating `packages/contracts/` schemas and redeploy both surfaces
- Do NOT drop `workflowVersion` guard without a or yen zero-coexistence migration run on Atlas
- Do NOT promise realtime mobile push; we have offline queue + PWA install + SSE web only

## Where Documentation Lives (Agent Entry Points)

| File | Purpose |
|------|---------|
| docs/canonical/README_ROOT.md | Root README (single page quick start reference translated; wrap links but no deep text)
| docs/canonical/PROJECT_OVERVIEW.md | Value proposition + high-level evolution + three mobile strategies note
| docs/canonical/ARCHITECTURE.md | System topology, responsibilities, all API routes, auth, database, realtime, deployment, pWA contract
| docs/canonical/ENGINEERING_HISTORY.md | 6 phases with SHAs + key decisions + workflow v1->v2 evolution
| docs/canonical/WORKFLOW_V2.md | Workflow v2 deep reference: state machine, idempotency, atomicity, V1/V2 coexistence, safety props, CV bullets
| docs/canonical/CONTRIBUTIONS_AND_EVIDENCE.md | Evidence per claim; CV bullets ready vs qualify; interview talking points (then January run verify Git provenance script to confirm HEAD)
| docs/canonical/KNOWN_LIMITATIONS.md | Known issues: I2 open, I3 partially fixed, TD-04 deferred, validity unsure ISO 6 phases; uses priority table for triage
| docs/canonical/ONBOARDING.md | Local run commands, key files, add endpoint guide, add workflow action guide, test commands, troubleshooting
| docs/canonical/AGENT_CONTEXT.md | this file - optimized for AI entry point

## Required Project Config

Tip: Always check `git status`, `git log --oneline -5`, and `git diff` before any code modification; never stage credit without explicit request. Never commit from agent tools.