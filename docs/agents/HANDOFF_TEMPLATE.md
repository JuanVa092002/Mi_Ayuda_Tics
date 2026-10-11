# handoff-template.md — MiAyudaTIC

> Copy this block into every completed workstream. **Incomplete handoff = work not done.**

---

## Handoff — [TITLE]

**Date:** YYYY-MM-DD  
**Role:** [Founder-CTO | Design Engineer | PE I | PE II | Mobile Engineer | AI Ops]  
**Workstream ID:** [optional short slug]

---

### Goal

One sentence: what shipped or what decision was made.

---

### Why this matters

Link to north-star metric or roadmap stage in `product.md`.

---

### Relevant context

Files/docs read:
- [ ] `docs/product/PRODUCT_OVERVIEW.md`
- [ ] `docs/contracts.md`
- [ ] `docs/architecture.md`
- [ ] `archive/audits/...`
- [ ] Other: ___

---

### Constraints

- **In scope:**
- **Out of scope:**
- **HITL touched:** yes / no — if yes, who approved:

---

### Files touched

| Path | Change summary |
|------|----------------|
| | |

---

### Decisions made

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| | | |

---

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| | | |

---

### Open questions

1. 
2. 

---

### Next owner

| Role | Task |
|------|------|
| | |

---

### Acceptance criteria

- [ ] Criterion 1 (testable)
- [ ] Criterion 2
- [ ] Quality-bar commands run (list below)

**Verification commands run:**

```bash
# paste actual commands + pass/fail
```

---

### Reviewer sign-off

| Reviewer role | Name | Date | Approved |
|---------------|------|------|----------|
| | | | [ ] |

---

## Example (filled)

### Goal

Add Zod solicitud draft schema to `@miayuda/contracts` for mobile Stage 1.

### Why this matters

Unblocks Mobile Engineer; reduces type drift (north-star: mobile report share).

### Constraints

- In scope: `packages/contracts/src/solicitud.ts` only
- Out of scope: API implementation, UI
- HITL: no

### Files touched

| Path | Change |
|------|--------|
| `packages/contracts/src/solicitud.ts` | Added `solicitudDraftSchema` |

### Decisions made

| Decision | Rationale |
|----------|-----------|
| Server wins on conflict | See architecture offline strategy |

### Next owner

| Role | Task |
|------|------|
| PE II | Expose POST /solicitud mobile multipart if needed |
| Mobile Engineer | Build create screen against contract |

### Acceptance criteria

- [x] `pnpm -C packages/contracts run build` pass
- [x] Exported type in `index.ts`

---

## References

- Roles: `docs/agents.md`
- Quality: `docs/quality-bar.md`
