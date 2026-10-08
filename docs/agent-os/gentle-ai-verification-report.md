# Gentle-AI verification report

2026-10-07. Proofs actually run are marked VERIFIED. Everything else stays below that bar.

## Commands

| Proof | Result |
| --- | --- |
| `engram version` | 3.1.0. Update notice 3.2.1. |
| `engram doctor --json` | status error. ok: ambiguous sessions, invalid identity, orphaned observations, orphaned relations, session directory, sqlite lock. warning: manual session name mismatch, unowned session project. blocked: `sync_mutation_required_fields` (35). error: `sync_target_closed_space` (9). |
| `engram projects list` | `miayudatics` and `miayudatics_v1.0` both exist. |
| `engram context --project miayudatics` | Returned sessions dated 2026-07-13 (116 obs) and 2026-07-14 (2 obs). |
| `engram search "capability probe" --project miayudatics` | No hit. The save that would have created it failed. |
| `engram save` from repo and from `$HOME` | `unable to open database file (14)`. |
| MCP `mem_save` project `miayudatics` | Same error 14. |
| Python `sqlite3` on `~/.engram/engram.db` | Read 346 observation rows. Temporary table write committed, then dropped. |
| Context7 `resolve-library-id` Vitest | `/vitest-dev/vitest`. |
| `command -v codegraph` and `context7` | Not on PATH. |
| Judgment Day CLI | Absent. Skill file v1.7 read. Judges not launched. |
| `gentle-ai review start` | Help inspected earlier. Not executed. |

## Scores

Counts are capability rows in the capability matrix, not a percentage of marketing features.

- VERIFIED: Gentle-AI 4.0.0 present, Engram read path, Context7 lookup.
- CONFIGURED-BUT-UNVERIFIED: SDD/ODD skills, review start, Judgment Day skill, skill registry file, work-unit and PR skills, persona flag, GGA binary.
- SUPPORTED-BUT-NOT-AVAILABLE: Engram 3.2.1, most non-Cursor runtimes on this host.
- UNAVAILABLE: Engram writes, CodeGraph.
- UNKNOWN: TDD session mode, permissions overlay, model assignment, evidence-budget delegation, backup restore.

## Highest-value gaps

1. Restore Engram writes. Dry-run `engram doctor repair --check sync_mutation_required_fields` and decide the closed cloud targets before any upgrade.
2. Pick one project key: `miayudatics`. Leave `miayudatics_v1.0` until a reviewed consolidate dry-run.
3. Refresh `.atl/skill-registry.md` so project skills are not visible only as `.cursor/skills`.
4. Run `review start` on one tiny consented candidate, not the dirty branch.
5. Run Judgment Day only when two read-only judges can be launched against a frozen target.

## Not done on purpose

No upgrade, no cloud enroll, no project merge, no review start, no git commit, no GitHub issue, no new skill, no second Agent OS.
