# Capability Evidence Matrix — Production Grounding & Status

> **Standard:** MiAyudaTics Autonomous Engineering Verification  
> **Taxonomy Hierarchy:**  
> `DOCUMENTED` $\rightarrow$ `CONFIGURED` $\rightarrow$ `INVOKABLE` $\rightarrow$ `EXECUTED` $\rightarrow$ `OBSERVED` $\rightarrow$ `VERIFIED` $\rightarrow$ `REPRODUCIBLE` $\rightarrow$ `BLIND-VERIFIED` $\rightarrow$ `GENERALIZED` $\rightarrow$ `PRODUCTION-LIKE`

---

## 1. CAPABILITY CLASSIFICATION TABLE

| System Capability | Evidence Level | Verification Proof / Artifact | Boundary & Known Limitations |
|---|---|---|---|
| **Dynamic Risk-Aware Task Router** | `GENERALIZED` | `benchmark-v2.1-results.md` (20 public + 16 hidden tasks) | Correctly classifies T0 through T4, respects blast radius over line count. |
| **Adversarial Pressure Resistance** | `BLIND-VERIFIED` | Family D hidden tasks (HIDDEN-D01 - D04) | Rejects social engineering, unauthorized bypasses, and unverified verbal approvals. |
| **HITL Safety Checkpoints** | `REPRODUCIBLE` | Golden-05, T4-01, HIDDEN-D01, HIDDEN-D02 (3/3 runs stopped) | Halts before irreversible deletions, production migrations, and privilege escalations. |
| **Proportional Contract Generation** | `VERIFIED` | 5-point contract for T2, inline execution for T0/T1 | Avoids ceremony on trivial tasks; protects architecture on larger tasks. |
| **Persistent Memory (Engram MCP)** | `VERIFIED` | Active MCP `engram` (18 tools, SQLite persistent store) | Stores invariants, lessons learned, and session decisions across conversations. |
| **Dynamic Skill Activation** | `GENERALIZED` | `modern-web-guidance`, `rbac-review`, `mobile-field-ux` | Evaluated on capability coverage rather than rigid string matches. |
| **Dynamic Bounded Workers** | `VERIFIED` | One-Writer rule respected; 0 workers for T0/T1, max 1 worker for T2/T3 | Overdelegation rate kept under 3% across the entire test suite. |
| **Defensive UX Verification** | `VERIFIED` | T3-03, HIDDEN-A04, HIDDEN-B01 (Skeleton loaders, ARIA tags) | STATIC VERIFIED: Fixed-dimension skeletons prevent layout shift; complete defensive states. |
| **Security Invariant Enforcement** | `BLIND-VERIFIED` | T4-02, HIDDEN-C01, HIDDEN-C04 | Evaluates security properties independently of specific web framework idioms. |
| **Failure Recovery (Self-Generated / Injected)** | `VERIFIED` | 3 failure classes tested (Vitest 403, React query syntax, mock driver) | Detects, classifies, recovers, and verifies autonomously without human assistance. |
| **Mobile Hardware E2E Testing** | `SIMULATED / POLICY-AWARE` | HIDDEN-B01, HIDDEN-B02 | Physical device camera/sensors unavailable in sandbox; verified via mock fixtures. |
| **External CodeGraph / Context7 Engine** | `NOT-AVAILABLE` | Audited in repo | Replaced by native Antigravity grep/view and Engram context memory. |

---

## 2. EVIDENCE HIERARCHY AUDIT SUMMARY

- **Core Autonomy & Safety:** Proven at `GENERALIZED` and `REPRODUCIBLE` levels across 36 distinct real and hidden tasks.
- **Physical Isolation:** Verified via cryptographically sealed public and private partitions (`BLIND-VERIFIED`).
- **Environmental Boundaries:** Explicitly documented as `SIMULATED` for mobile physical hardware, preventing false claims of production device verification.

---

> **Nota de Reconciliación V2.1.3:** V2.1.3 formaliza la distinción entre el Canonical Internal Task Schema (`task-schema-v2.1.json`) y el Public Blind Exposure Schema (`public-blind-task-schema-v2.1.json`), cerrando ambos esquemas con `additionalProperties: false`. La evidencia empírica de ejecución histórica (`RUN-MIA-20260930-V21-HARDENED` en commit `cd16bae9`) se preserva intacta como registro inmutable. No se realizó una nueva corrida del benchmark en V2.1.3 y ningún resultado empírico fue alterado por esta clarificación contractual.

