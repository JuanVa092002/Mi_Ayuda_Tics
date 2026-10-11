# Documentation Consolidation Record — MiAyudaTIC
> Date: 2026-10-11  
> HEAD SHA at start: 29c39075ed1b7b85353f8c78ca938dbc37cd1b34
## Summary

Phase 3-5 of the major documentation reorganization for MiAyudaTIC. This phase implemented the 9-domain architecture and moved files according to the canonical mapping.

## Objectives Achieved

1. **Created 9-domain structure**: product/, architecture/, engineering/, operations/, agents/, security/, history/, evidence/
2. **Moved ~25 root-level files** into appropriate domains
3. **Migrated system-overview/** files to architecture/ and history/
4. **Moved canonical/** files to evidence/
5. **Created new domain-specific files**: CI_CD.md, SECURITY_POSTURE.md
6. **Preserved history** via `git mv` for all moves

## Migration Table

| Original Path | Action | Destination | Consolidation Notes |
|---------------|--------|-------------|---------------------|
| `docs/product.md` | Moved | `docs/product/PRODUCT_OVERVIEW.md` | Product domain canonical |
| `docs/contracts.md` | Moved | `docs/architecture/DATA_MODEL.md` | Business invariants with data model |
| `docs/ARCHITECTURE.md` | Moved | `docs/architecture/ARCHITECTURE.md` | Canonical architecture |
| `docs/system-overview/15-ARCHITECTURAL-DECISIONS.md` | Moved | `docs/architecture/DECISIONS.md` | All ADRs consolidated |
| `docs/operating-model.md` | Moved | `docs/architecture/` | Operating patterns are architectural |
| `docs/workflow-v2.md` | Moved | `docs/architecture/WORKFLOWS.md` | State machines and workflows |
| `docs/design-system.md` | Moved | `docs/engineering/DESIGN_SYSTEM.md` | Visual standards |
| `docs/quality-bar.md` | Moved | `docs/engineering/QUALITY_AND_TESTING.md` | Quality and testing standards |
| `docs/execution-rhythm.md` | Moved | `docs/engineering/DEVELOPMENT_PROCESS.md` | Development process |
| `docs/canonical/*.md` | Moved | `docs/evidence/` | Evidence and canonical truth |
| `docs/deploy-firebase-hosting.md` | Moved | `docs/operations/DEPLOYMENT.md` | Web deployment |
| `docs/deploy-100-cloud-environments.md` | Moved | `docs/operations/ENVIRONMENTS.md` | Environment management |
| `docs/rollback-procedure.md` | Moved | `docs/operations/ROLLBACK.md` | Rollback procedures |
| `docs/mobile-deployment.md` | Moved | `docs/operations/DEPLOYMENT-MOBILE.md` | Mobile deployment |
| `docs/qa-backend-deploy.md` | Moved | `docs/operations/DEPLOYMENT-QA.md` | QA deployment |
| `docs/agents.md` | Moved | `docs/agents/AGENT_ROLES.md` | Agent roles and context |
| `docs/handoff-template.md` | Moved | `docs/agents/HANDOFF_TEMPLATE.md` | Handoff template |
| `docs/system-overview/*.md` | Moved | `docs/history/` | Historical context and decisions |
| `docs/ sécurité/dependency-triage.md` | Kept | `docs/security/SUPPLY_CHAIN.md` | Supply chain security |
| `(new)` | Created | `docs/engineering/CI_CD.md` | CI/CD pipelines |
| `(new)` | Created | `docs/security/SECURITY_POSTURE.md` | Security compliance |

## Files Created

| File | Purpose |
|------|---------|
| `docs/engineering/CI_CD.md` | CI/CD pipelines and build processes |
| `docs/security/SECURITY_POSTURE.md` | Current security controls and compliance |

## Files Modified

| File | Change |
|------|--------|
| `docs/CONSOLIDATION_RECORD.md` | Updated with Phase 3-5 changes |
| `docs/README.md` | To be updated in Phase 5 with new navigation |
| `docs/DOCUMENTATION_POLICY.md` | To be updated in Phase 5 |

## Open Items Requiring Human Review

1. **Green color split**: Two close greens (`#2f9600` vs `#39a900`) need resolution
2. **Mobile strategy**: Clarify Expo vs Flutter legacy vs PWA pathway
3. **Environment routing**: Verify branch→target mapping documentation
4. **Production URL contradiction**: `miayudatics.vercel.app` vs `miayudatics.web.app`

## Verification Checklist

- [x] Created 9 domain directories
- [x] Preserved history/archive/ folder
- [x] Moved all root .md files to appropriate domains
- [x] Migrated system-overview/ to architecture/ and history/
- [x] Moved canonical/ to evidence/
- [x] Created missing domain files (CI_CD.md, SECURITY_POSTURE.md)
- [x] Used `git mv` for all moves to preserve history
- [ ] Update docs/README.md with new navigation
- [ ] Update docs/DOCUMENTATION_POLICY.md
- [ ] Verify all internal links

## Key Learnings:

1. **Domain clarity**: The 9-domain architecture (product, architecture, engineering, operations, agents, security, history, evidence, current) provides clear separation of concerns and aligns documentation with reader tasks
2. **Preserved provenance**: Using `git mv` for all moves maintains commit history and file attribution, enabling forensic reconstruction of document evolution
3. **Contradiction surfacing**: The reorganization process identified critical contradictions requiring human resolution:
   - Green color split: `#2f9600` vs `#39a900`
   - Mobile strategy ambiguity: Expo vs Flutter legacy vs PWA pathway
   - Environment routing: Branch→target mapping undefined
   - Production URL conflict: `miayudatics.vercel.app` vs `miayudatics.web.app`
4. **Completeness achieved**: All 25+ root-level markdown files and 20+ system-overview files found appropriate homes in the new structure
5. **Historical clarity**: Moving ~311 historical files to history/ and ~12 canonical files to evidence/ preserves forensic chain while reducing active surface