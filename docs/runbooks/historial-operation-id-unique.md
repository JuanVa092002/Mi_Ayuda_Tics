# Unique index `uniq_historial_solicitud_operationId`

Operational unique sparse index for `HistorialSolicitud.operationId` per ticket. **Not** created by Mongoose `schema.index` / `autoIndex`.

## Why the schema does not declare it

Mongoose `autoIndex` defaults to `true`. A unique index on the schema would be created on every boot, including production. That is forbidden.

The schema keeps `{ solicitud, createdAt }` for listing. The unique operationId index is **only** created by an explicit migrate.

## Commands

Local simulation only (safe default):

```bash
pnpm --dir server migrate:historial-operation-id
```

Runner: existing `ts-node --transpile-only`. The script loads `server/.env.test` and **refuses** any URI that is not local simulation. Do not run it against Atlas or Render.

Future CI/release (unusable unless every approval flag is present):

```bash
pnpm --dir server migrate:historial-operation-id:remote
```

That command does **not** load `.env.test`. It fails closed unless CI injects all of:

| Variable | Required value |
|----------|----------------|
| `MIGRATION_ENV` | `preview` \| `qa` \| `staging` \| `production` |
| `MIGRATION_APPROVED` | `true` |
| `MIGRATION_CONFIRM_REMOTE` | `true` |
| `MIGRATION_CHANGE_ID` | release/change id, min 8 chars |
| `MIGRATION_EXPECTED_DB` | exact database name |
| `DB_URI` | secret injected by CI (never committed) |

There is no `--force`. A missing flag, a loopback URI, the simulation database, or a DB name mismatch stops the job before creating anything. Logs show env + database + change id + index spec. They never print the URI or credentials.

Do **not** run the remote command now.

## Verify after migrate

`listIndexes()` on the historial collection must include:

| Field | Value |
|-------|--------|
| name | `uniq_historial_solicitud_operationId` |
| key | `{ solicitud: 1, operationId: 1 }` |
| unique | `true` |
| sparse | `true` |

The migration is idempotent if that spec already exists. It refuses if another index already occupies the same key or the same name with a different spec.

## Future remote release order

Do not execute this against Atlas or Render until the environment is formally approved.

1. Approve the remote environment (Preview/QA isolated, staging isolated, or production).
2. Confirm backup and change window if it applies.
3. Verify topology: replica / sharded / load-balanced, with transactions available.
4. Run the **explicit** index migration (`migrate:historial-operation-id:remote` with the flags above).
5. Verify index `uniq_historial_solicitud_operationId` `{ solicitud: 1, operationId: 1 }` unique + sparse.
6. Verify `assertWorkflowV2RuntimeReady` (transactions + this index).
7. Deploy the workflow v2 API.
8. Deploy compatible web and mobile clients (mandatory `Idempotency-Key`, auto-retry 0).
9. Run E2E in that isolated environment.
10. Monitor errors, idempotency 409, readiness 503, and workflow events.

Until those steps happen, production must fail closed: no silent autoIndex, no workflow v2 start without the index, no standalone fallback.

## Does not touch

- Existing `Solicitud` documents
- `workflowVersion`
- Legacy `estado` strings
- Workflow events
