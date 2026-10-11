# Documentation Consolidation Record — MiAyudaTIC
> Date: 2026-10-10  
> HEAD SHA at start: 29c39075ed1b7b85353f8c78ca938dbc37cd1b34
## Summary

This consolidation reduced the documentation surface from ~355 markdown files to ~75 active files, moving historical content to `docs/history/archive/` while preserving file history via `git mv`.

## Objectives Achieved

1. **Extracted unique content** before archiving historic session documents
2. **Archived** ~280 files that were session notes, working logs, and evaluation artifacts
3. **Flagged contradictions** in deployment documentation (Firebase vs Vercel prod URL)
4. **Added docs/canonical/** to the reference chain
5. **Created** docs/README.md as the navigation index by reader task
6. **Established** docs/DOCUMENTATION_POLICY.md to prevent re-accumulation

## Migration Table

| Original Path | Action | Destination | Unique Content Preserved |
|---------------|--------|-------------|---------------------------|
| `docs/agent-run/ux-ui-decisions.md` | Archived | `docs/history/archive/ux-web-reconstruction/ux-ui-decisions.md` | UX decisions extracted → docs/system-overview/15-ARCHITECTURAL-DECISIONS.md |
| `docs/agent-run/decision-log.md` | Archived | `docs/history/archive/ux-web-reconstruction/decision-log.md` | Structural decisions extracted → docs/system-overview/15-ARCHITECTURAL-DECISIONS.md |
| `docs/agent-os/reality-check.md` | Archived | `docs/history/archive/agent-os-evaluation/reality-check.md` | Tooling constraint → docs/system-overview/19-AGENT-ONBOARDING.md |
| `docs/agent-os/*.md` (all except gentle-ai-ide-agnostic-architecture.md) | Archived | `docs/history/archive/agent-os-evaluation/` | N/A — benchmark and assessment artifacts |
| `docs/agent-run/*.md`, `*.json` | Archived | `docs/history/archive/ux-web-reconstruction/` | UX decisions preserved above |
| `docs/missions/*` | Archived | `docs/history/archive/missions/` | N/A — session records |
| `VERIFICATION_REPORT.md` | Renamed | `docs/history/audits/verification-report-2026-09.md` | N/A |
| `PROJECT_SIGNAL_REPORT.md` | Renamed | `docs/history/case-study/project-signal-report-2026-06.md` | N/A |

## Files Created

| File | Purpose |
|------|---------|
| `docs/README.md` | Navigation index organized by reader task |
| `docs/DOCUMENTATION_POLICY.md` | Governance policy to prevent document sprawl |
| `docs/CONSOLIDATION_RECORD.md` | This migration record |

## Files Modified

| File | Change |
|------|--------|
| `docs/system-overview/15-ARCHITECTURAL-DECISIONS.md` | Appended UX/Web and Structural decisions under dated sections |
| `docs/system-overview/19-AGENT-ONBOARDING.md` | Added tooling constraint section about CodeGraph/Context7 |
| `docs/deploy-firebase-hosting.md` | Added warning about production URL contradiction |
| `docs/deploy-100-cloud-environments.md` | Added warning about production URL contradiction |
| `AGENTS.md` | Added reference to docs/canonical/ in "Start here" table |
| `llms.txt` | Added reference to docs/canonical/ in "Canonical context" |

## Open Items Requiring Human Review

1. **Production URL contradiction**: `README.md` and `AGENTS.md` list `miayudatics.vercel.app` as prod, but Firebase deploy guides target `miayudatics.web.app`. Determine which is canonical and consolidate.
2. **docs/agent-os/gentle-ai-ide-agnostic-architecture.md**: Kept in place due to reference from AGENTS.md header. The parent contract link in AGENTS.md must be updated if this moves in the future.
3. **cdn_pixel.md import sidecar**: Still lives in repo root. Is this needed? If yes, document its purpose.

## Verification Checklist

- [x] `ls docs/agent-os/` shows only `gentle-ai-ide-agnostic-architecture.md` 
- [x] `ls docs/missions/` shows no subdirectories
- [x] `docs/history/archive/` contains the three expected subdirs
- [x] `find docs/ -name "*.md" | wc -l` shows significant reduction
- [x] Warnings added to deploy docs  
- [x] docs/canonical/ linked from AGENTS.md and llms.txt
- [x] Git operations performed with `git mv` to preserve history

## Key Learnings:

1. **Preserved history**: Used `git mv` for all archive moves to maintain commit history rather than `cp` + `rm`, which would break provenance.
2. **Dated extractions**: Structured the extracted ADRs with clear source attribution and date in their section headers, preventing future confusion about origin.
3. **Contradiction surfacing**: Added prominent warnings about the prod URL issue rather than silently choosing one side; forces explicit resolution.
4. **Navigation-first**: Created docs/README.md to organize knowledge by **reader task** rather than filename, improving discoverability for new contributors and agents.
5. **Governance installed**: The DOCUMENTATION_POLICY.md creates guardrails that, if followed, will prevent the sprawl from happening again.