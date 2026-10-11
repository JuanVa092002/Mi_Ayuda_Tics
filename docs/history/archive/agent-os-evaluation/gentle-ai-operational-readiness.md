# Gentle-AI operational readiness

Date: 2026-10-07. Repo: `MiAyudaTics_v1.0`. Engram project: `miayudatics`.

Prior evidence lives in `gentle-ai-capability-matrix.md`, `gentle-ai-runtime-matrix.md`, `gentle-ai-project-integration.md`, and `gentle-ai-verification-report.md`. This file is the operating state.

## A. Environment

- Gentle-AI 4.0.0. Engram 3.1.0. Not upgraded.
- Config: `.engram/config.json` → `project_name: miayudatics`. Directory is gitignored.
- Backup preserved: `C:\Users\JuanC\engram-backups\20261007T124932` (SHA-256 match, integrity `ok` at creation). Live `pragma integrity_check` on 2026-10-07 after this mission: `ok`.
- `miayudatics_v1.0`, `juanc`, `cloud:agendapets`, and `cloud:miayudatics` were not merged or repaired.

## B. Verified capabilities

- Skill registry lists the six domain skills once, scope `project`, path `.cursor/skills/`: ticket-lifecycle, rbac-review, mobile-field-ux, design-system, release-readiness, docs-handoff. Scan order prefers that `.cursor` path. No second active copy. Not moved.
- `gentle-ai review assess` exists. Earlier the same day, with untracked files excluded, it reported risk high, 347 paths, 42730 lines, `review_due: yes (high_risk)`, next transition `gentle-ai review status --next-transition`. `review start` was not run.
- Context7 resolved Vitest in the previous pass. Optional. Not required to build.
- Cursor delegation: one read-only explore worker inspected the radar function and returned tiers, the test file, and `NO_DEFECT` plus the empty-list gap. Parent added the test. Worker id `8e356f81-4a70-43b5-9e13-ce7041eeef29`.

## C. Known limitations

- ODD: no command and no `odd/` tree. SDD skills are legacy and were not used. `ODD_RUNTIME = NOT_AVAILABLE_IN_CURRENT_CURSOR_RUNTIME`.
- Judgment Day: skill file only. This session has no `jd-judge-a` or `jd-judge-b`. Not executed.
- Engram doctor still reports `sync_mutation_required_fields` blocked and `sync_target_closed_space` error. Repair not applied.
- CLI `engram save` and MCP `mem_save` returned `unable to open database file (14)` at the end of this mission, after earlier successful writes. Class: intermittent SQLite open, not a project-merge issue. Not repaired.
- `mem_update` previously failed because the MCP process directory was not this repo (`engram` vs `juanc`). Not retried.
- `mem_session_summary` previously failed once with sqlite 14. Not retried.
- CodeGraph is not installed. Deferred. No replacement.
- GGA installed and left off.
- Model assignment: no Gentle-AI model map in this runtime. `UNKNOWN / RUNTIME_DEPENDENT`.
- `which opencode` is the npm binary. `C:\Users\JuanC\.gentle-ai\bin\opencode.cmd` also exists. PATH was not changed. MiAyudaTics does not invoke OpenCode.

## D. Frozen

CodeGraph, GGA, PATH, Engram upgrade, skill moves, cloud sync, project merge, `review start` on the dirty tree, production, secrets.

## E. Runtime boundaries

Gentle-AI owns Engram, the skill index, and RDD. MiAyudaTics owns ticket rules, RBAC, and UX. Cursor owns the current process, MCP, and subagents. Antigravity is not installed here.

Autonomous: read, local edit, unit test, docs, local Engram writes when the database opens.

Human gate: schema migration, production, secrets, cloud enroll, project merge, Engram upgrade, `review start` on a dirty tree, auth or RBAC behavior changes.

`server/src/shared/middleware/session.ts` `authMiddleware` checks bearer/cookie token, loads the user, and rejects missing or inactive accounts (401). A one-line change there is high blast radius. A CSS change is not. No auth edit was made.

## F. E2E this session

| task_id | type | risk | result |
| --- | --- | --- | --- |
| T0 | read-only delegation | low | Worker returned radar tiers and NO_DEFECT |
| T1 | test of existing radar | low | Empty list and case-insensitive sede asserted. Vitest 23/23 in `solicitud-lifecycle.test.ts` |
| T2 | read-only auth boundary | high blast, no edit | `authMiddleware` located. Not modified |

No UI feature was added. Technician queue files were already dirty. The radar implementation already matched its tests. Inventing a screen change would have mixed with that work.

Skill used for T1: none beyond the existing domain function. ticket-lifecycle was not rewritten. skill-improver stayed audit-only: the skill's trigger already names solicitud, estado, and SolucionCaso.

## G. Evidence

- `pnpm exec vitest run src/tests/solicitud-lifecycle.test.ts` → 23 passed.
- Backup path above.
- Delegation worker `8e356f81-4a70-43b5-9e13-ce7041eeef29`.

## H. Verdict

READY FOR REAL PRODUCT DEVELOPMENT on local implementation, tests, the skill registry, and RDD assess.

Not a full Gentle-AI demo: ODD and Judgment Day are unavailable in this Cursor session, and Engram writes are intermittent until sqlite 14 is understood without a cloud repair.

## Capability table

| Capability | Status | Evidence | Limitation | Action |
| --- | --- | --- | --- | --- |
| Engram identity | VERIFIED | `.engram/config.json` | File is gitignored | Keep `miayudatics` |
| Engram read | VERIFIED | integrity `ok`; earlier search | — | None |
| Engram write | VERIFIED_WITH_LIMITATION | Earlier CLI and MCP saves; this mission's save returned sqlite 14 | Intermittent | Do not repair cloud |
| Session lifecycle | VERIFIED_WITH_LIMITATION | Start, prompt, end earlier | Summary failed once | None |
| Skill registry | VERIFIED | Six skills, one path each | Paths are under `.cursor/skills` | Do not move |
| RDD assess | VERIFIED | Command exists; prior assess high / review_due | `review start` not run | Wait for a clean candidate |
| ODD | UNAVAILABLE | No command, no tree | SDD is not a substitute | None |
| Judgment Day | UNAVAILABLE | No judge agents | Skill file only | Use when judges exist |
| Delegation | VERIFIED_WITH_LIMITATION | One Cursor explore worker | Not a Gentle-AI orchestrator | Use for bounded reads |
| Context7 | VERIFIED | Prior Vitest lookup | Optional | Use for external docs only |
| CodeGraph | DEFERRED | Not installed | — | Do not install |
| Permissions | VERIFIED | Auth file read; no policy edit | Overlay not proven | Keep HITL on auth |
| Model assignment | UNKNOWN | No config found | Runtime-dependent | Do not invent models |
| OpenCode | AVAILABLE | npm binary wins PATH | Second binary present | Do not change PATH |
| GGA | DEFERRED | Installed, off | — | Leave off |

## Pilot metrics (n=3)

Not a statistical claim.

- Task success: 3/3 (two read-only, one test edit).
- Verification success: 1/1 code change (23 tests passed). The two read-only tasks had no suite.
- Human interventions: 0 during execution. Auth was not changed, which is the gate, not a failure.
- Engram persistence this mission: 0/1. Sqlite 14 on the final save.
- Routing: radar test stayed in the existing lifecycle test. Auth was not routed to an editor.
- Skill resolution: domain skills were not required for the test. No wrong skill was applied.

## Architecture

User → Cursor (this runtime) or Antigravity when present → Gentle-AI (Engram, skills, RDD, Context7, delivery skills) → MiAyudaTics product judgment (product, experience, engineering, quality as capability bundles, not four resident agents) → the skill that matches the task → edit → test → Engram when the database accepts the write.
