# Documentation Policy — MiAyudaTIC
> Version: 2.0 | Established: 2026-10-10 | Updated: 2026-10-11

## Purpose

Prevent the re-accumulation of redundant, outdated, and misleading documentation.

## 1. Where to document what (9-domain architecture)

| Domain | Type | Location | Authority |
|--------|------|----------|-----------|
| **PRODUCT** | Product vision, ICP, roadmap | docs/product/PRODUCT_OVERVIEW.md | Single source of truth |
| **ARCHITECTURE** | System architecture | docs/architecture/ARCHITECTURE.md | Single source of truth |
| **ARCHITECTURE** | Data model, contracts, invariants | docs/architecture/DATA_MODEL.md | Single source of truth |
| **ARCHITECTURE** | Workflows and state machines | docs/architecture/WORKFLOWS.md | Single source of truth |
| **ARCHITECTURE** | Architectural decisions (ADRs) | docs/architecture/DECISIONS.md | Append-only |
| **ARCHITECTURE** | Operating model | docs/architecture/operating-model.md | Canonical |
| **ENGINEERING** | Quality and testing standards | docs/engineering/QUALITY_AND_TESTING.md | Canonical |
| **ENGINEERING** | Visual and interaction standards | docs/engineering/DESIGN_SYSTEM.md | Canonical |
| **ENGINEERING** | Development process | docs/engineering/DEVELOPMENT_PROCESS.md | Canonical |
| **ENGINEERING** | CI/CD pipelines | docs/engineering/CI_CD.md | Canonical |
| **OPERATIONS** | Deployment procedures | docs/operations/DEPLOYMENT.md | Must note environment scope |
| **OPERATIONS** | Environment management | docs/operations/ENVIRONMENTS.md | Canonical |
| **OPERATIONS** | Rollback procedures | docs/operations/ROLLBACK.md | Canonical |
| **OPERATIONS** | QA deployment | docs/operations/DEPLOYMENT-QA.md | Canonical |
| **OPERATIONS** | Runbooks | docs/runbooks/ | Single source of truth |
| **AGENTS** | Agent roles and context | docs/agents/AGENT_ROLES.md | Canonical |
| **AGENTS** | Handoff template | docs/agents/HANDOFF_TEMPLATE.md | Canonical |
| **SECURITY** | Security controls | docs/security/ | Single source of truth |
| **SECURITY** | Security posture and compliance | docs/security/SECURITY_POSTURE.md | Canonical |
| **EVIDENCE** | Forensic evidence + claims | docs/evidence/ | Append-only, verified |
| **HISTORY** | Historical decisions and context | docs/history/ | Append-only, reference |
| **CURRENT** | Surface context (AI agents) | docs/current/ | Auto-generated via pnpm context:* |

## 2. Updating canonical sources

Before creating a new document, check if the topic already has a canonical source in the 9-domain structure.

When modifying a canonical source:
- Verify claims against the code, not against other documents
- Preserve historical information under clearly labeled sections
- Mark superseded content with `> [SUPERSEDED as of DATE]`
- Do not silently overwrite the previous state
- Maintain cross-domain consistency

## 3. Recording decisions

Every significant architectural or product decision must be recorded in:
`docs/architecture/DECISIONS.md`

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
4. Verify the location aligns with the 9-domain architecture

## 6. Links and references

After moving any file, update:
- docs/README.md index
- AGENTS.md if it referenced the file
- llms.txt if it referenced the file
- Any document that linked to the old path

Verify internal links with: `grep -r "old-path" docs/`

Always use relative paths within docs/ for stability.

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
- Schemas or contracts change → docs/architecture/DATA_MODEL.md
- New workflow states or transitions → docs/architecture/WORKFLOWS.md
- Architecture changes → docs/architecture/ARCHITECTURE.md
- New architectural decision made → docs/architecture/DECISIONS.md
- Known technical debt resolved → history/12-TECHNICAL-DEBT.md
- Quality or testing standards change → docs/engineering/QUALITY_AND_TESTING.md
- Deployment platform changes → docs/operations/* + README.md prod URL
- Known technical debt resolved → history/12-TECHNICAL-DEBT.md
- Security controls change → docs/security/SECURITY_POSTURE.md

## 10. Domain consistency rules

1. **No cross-domain duplication** — maintain single source of truth
2. **Language alignment** — match terminology to domain (product ≠ engineering ≠ operations)
3. **Link semantics** — use domain-relative paths for intra-docs navigation
4. **Fail fast on contradictions** — surface inconsistencies, don't silently reconcile

## 11. New: 9-domain structure rules

```
docs/
├── product/              # Business vision and user needs
├── architecture/         # System design and technical decisions
├── engineering/          # Implementation standards and quality
├── operations/           # Deployment and maintenance procedures
├── agents/               # AI agent context and workflows
├── security/             # Security controls and compliance
├── history/              # Historical context and archive
│   └── archive/          # Session logs (preserved forever)
├── evidence/             # Canonical truth and forensic evidence
├── current/              # Auto-generated surface profiles
├── README.md             # Navigation index (current doc)
└── DOCUMENTATION_POLICY.md (this file)
```

Prefer consolidation over creation.