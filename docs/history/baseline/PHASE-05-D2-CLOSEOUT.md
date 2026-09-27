# D2 closeout — rollback mapping (verified 2026-09-15)

Read-only reconciliation after deploy. **No push. No new deploy. No Atlas. No destructive E2E.**

Verified via Render MCP `list_deploys` (service `srv-d8ma4qgjs32c73ce24tg`, workspace `tea-csp5ulbgbbvc73fpohsg`) and Vercel MCP `get_deployment` / `get_project`.

## Mapping (ID ↔ SHA confirmed)

### Render — web service `MiAyudaTics_v1.0` / `miayudatics-v1-0`

| Rol | Deployment ID | Git SHA | Status at verification |
|---|---|---|---|
| Actual (live) | `dep-dakddg942hec73bq7q60` | `b503755e63effde3fed6557e3368abf67622a979` | **live** |
| Anterior (rollback target) | `dep-dafq4ae7bikc73ei5iqg` | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | deactivated |

`dep-dafq4ae7bikc73ei5iqg` **sí** apunta a `ac5ae74…`. Message: `fix(web): allow local vite origin against production api`.

### Vercel — project `miayudatics` / `prj_6rma7uRCOffCYMVbmicNPr6H68hu`

| Rol | Deployment ID | Git SHA | Status at verification |
|---|---|---|---|
| Actual (production) | `dpl_F85pqQgA8RspYJ7p92VxASERrFFD` | `b503755e63effde3fed6557e3368abf67622a979` | READY, `target: production`, `latestDeployment` of the project |
| Anterior (rollback target) | `dpl_EKC7CaYQzcdyg2v5jkPKNXA4971f` | `ac5ae74206bac09d501bb420a349545e5cd7ea0e` | READY historically; SHA matches previous production |

`dpl_EKC7CaYQzcdyg2v5jkPKNXA4971f` **sí** apunta a `ac5ae74…`. Same commit message as the Render previous deploy.

Do not roll back D2 using historical v2 IDs (`dep-daf4anrm8hqs73dj7d40` / SHA `48a67f8` or `050922c`). Those are a different incident.

## Rollback exacto (do not execute unless incident)

```text
Estado actual:
Render  service miayudatics-v1-0 / srv-d8ma4qgjs32c73ce24tg
        dep-dakddg942hec73bq7q60 / SHA b503755e63effde3fed6557e3368abf67622a979
Vercel  project miayudatics / prj_6rma7uRCOffCYMVbmicNPr6H68hu
        dpl_F85pqQgA8RspYJ7p92VxASERrFFD / SHA b503755e63effde3fed6557e3368abf67622a979

Rollback target:
Render  dep-dafq4ae7bikc73ei5iqg / SHA ac5ae74206bac09d501bb420a349545e5cd7ea0e
Vercel  dpl_EKC7CaYQzcdyg2v5jkPKNXA4971f / SHA ac5ae74206bac09d501bb420a349545e5cd7ea0e
```

Procedure if this D2 must be undone:

1. Stop. No E2E. No force-push. No Atlas. No DELETE.
2. Render dashboard → service `MiAyudaTics_v1.0` (`srv-d8ma4qgjs32c73ce24tg`) → Rollback to **`dep-dafq4ae7bikc73ei5iqg`** and confirm commit SHA **`ac5ae74206bac09d501bb420a349545e5cd7ea0e`**.
3. Vercel → project `miayudatics` → promote/rollback to **`dpl_EKC7CaYQzcdyg2v5jkPKNXA4971f`** and confirm commit SHA **`ac5ae74206bac09d501bb420a349545e5cd7ea0e`**.
4. After rollback, health CORS on `/api/health` and JSON `assetlinks` will be **absent** again (SPA HTML on `/.well-known/assetlinks.json`).
5. Leave `uniq_historial_solicitud_operationId` in Atlas. Dashboard rollback does not drop indexes.
6. Hold further pushes to `master` (auto-deploy would re-apply `b503755`). A durable rollback needs an explicit revert commit, approved separately.

## Remote checks (2026-09-15, after live)

| # | Check | Result |
|---|---|---|
| 1 | Render live SHA | `b503755e63effde3fed6557e3368abf67622a979` on `dep-dakddg942hec73bq7q60` |
| 2 | Vercel live SHA | `b503755e63effde3fed6557e3368abf67622a979` on `dpl_F85pqQgA8RspYJ7p92VxASERrFFD` |
| 3 | `GET /api/health` no Origin | 200, no `Access-Control-Allow-Origin`, `status=ok` |
| 4 | `GET /api/health` Origin `https://miayudatics.vercel.app` | 200, ACAO exact, credentials `true` |
| 5 | `OPTIONS /api/auth/login` | 204, ACAO exact, credentials, methods GET,POST,PUT,PATCH,DELETE,OPTIONS, headers include Idempotency-Key |
| 6 | `GET /.well-known/assetlinks.json` | JSON, `Content-Type: application/json`, filename `assetlinks.json` not `index.html` |
| 7 | Atlas | not changed in D2 |
| 8 | Security gate | **FAIL WITH ACCEPTED RISK** (nodemailer 8.0.11, 2 advisories) |
| 9 | App Links release | **pending** — only debug fingerprint published |

Smoke after live: 17 PASS / 0 FAIL (non-destructive). Destructive E2E was **not** run. Remote migration was **not** run.
