# Phase 0.5 deploy gates (D1 prepared, D2 not executed)

**Status:** checklist only. **Do not push. Do not deploy.** D2 requires a separate human approval.

Branch: `chore/measured-production-system`  
Compared to: `origin/master` `ac5ae74206bac09d501bb420a349545e5cd7ea0e`

Recommended deploy unit: the **whole branch HEAD**, not a cherry-pick. Render and Vercel both consume this repo. Splitting health/CORS from the lockfile would leave production on mixed SHAs.

WIP that must **not** be included: `.atl/`, `.agents/`, `marketing/`, `video/`, `skills-lock.json`, leader media thumbs, historial-intent mobile, `server/storage/file-1788*`.

## 1. Deploy diff (files vs origin/master)

### Render (API)

Required for health/CORS + smoke 204:

| Path | Commit | Why |
|---|---|---|
| `server/src/core/app.ts` | `56286a8` | non-throwing CORS on `/api/health` |
| `server/src/shared/config/cors.ts` | `56286a8` | `originIsAllowed` / `corsHeaderMap` |
| `server/src/tests/health-cors.test.ts` | `56286a8` | unit proof of 200/204 behavior |
| `scripts/smoke-prod.sh` | `56286a8` | OPTIONS login accepts 204 or 200 |

Also on the same branch (server runtime, not CORS):

| Path | Commit | Why |
|---|---|---|
| `server/package.json` | `5c64639` | multer 2.4.0 |
| `pnpm-lock.yaml` | `5c64639` | lockfile for patched highs |
| `pnpm-workspace.yaml` | `5c64639` | pnpm overrides that `package.json` cannot apply |

### Vercel (web)

| Path | Commit | Why |
|---|---|---|
| `client/public/.well-known/assetlinks.json` | `63b1fbd` | Digital Asset Links JSON (debug fingerprint) |
| `client/public/.well-known/android-fingerprints.manifest.json` | `63b1fbd` | source of truth; debug labeled; Play/EAS pending |
| `client/vercel.json` | `63b1fbd` | `Content-Type: application/json`; SPA rewrite excludes `/.well-known/` |
| `client/package.json` | `5c64639` | axios patch (web runtime, not App Links) |

### Not required to make D2 green, but on the branch

Docs, baseline, security triage, Playwright harness, `validate.mjs`. No schema, no migrations, no GitHub workflow changes.

## 2. Checklist Render — verify before push

Do not execute these commands as a deploy. Use them as the D2 preflight.

```text
[ ] Branch is chore/measured-production-system (or the SHA explicitly approved).
[ ] git status shows no staged WIP: no .env, no server/storage JPEGs, no marketing/, no video/.
[ ] git diff origin/master -- server/ client/ scripts/ pnpm-lock.yaml pnpm-workspace.yaml
    contains health/CORS + smoke 204 + lockfile; no schema; no migrations.
[ ] No secrets in tracked files (grep for mongodb+srv, xkeysib, JWT values, passwords).
[ ] No .env committed.
[ ] No foreign JPEGs in the commit set.
[ ] No GitHub workflow edits unrelated to this phase.
[ ] Nodemailer remains 8.0.11. No override hiding advisories. Threshold unchanged.
[ ] SMTP is not the primary email path. BREVO_API_KEY stays the production send path.
[ ] Human approval for D2 recorded in chat before any git push.
```

## 3. Checklist Vercel — verify before deploy

```text
[ ] client/public/.well-known/assetlinks.json is valid JSON (array of statements).
[ ] package_name is com.miayudatics.mobile.
[ ] The only SHA-256 is the debug keystore fingerprint from jun 2026.
[ ] Fingerprint is labeled debug in android-fingerprints.manifest.json.
[ ] Play / EAS / release rows remain status: pending. Do not claim production App Links.
[ ] No placeholders (REPLACE, YOUR_, TODO) in assetlinks.json.
[ ] No secrets in assetlinks.json or vercel.json.
[ ] vercel.json sets Content-Type application/json for /.well-known/assetlinks.json.
[ ] vercel.json SPA rewrite excludes /.well-known/.
```

Local confirmation (already true on this branch; re-check if files change):

- `assetlinks.json`: package `com.miayudatics.mobile`, relation `delegate_permission/common.handle_all_urls`, one debug SHA-256.
- Debug SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

## 4. Gate D2 — execute only after separate human approval

Stop after any failed step. No E2E. No extra commits.

1. Record currently reachable SHAs if verifiable (Render revision / Vercel deployment). If unknown, write `unverified`.
2. Review `git diff origin/master` one last time. Confirm WIP still unstaged.
3. Push **only** the approved branch. Do not force-push. Do not skip hooks.
4. Deploy Render (auto-deploy on `master` if that is the approved target; otherwise the approved branch).
5. Verify health:
   ```text
   GET https://miayudatics-v1-0.onrender.com/api/health
   ```
   - no Origin → 200, no `Access-Control-Allow-Origin`
   - Origin `https://miayudatics.vercel.app` → 200, ACAO exact, credentials `true`
6. Verify:
   ```text
   OPTIONS https://miayudatics-v1-0.onrender.com/api/auth/login
   ```
   with Origin Vercel, `Access-Control-Request-Method: POST`,  
   `Access-Control-Request-Headers: Content-Type,Idempotency-Key`.
   Expect:
   - status 204 or 200
   - `Access-Control-Allow-Origin: https://miayudatics.vercel.app` exact
   - `Access-Control-Allow-Credentials: true`
   - methods include GET,POST,PUT,PATCH,DELETE,OPTIONS
   - headers include Content-Type, Authorization, Idempotency-Key
7. Deploy Vercel.
8. Verify:
   ```text
   GET https://miayudatics.vercel.app/.well-known/assetlinks.json
   ```
   JSON (not `index.html`), `Content-Type` JSON, package name correct, debug fingerprint only.
9. Record live Render and Vercel SHAs/commits. Compare to the pushed SHA.
10. If any check fails: stop, no E2E, no extra code, follow rollback below.

## 5. Rollback (this deploy only)

Do **not** roll back to the historical v2 SHA table unless the incident is the v2 feature itself.

If this Phase 0.5 deploy fails:

1. Stop. Do not run E2E. Do not push more commits.
2. Render dashboard: rollback the web service `miayudatics-v1-0` to the **previous successful deploy** (SHA recorded in step 1). Prefer dashboard rollback over `git push --force`.
3. Vercel: promote/rollback to the previous production deployment that still served the SPA.
4. Re-check `GET /api/health` 200 and frontend load. Do not require the new health CORS or assetlinks JSON after rollback — they will be absent again.
5. Leave Atlas indexes and data untouched. No DELETE of tickets.
6. If Render auto-deploys `master`, a dashboard-only rollback is lost on the next push. Hold further pushes until a revert commit is approved.

Known previous git points (not verified as currently live):

| Point | SHA | Note |
|---|---|---|
| origin/master at Phase 0.5 close | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | last pushed; Vite CORS to production API |
| Historical v2 feature (unverified live) | `48a67f8f2686e186e79c6e867142eb99630ed35c` | do not use unless D2 recorded it as live |
| Pre-v2 rollback (older procedure) | `050922c2e39453db034d237a365ba97c898f1938` | unrelated to this CORS/assetlinks deploy |

## 6. Variables / secrets required (names only)

No values. Do not create or rotate secrets for D2.

### Render (must already exist; D2 does not add keys)

`NODE_ENV`, `PORT`, `DB_URI`, `PUBLIC_URL`, `RENDER_URL`, `CLIENT_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_USER`, `BREVO_PASSWORD`, `EMAIL_FROM`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`, `MEDIA_MAX_BYTES`

Optional: `SOCKET_CORS_ORIGINS`, `REDIS_URL`, `REQUIRE_SOLICITUD_FOTO`, `STORAGE_PATH`, `LEGACY_RENDER_FRONTEND_URL`, `BREVO_PREFER_SMTP`

Operational: keep `BREVO_PREFER_SMTP` unset/false. If Brevo REST fails and SMTP fallback activates, record it as operational risk (Nodemailer advisories apply on that path).

### Vercel

`VITE_BACKEND_URL`

### E2E (local gitignored file only; not required for D2)

`E2E_FRONTEND_URL`, `E2E_BACKEND_URL`, `E2E_LIDER_EMAIL`, `E2E_LIDER_PASSWORD`, `E2E_FUNCA_EMAIL`, `E2E_FUNCA_PASSWORD`, `E2E_TECNICO_EMAIL`, `E2E_TECNICO_PASSWORD`, `E2E_ENV`, `RUN_DESTRUCTIVE_E2E`, `E2E_EXPECT_HEALTH_CORS`

## 7. E2E pending

Harness exists. Journey is **not implemented**. Do not run destructive E2E. Do not create accounts. `RUN_DESTRUCTIVE_E2E=false`. Production hosts refused.

## 8. Residual risks

- Security gate remains **FAIL WITH ACCEPTED RISK** (Nodemailer 8.0.11, 2 advisories). Not PASS.
- Production health CORS and assetlinks are pending D2.
- Debug Android fingerprint only; Play/EAS linking not claimed.
- SMTP fallback is an operational risk if Brevo REST fails.
- Mobile Expo 33 highs unchanged.
- Live SHA unverified until D2.
