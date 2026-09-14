# E2E inventory

Default `pnpm test:e2e` is **read-only production smoke**. It must not create tickets.

| Spec | Class | Safe by default | Notes |
|------|-------|-----------------|-------|
| `cors.spec.ts` health browser fetch | prod smoke | yes | Skipped unless `E2E_EXPECT_HEALTH_CORS=true` because live `/api/health` is still mounted before CORS until a Render deploy. |
| `cors.spec.ts` login/SPA/preflight | prod smoke | yes | Hits public frontend/API; no credentials. |
| `login.spec.ts` | prod smoke, requires credentials | skipped without env | Uses `E2E_LIDER_EMAIL` / `E2E_LIDER_PASSWORD`. |
| `solicitud.spec.ts` | prod smoke, requires credentials | skipped without env | Login-only; does not create a ticket. Env aliases: `E2E_FUNCA_EMAIL` or `E2E_FUNCIONARIO_EMAIL`. |
| `workflow-v2.spec.ts` | v2 workflow, destructive | skipped | Requires `RUN_DESTRUCTIVE_E2E=true`, `E2E_ENV=simulation\|qa\|staging`, explicit non-prod `E2E_BACKEND_URL`, and three-role env credentials. **Not implemented yet.** |
| `scripts/e2e-ticket-lifecycle.sh` | v1 legacy, destructive | no | Assigns and closes via `solucionCaso`. Do not run against production. |

Credentials are never read from git. Copy names from `.env.e2e.example` into a gitignored `e2e/.env.e2e`.
