# MIAYUDATIC — EVIDENCE MATRIX

**Captured:** 2026-09-22  
**Companion:** `MIAYUDATIC-PRODUCT-ENGINEERING-FORENSICS.md`  
**Levels:** E0 not supported · E1 inferred · E2 repository · E3 git · E4 measured  
**Ownership:** Repository-supported · Git-supported · Testimony-required  

| Claim | Evidence | Path | Commit | Evidence Level | Ownership Status | Publicly Safe? | Notes |
|-------|----------|------|--------|----------------|------------------|----------------|-------|
| App existed from git root as multi-role helpdesk | Root adds auth, solicitud, solucionCaso, client JSX | `server/`, `client/` at `a00655c` | `a00655c` | E3 | Git-supported | Yes | Not proof of interviews |
| Single Git author identity across history | `git shortlog`; all emails match | — | all | E3 | Git-supported | Yes if phrased as Git identity | Not HR “sole founder” |
| ~17 month gap 2024→2026 | No commits between `5d893ef` and `7916176` | — | — | E3 | — | Yes as timeline fact | Gap content = testimony |
| Husky + commitlint introduced | chore commit | `.husky`, `commitlint.config.js` | `7916176` | E3 | Git-supported | Yes | |
| Feature scaffolding before TS migrate | structure commit | `server/src/features` scaffolding | `96d389e` | E3 | Git-supported | Yes | |
| Zod deferred during controller TS | decision commit + DECISIONS_HISTORY | `archive/openspec/archive/DECISIONS_HISTORY.md` | `f965134` | E2+E3 | Repository-supported | Yes | Strong judgment signal |
| Backend TS migration completed & tagged | tag `v2.0.0-backend-ts-migration` | — | `f2d8b7f` | E3 | Git-supported | Yes | |
| Zod validators migrated | feat(zod) series | `server` validators | `d63fd9c` et al. | E3 | Git-supported | Yes | |
| Major React 19/RR7/TW4 rejected | decision log | `DECISIONS_HISTORY.md` | 2026-04-20 notes | E2 | Repository-supported | Yes | |
| Email Gmail→Resend→Brevo | commit subjects | `handleEmail.ts` | `2663839`, `e3c0a42` | E3 | Git-supported | Yes | |
| Premium UI funcionario/técnico/admin | UI commits + CHANGELOG | `client/src/pages/*` | `e27cbc1`, `de65255` | E3 | Git-supported | Yes | Aesthetic claim soft |
| Deploy smoke tooling | scripts | `scripts/smoke-prod.sh` | `92ad9b7` | E3 | Git-supported | Yes | |
| Institutional deploy harden | feat(deploy) | Dockerfile, docs | `48e5430` | E3 | Git-supported | Yes | Not HA |
| Dual auth Bearer+cookie+socket | extractAuthToken priority | `server/src/shared/utils/extractAuthToken.ts` | `7ff15ba` | E2+E3 | Repository-supported | Yes | |
| `@miayuda/contracts` introduced | packages/contracts | `packages/contracts` | `7ff15ba` | E3 | Git-supported | Yes | Adoption partial |
| Expo app first tracked | mobile package.json add | `mobile/MiAyudaTIC-Mobile` | `9378020` | E3 | Git-supported | Yes | |
| Funcionario mobile persist + media auth | large mobile commit | mobile + server media | `050922c` | E3 | Git-supported | Yes | |
| Líder blocked on mobile policy | session-policy | `mobile/.../session-policy.ts` | in Expo era | E2 | Repository-supported | Yes | Phase-4 doc contradicted |
| Flutter is legacy untracked | nested `.git`, 0 ls-files | `mobile_flutter/MBO_ULT` | — | E2 | Repository-supported | Yes as legacy | Not “full migration” |
| Forgot-password P0 Brevo IP | incident + fix | `docs/incidents/2026-06-14-forgot-password-prod.md` | `a76951f` | E2+E3 | Git-supported fix | Yes | Console allowlist = ops |
| sendMail after 201 open debt | incident + controller order | `docs/incidents/2026-08-27-...`; `solicitud.ts` ~291–305 | documented in `050922c` era | E2 | Repository-supported | Yes as open | Do not claim fixed |
| codigoCaso migrate-only unique | handoff + runbook | `docs/handoffs/2026-08-23-...`; runbooks | scripts in tree | E2 | Repository-supported | Yes | Prod migrate HITL |
| Workflow v2 domain engine | applySolicitudWorkflowAction | `server/.../solicitud-workflow.ts` | `48a67f8` | E2+E3 | Repository-supported | Yes | |
| Workflow v2 cross-layer land | server+client+mobile in one commit | multiple | `48a67f8` | E3 | Git-supported | Yes | Strong PE signal |
| Client Idempotency-Key required | requireClientOperationId | workflow-idempotency.ts (server+clients) | `48a67f8` | E2+E3 | Repository-supported | Yes | |
| Optimistic workflowRevision | conditional update $inc | `solicitud-workflow.ts` | `48a67f8` | E2 | Repository-supported | Yes | |
| Prod transactions required | mongoRequiresTransactions | `workflow-atomicity.ts` | `48a67f8` | E2 | Repository-supported | Yes | Atlas live TX = ops verify |
| Historial append-only app policy | HistorialSolicitud.create only | historial model + workflow | `48a67f8` | E2 | Repository-supported | Yes | Not DB trigger |
| Leader web inbox + técnico offline | client leader-inbox; mobile offline-* | client + mobile | `0e4e8a4` | E3 | Git-supported | Yes | |
| CORS Idempotency-Key preflight | fix commit | client/server CORS | `8822595` | E3 | Git-supported | Yes | |
| Rollback procedure documented | docs | `docs/rollback-procedure.md` | with v2 release docs | E2 | Repository-supported | Yes | |
| Health CORS live fixed | D2 + curl | `server/.../app.ts`, cors helper | `b503755` on master | E4 | Measured | Yes | |
| assetlinks.json served as JSON | live GET | `client/public/.well-known/assetlinks.json` | D2 | E4 | Measured | Yes | Debug fingerprint only |
| E2E v2 journey not implemented | workflow-v2.spec throws | `e2e/workflow-v2.spec.ts` | `037a424` | E2 | Repository-supported | Yes as limitation | Do not claim PASS |
| Playwright 4 pass / 19 skip | baseline recapture | `docs/baseline/MIAYUDATIC-BASELINE.md` | 2026-09-15 | E4 | Measured | Yes | |
| Server unit 151 / integration 12 | baseline | same | 2026-09-15 | E4 | Measured on dirty chore | Careful: not pure prod SHA |
| Nodemailer accepted risk | triage doc | `docs/security/dependency-triage.md` | `5c64639` related | E2+E4 audit | Repository-supported | Yes as accepted risk | Not security PASS |
| CI typecheck/build/unit only | ci.yml | `.github/workflows/ci.yml` | `9348b24` pin | E2 | Repository-supported | Yes | Gaps are facts |
| Post-deploy smoke manual only | workflow_dispatch | `post-deploy-smoke.yml` | — | E2 | Repository-supported | Yes | |
| Socket.IO client absent on web/mobile | grep/architecture | client/mobile | — | E2 | Repository-supported | Yes | Don’t claim realtime UX |
| Web notifications poll 30s | useNotificaciones | `client/.../useNotificaciones.ts` | — | E2 | Repository-supported | Yes | |
| List endpoints without .limit | Solicitud.find | `solicitud.ts` controllers | — | E2 | Repository-supported | No as “scalable lists” | Risk claim |
| Human led TIC interviews | — | — | — | E0 | Testimony-required | No | |
| 5k users / HA / 99.9% | — | — | — | E0 | — | No | |
| Complete Flutter→RN migration | Flutter untracked | `mobile_flutter` | — | E0 as complete | — | No | Successor Expo yes |
| Production-grade observability | no APM/metrics | — | — | E0 | — | No | |
| Live media IDOR proven | unit mocks only | `media-access.test.ts` | — | E2 unit / E0 live | — | Soften | |
| App Links release-ready | debug SHA only | assetlinks / validate | — | E2 pending release | — | No | |
| PE II / Founder-CTO titles | handoff role labels | `docs/handoffs/2026-08-23-...` | — | E2 framing | Testimony for HR | Soften | Doc role ≠ employer title |
| Built entirely alone | single git email | — | — | E1 at most | Testimony-required | Risky | Prefer “Git history under one identity” |

---

## Quick use guide

- **Public CV:** prefer rows with Publicly Safe = Yes and Evidence Level ≥ E2.  
- **Interview:** bring E3 cross-layer rows (`48a67f8`) and incident rows (I1 open/closed contrast).  
- **Never:** E0 rows as achievements.
