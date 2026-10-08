# Gentle-AI capability matrix

Labels: FACT (command or file), VERIFIED (behavior executed), CONFIGURED-BUT-UNVERIFIED, SUPPORTED-BUT-NOT-AVAILABLE, UNAVAILABLE, UNKNOWN.

Date: 2026-10-07. Host: Windows. Runtime under test: Cursor. Product repo: `MiAyudaTics_v1.0`.

| Capability | State | Evidence |
| --- | --- | --- |
| Gentle-AI CLI 4.0.0 | VERIFIED installed | `gentle-ai version` → 4.0.0. Binary `C:\Users\JuanC\go\bin\gentle-ai.exe`. |
| Doctor | VERIFIED read | `gentle-ai doctor` completed in the prior pass. |
| Update channel | FACT | `state.json` `last_update_check` 2026-10-07. Upgrade path exists (`gentle-ai upgrade`). Not executed. |
| Engram 3.1.0 read | VERIFIED | `engram version` 3.1.0. `engram search` and `engram context --project miayudatics` returned prior sessions (116 + 2 observations). |
| Engram write | UNAVAILABLE now | `engram save` and MCP `mem_save` both return `unable to open database file (14)`. Direct `sqlite3` write of `~/.engram/engram.db` succeeded. |
| Engram health | FACT | Doctor: 6 ok, 2 warning, 1 blocked, 1 error. Blocked: `sync_mutation_required_fields` (35 rows, example id 26 project `juanc` missing `content`). Error: `sync_target_closed_space` (`cloud:agendapets`, 17 unacked mutations). Warnings: `manual-save-miayudatics_v1.0` vs project `miayudatics`; unowned sessions. Repair requires confirmation. Not run. |
| Engram newer release | SUPPORTED-BUT-NOT-AVAILABLE | CLI prints 3.1.0 → 3.2.1. Path: `go install github.com/Gentleman-Programming/engram/v3/cmd/engram@latest`. Not applied. |
| ODD / SDD | CONFIGURED-BUT-UNVERIFIED | Skills `sdd-*` exist under `~/.agents/skills`. No `gentle-ai odd` command. No `odd/tasks/` artifact created in this pass. |
| Review / RDD | CONFIGURED-BUT-UNVERIFIED | `gentle-ai review status` previously returned schema `gentle-ai.review-authority-status/v1`, clean. `review start` exists (freeze, consent, projection, focus). Not started: the tree is dirty and start needs consent. There is no `review assess` subcommand. |
| Judgment Day | CONFIGURED-BUT-UNVERIFIED | Skill `~/.agents/skills/judgment-day/SKILL.md` v1.7. No CLI. Dual judges were not launched. The skill forbids simulating it with an ordinary prompt. |
| Skill registry | CONFIGURED-BUT-UNVERIFIED | Skill exists. `.atl/skill-registry.md` exists in the repo. This session could not read it (permission denied). `skill-registry refresh` was not run. |
| Skill improver / creator | CONFIGURED-BUT-UNVERIFIED | Files present under `~/.agents/skills`. Not executed against project skills. |
| Work-unit commits | CONFIGURED-BUT-UNVERIFIED | Skill v1.0 present. No sample commit created in this pass. |
| Branch PR, chained PR, issue creation, comment writer, cognitive docs, RDD defect workflow | CONFIGURED-BUT-UNVERIFIED | Skill files present. No GitHub issue or PR was opened. |
| Context7 | VERIFIED in Cursor | MCP `resolve-library-id` for Vitest returned `/vitest-dev/vitest` (5049 snippets, score 90.06). No `context7` binary on PATH. |
| CodeGraph | UNAVAILABLE | `command -v codegraph` empty. Product must not depend on it. |
| GGA | FACT installed | `C:\Users\JuanC\bin\gga.bat`. Doctor previously ok. Update reports installed version unknown, latest 2.10.1. Not enabled for this repo. |
| Persona | FACT | `~/.gentle-ai/state.json` persona `gentleman`. Presentation layer only. |
| Permissions overlay | UNKNOWN | No proof that Cursor applies Gentle-AI deny rules to `.env`. |
| Backups | FACT | `~/.gentle-ai/backups/` exists. No managed write was performed, so recovery was not proven. |
| TDD mode | UNKNOWN | No session TDD flag found in repo markdown/json. Client tests use Vitest via `pnpm`. Existence of tests is not a TDD mode. |
| Model assignment / evidence-budget delegation | UNKNOWN | No native assignment command was executed. Cursor has its own subagents; that is not Gentle-AI delegation proof. |
| Cloud Engram | Do not enable | Closed-space cloud targets are already an error. Local memory is the intended store until sync is repaired. |
