# Documentation Policy — MiAyudaTIC
> Version: 1.0 | Established: 2026-10-10

## Purpose

Prevent the re-accumulation of redundant, outdated, and misleading documentation.

## 1. Where to document what

| Type | Location | Authority |
|------|----------|-----------|
| Business invariants, RBAC, contracts | docs/contracts.md | Single source of truth |
| System architecture | docs/ARCHITECTURE.md | Single source of truth |
| Product vision and ICP | docs/product.md | Single source of truth |
| Workflow and state machines | docs/workflow-v2.md | Single source of truth |
| Architectural decisions (ADRs) | docs/system-overview/15-ARCHITECTURAL-DECISIONS.md | Append-only |
| Operational runbooks | docs/rollback-procedure.md, docs/runbooks/ | Single source of truth |
| Deploy procedures | docs/deploy-* | Must note environment scope |
| Security controls | docs/security/ | Single source of truth |
| Surface context (for AI agents) | docs/current/ | Auto-generated via pnpm context:* |
| Technical debt | docs/system-overview/12-TECHNICAL-DEBT.md | Maintained with code |
| Forensic evidence + claims | docs/canonical/ | Append-only, verified |
| Historical decisions | docs/history/ | Append-only |

## 2. Updating canonical sources

Before creating a new document, check if the topic already has a canonical source.

When modifying a canonical source:
- Verify claims against the code, not against other documents
- Preserve historical information under clearly labeled sections
- Mark superseded content with `> [SUPERSEDED as of DATE]`
- Do not silently overwrite the previous state

## 3. Recording decisions

Every significant architectural or product decision must be recorded in:
`docs/system-overview/15-ARCHITECTURAL-DECISIONS.md`

Format:
```
### ADR-XX: [Decision title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by ADR-XX
**Context:** [Why this decision was needed]
**Decision:** [What was decided]
**Consequences:** [What changes, what becomes harder/easier]
**Evidence:** [Commit SHA or code reference]
```

## 4. Historical information

When a document becomes historical (superseded, completed, or outdated):
- Move to `docs/history/archive/` with `git mv` to preserve history
- Never delete — retire to archive
- Add a note at the top of the remaining canonical document explaining what changed

Do not mark a solution as superseded without evidence of what replaced it.

## 5. Avoiding redundant documents

Before creating a new document:
1. Check docs/README.md for an existing owner
2. If a canonical source exists, extend it — don't create a parallel
3. Working session notes belong in docs/history/archive/ after the workstream closes

## 6. Links and references

After moving any file, update:
- docs/README.md index
- AGENTS.md if it referenced the file
- llms.txt if it referenced the file
- Any document that linked to the old path

Verify internal links with: `grep -r "old-path" docs/`

## 7. Fact, inference, and declaration

Mark each claim's epistemic status clearly:
- ✅ CONFIRMED — verifiable from code, tests, or git
- ⚠️ INFERRED — reasonable conclusion from evidence (explain reasoning)
- 📋 DECLARED — from team testimony (not git-verifiable)
- ❓ UNKNOWN — cannot be determined from available sources

Never present an inference as a confirmed fact.

## 8. When to retire a document

Retire (move to archive) when:
- Its content has been fully incorporated into a canonical source
- The procedure it describes has been replaced
- The working session it documented is closed
- The tool or environment it describes no longer applies

Retire means `git mv to archive/`, not delete.

## 9. Review triggers

Update relevant docs when:
- Schemas or contracts change → docs/contracts.md
- New workflow states or transitions → docs/workflow-v2.md
- Authentication changes → docs/system-overview/10-SECURITY-MODEL.md
- Deployment platform changes → deploy docs + README.md prod URL
- New architectural decision made → docs/system-overview/15-ARCHITECTURAL-DECISIONS.md
- Known technical debt resolved → docs/system-overview/12-TECHNICAL-DEBT.md