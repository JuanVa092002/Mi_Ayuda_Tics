# E2E inventory

Default `pnpm test:e2e` is **read-only production smoke**. It must not create tickets.

Credentials live only in gitignored `e2e/.env.e2e`. Names are listed in `.env.e2e.example`. Values are never committed.

| Spec | Class | Safe by default | Notes |
|------|-------|-----------------|-------|
| `cors.spec.ts` health browser fetch | prod smoke | yes | Skipped unless `E2E_EXPECT_HEALTH_CORS=true` because live `/api/health` is still mounted before CORS until a Render deploy. |
| `cors.spec.ts` login/SPA/preflight | prod smoke | yes | Hits public frontend/API; no credentials. |
| `login.spec.ts` | prod smoke, requires credentials | skipped without env | Uses `E2E_LIDER_EMAIL` / `E2E_LIDER_PASSWORD`. |
| `solicitud.spec.ts` | prod smoke, requires credentials | skipped without env | Login-only; does not create a ticket. Env aliases: `E2E_FUNCA_EMAIL` or `E2E_FUNCIONARIO_EMAIL`. |
| `workflow-v2.spec.ts` | v2 workflow, destructive | skipped | Harness only. Journey **not implemented**. Requires `RUN_DESTRUCTIVE_E2E=true`, explicit `E2E_ENV=simulation\|qa\|staging`, non-prod backend and frontend URLs, and three-role env credentials. Production Render/Vercel hosts are refused. |
| `scripts/e2e-ticket-lifecycle.sh` | v1 legacy, destructive | no | Assigns and closes via `solucionCaso`. Do not run against production. |

## Workflow v2 harness (not an executable E2E)

Do **not** claim E2E v2 exists until every journey step is implemented **and** executed against simulation/qa/staging.

Policy already wired in helpers:

- Credentials from env only (`E2E_LIDER_*`, `E2E_FUNCA_*`, `E2E_TECNICO_*`).
- `E2E_ENV` must be explicit for destructive runs.
- `RUN_DESTRUCTIVE_E2E` defaults to false.
- Tickets, when created later, must carry `[E2E-YYYYMMDD-<8 hex>]`.
- Cleanup is `POST /:id/confirmarSolucion` or `POST /:id/cancelar`. **No DELETE.**
- Failure screenshots mask password fields. Reports store ticket IDs and states only.

Do not create accounts from this tree. Do not run the destructive journey until a later explicit approval.
