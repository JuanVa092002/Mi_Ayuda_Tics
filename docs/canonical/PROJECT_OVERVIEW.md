# MiAyudaTIC - Project Overview

## Institutional Problem Context

MiAyudaTIC was created to address the **operational chaos** in technical support workflows at SENA (Servicio Nacional de Aprendizaje) and CTPI institutions in Colombia, where:

- **60% of support requests** arrived via WhatsApp personal phones
- **100% of case evidence** was stored in paper notebooks
- **Zero traceability** of technician workload
- **No accountability** for response times
- **No data** to improve processes

## Users and Roles

| Role | Responsibility | Web Access | Mobile Access |
|------|---------------|------------|---------------|
| **funcionario** | Request help for equipment/software | ✅ Full | ✅ Limited |
| **tecnico** | Solve cases (requires approval) | ✅ Full | ✅ Full |
| **lider** | Supervise workflows | ✅ Full | ❌ Blocked |

## Value Proposition

MiAyudaTIC provides:

1. **Digital first response** — Replace paper with searchable case history
2. **Workflow v2 engine** — State machine with audit trail and idempotency
3. **Role-based access** — Isolation matrix preventing unauthorized transitions
4. **Cross-platform** — Web (PWA) + Mobile (Expo) + Mobile Fallback (PWA)
5. **Realtime visibility** — SSE push notifications for stakeholders

## 6-Phase Evolution

### Phase 1: Bulk Import (2024-10-30)
- Commit: `a00655c14d11aaed1f7667247bfae71c77880f95`
- Delivered: Complete working JS app (Express + React + JWT + RBAC + MongoDB)
- NOT a prototype — fully functional from day one

### Phase 2: Quality Platform (2026-04-20 → 2026-04-24)
- Backend TypeScript migration (4 coherent batches)
- Husky + commitlint + ESLint + Vitest
- Feature-based architecture (`server/src/features/`)
- Tag: `v2.0.0-backend-ts-migration`

### Phase 3: Frontend Hardening (2026-06-12 → 2026-06-20)
- Frontend TS migration (JSX → TSX, feature-based)
- Email provider migration: nodemailer → Resend → Brevo
- Cloudinary media uploads
- Socket.IO server added (no client yet)
- CI/CD workflows added
- Production hardening (Docker, Render deploy)

### Phase 4: Mobile Strategy (2026-08-30 → 2026-09-07)
- **Mobile app added**: `mobile/` — Expo + React Native + Expo Router
- **Workflow v2 engine** (`48a67f8f`) — state machine with idempotency + audit trail
- Offline queue for técnicos
- Functionario authentication with transactional email
- Mobile native forgot password screen

### Phase 5: Design Consolidation (2026-09-14 → 2026-09-27)
- Design system (tokens, components)
- AI tooling integration (agents, skills)
- Batch documentation generation

### Phase 6: PWA Capabilities (2026-10-08 → 2026-10-10)
- Service Worker (`client/public/sw.js`)
- Manifest (`manifest.json`)
- Install prompt with role-aware nudge
- Auth hardening + Firebase Hosting prod+qa targets
- Brand rename: MiAyudaTics → MiAyudaTIC

## Current Known State

✅ ** Wysiwyg (what you see is what you run)** — All features above are confirmed working in codebase.
✅ ** Single commit misses PWA docs** — Contract includes PWA but docs are missing.
⚠️ ** Brevo IP issue fixed** — Forgot password in prod requires IP allowlist.
⚠️ ** 22-commit gap between master ↔ develop** — QA runs pre-PWA.
⚠️ ** 17-month commit gap (2024-10-30 ↔ 2026-04-20)** — Human testimony required.

## Three Mobile Strategies (coexisting)

1. **Native Expo app** (`mobile/`) — official mobile strategy
2. **PWA** (`client/public/sw.js` + `manifest.json`) — web client with PWA features
3. **Flutter legacy** (`mobile_flutter/` — untracked, wrong URL, abandoned)

These are parallel strategies, not sequential transitions.
