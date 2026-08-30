# Unique index `uniq_solicitud_codigoCaso`

Operational unique index for `Solicitud.codigoCaso`. **Not** created by Mongoose `schema.unique` or `autoIndex`.

## Why the schema does not set `unique: true`

Mongoose `autoIndex` defaults to `true` (see `mongoose.set('autoIndex')`; this app does not override it in `dbConnect`).

Adding `unique: true` on `codigoCaso` would auto-create `codigoCaso_1` on process boot in **every** environment, including production. That is forbidden.

`Solicitud` currently declares **no** secondary schema indexes (`schema.index` / unique fields). MongoDB still has `_id_`. Do **not** set schema `autoIndex: false` here: that would also skip any future declared indexes on this model.

## Schema index audit (current)

Inspected `server/src/features/tickets/models/solicitud.ts`:

| Kind | Result |
|---|---|
| `schema.index(...)` | none |
| Field-level `unique: true` | none (`codigoCaso` is `required` only) |
| Compound indexes | none |
| `autoIndex: false` on this schema | **not set** (must stay unset) |
| Mongoose global `autoIndex` | default `true`; `dbConnect` does not disable it |
| Mongo `_id_` | always present |

Simulation/staging live `listIndexes()` was **not** executed from this machine: `server/.env` does not look like simulation/staging/localhost, so migrate was not run here.

When you run the audit script against simulation/staging, capture `indexes[]` (`name`, `key`, `unique`). Today the schema itself cannot auto-create anything except `_id_` plus whatever already exists in that database.

`codigoCaso` uniqueness is **only** `uniq_solicitud_codigoCaso`, created by `migrate:codigo-caso-unique`. The schema comment documents intent; it must not use `unique: true` because boot would then create `codigoCaso_1` in production via autoIndex.

Integration tests fingerprint existing indexes and assert the migrate adds only that unique index (or no-ops) without dropping/replacing others.

## Commands

```bash
pnpm --dir server audit:codigo-caso
pnpm --dir server migrate:codigo-caso-unique
```

Runner: existing `ts-node --transpile-only` (no new dependency).

Collection name comes from `solicitudModel.collection.collectionName`.

## Environments

| Action | simulation / staging / localhost | production |
|---|---|---|
| Audit (read-only) | yes | yes |
| Migrate | yes | only with `ALLOW_PROD_SOLICITUD_INDEX=I_UNDERSTAND` after human approval |

If audit reports duplicates or missing/empty `codigoCaso`: **STOP**. Do not create the index. Normalization is a separate HITL incident.

## Verify after migrate

`listIndexes()` must include:

- name: `uniq_solicitud_codigoCaso`
- key: `{ codigoCaso: 1 }`
- unique: `true`

The migration is idempotent if that index already exists. It refuses if another index already occupies `codigoCaso`.

## Production SuccessCard

Do not ship Funcionario SuccessCard UX that treats `codigoCaso` as a reliable unique identifier until:

1. production read-only audit is 0 duplicates and 0 empty
2. explicit human approval
3. production migrate
4. `listIndexes()` verification
5. smoke create after migrate

## Rollback (manual HITL only)

```js
db.getCollection(<solicitud collection name>).dropIndex('uniq_solicitud_codigoCaso')
```

After drop, SuccessCard-as-unique-id must stay out of production.
