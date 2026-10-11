# Gentle-AI project integration

## Ownership

Gentle-AI owns orchestration, the skill index, Engram, and receipt-driven review. MiAyudaTics owns the product: tickets, roles, RBAC, UX, and contracts. Cursor is the adapter in use today.

Do not add a second task state machine, memory store, or review engine in this repo.

## What is installed

- Gentle-AI 4.0.0, persona `gentleman`, agents recorded: `cursor`, `opencode`.
- Engram 3.1.0. Projects seen: `miayudatics` (118 observations, 2 sessions), `miayudatics_v1.0` (4 observations, 3 sessions), plus unrelated local projects.
- Global skills under `C:\Users\JuanC\.agents\skills`, including `sdd-*`, `judgment-day`, `work-unit-commits`, `skill-registry`, `skill-creator`, `skill-improver`, `branch-pr`, `chained-pr`, `issue-creation`, `rdd-defect-workflow`, `cognitive-doc-design`.
- Project skills currently under `.cursor/skills`: ticket lifecycle, RBAC review, mobile field UX, design system, release readiness, docs handoff. Those are adapter copies until the registry can list them. Canonical product behavior stays in `docs/` and the code.

## Engram identity

Use project `miayudatics`. The `miayudatics_v1.0` name is drift. Doctor will not auto-rescue `manual-save-miayudatics_v1.0`. Do not run `projects merge` or `consolidate` until a dry-run is reviewed.

## Memory mode

Local SQLite at `C:\Users\JuanC\.engram\engram.db`. Cloud sync is not appropriate: doctor reports foreign targets such as `cloud:agendapets` and 35 observations missing required content. Git-synced memory was not configured. Cross-machine continuity needs a repaired local DB first, then an explicit sync choice.

## Write failure

Reads work. `engram save` and MCP `mem_save` fail with sqlite code 14 even though Python can open and write the same file. Doctor's blocked sync checks are the health defect to repair with confirmation (`engram doctor repair --check sync_mutation_required_fields --dry-run`). That repair was not applied.

## Review

`gentle-ai review start` freezes a git scope and requires consent. It does not grant commit or push. Do not start it against the whole dirty branch. There is no `review assess` command in 4.0.0.

## Skills not created

No new domain skill was added. Ticket lifecycle, Líder TIC, and RBAC already have project material. Creating more skills without a registry that can see them would duplicate Cursor-only copies.

## Activation performed

None that mutates Gentle-AI config, cloud enrollment, or the database. Context7 was queried (read-only). Documentation in `docs/agent-os/` records the evidence.
