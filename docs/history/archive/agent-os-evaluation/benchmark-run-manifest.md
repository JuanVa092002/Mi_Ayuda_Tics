# Benchmark Run Manifest — Provenance & Reproducibility Audit

> **Protocol:** Gentle-AI v2.5.0 × Antigravity Evaluation Hardening V2.1  
> **Standard:** Immutable Run Provenance, Cryptographic Hashing, Anti-Contamination Verification  
> **Status:** AUDITED, RECONCILED & SEALED  

---

## 1. RUN METADATA & REPOSITORY PROVENANCE

```yaml
run_provenance:
  run_id: "RUN-MIA-20260930-V21-HARDENED"
  timestamp_iso: "2026-09-30T17:52:00-05:00"
  git_commit_sha: "cd16bae9b0ae692dfda98a2e4d993aeb9721d21e"
  git_branch: "master"
  clean_worktree_at_start: true
  author: "Agent Evaluation & Hardening Engineering Team"
  reconciliation_version: "V2.1.4 (Final Schema Validation Integrity Fix & Seal)"
```

---

## 2. RUNTIME & INFRASTRUCTURE FINGERPRINT

```yaml
runtime_environment:
  operating_system: "Microsoft Windows 11 Enterprise (x64)"
  shell: "pwsh / powershell 7.x"
  node_version: "v20.18.0"
  pnpm_version: "9.12.0"
  agent_os_infrastructure:
    gentle_ai_version: "v2.5.0"
    engram_version: "1.20.0 (Persistent SQLite memory via MCP)"
    antigravity_version: "AGY-IDE-2.0"
  mcp_active_servers:
    - name: "engram"
      status: "ACTIVE"
      tools_available: 18
    - name: "mcp-server-neon"
      status: "ACTIVE"
    - name: "supabase"
      status: "ACTIVE"
    - name: "skillsmp"
      status: "ACTIVE"
```

---

## 3. DATASET & EVALUATION CONTRACT HASHES (SHA-256)

To guarantee that the public test suite was never contaminated by private ground truth definitions, that all evaluations are cryptographically tamper-evident, and that historical runs are strictly separated from post-run canonical contract reconciliations:

### 3.1 Historical Execution Artifact Hashes (At Run Time: `cd16bae9`)

> **Note on Historical Provenance:** These hashes represent the exact state of artifacts during historical run `RUN-MIA-20260930-V21-HARDENED`. Historical empirical results remain preserved as an immutable baseline.

| File Role | Relative Workspace Path | Historical SHA-256 Digest |
|---|---|---|
| **Public Blind Suite** | `evaluation/public/task-suite.json` | `76348c9b071022d3d54e70205ebfdaf29f452f032acc40620f00acc94990d65f` |
| **Private Ground Truth V2.1** | `evaluation/private/ground-truth.json` | `2d9efec9e2d87a9de05808a9c695dbdd6b6a07684d0292d8307240c370666282` |
| **Hidden Tasks Suite V2.1** | `evaluation/private/hidden-tasks-v2.1.json` | `0c77269c8e35d9c9b3be1a9c3982cca3f47b9d99f2b457cb77a8e5dd2da7bb03` |
| **Unified Task Schema V2.1** | `evaluation/schemas/task-schema-v2.1.json` | `ac15c88e8ce662d7ac701ce8c8258eddd662d0ba47c6beec7b5ad47d423708d5` |

### 3.2 Canonical Post-Reconciliation Artifact Hashes (Canonical V2.1.4 Sealed)

> **Methodological Clarification:** The historical benchmark results were not re-executed in V2.1.4. V2.1.4 normalizes `task-suite.json` to pure JSON without markdown comment headers, closes schema properties with `additionalProperties: false`, and validates all datasets using a full JSON Schema engine with controlled negative tests. No empirical benchmark result was altered.

| File Role | Relative Workspace Path | Canonical V2.1.4 SHA-256 Digest | Status |
|---|---|---|:---:|
| **Public Blind Exposure Schema** | `evaluation/schemas/public-blind-task-schema-v2.1.json` | `22c6422754d768ea3e3878dc92220ad2f2ef2f7db065ab0aa80f32e5aa7bea29` | **PUBLIC_EXPOSURE_CONTRACT** |
| **Canonical Internal Task Schema** | `evaluation/schemas/task-schema-v2.1.json` | `9843c812305d8567f8117cd0cf825fe3b68b659a63986379392f70eb56ae74e7` | **CANONICAL_SOURCE_OF_TRUTH** |
| **Public Blind Suite (Pure JSON)** | `evaluation/public/task-suite.json` | `b3d444a82aed1669183fb06f50d40b09c3788952a7c9d1635ae725ec026b9ee8` | **BLIND_VALIDATED_20_OF_20** |
| **Private Ground Truth V2.1** | `evaluation/private/ground-truth.json` | `e8a8d4906bcf822b7fe681363811dc4ff1dd205515345dbd660ad66cf70a6fd5` | **CANONICAL_VALIDATED_20_OF_20** |
| **Hidden Tasks Suite V2.1** | `evaluation/private/hidden-tasks-v2.1.json` | `9579ec0cd103cc34e42ac4f1096c350c8b164fb166c94b41bd60690330989ac3` | **CANONICAL_VALIDATED_16_OF_16** |

---

## 4. ARTIFACT INTEGRITY VS. ACCESS ISOLATION PROVENANCE

Methodological distinction is strictly enforced between artifact integrity and operational access isolation:

```yaml
artifact_integrity:
  definition: "Cryptographic tamper-evidence and immutability of static files"
  method: "SHA-256 Digest calculation on canonical files"
  status: "VERIFIED"
  tamper_evident_audit: "SEALED"

access_isolation:
  definition: "Architectural and operational boundary preventing ground truth leaks to the agent under evaluation"
  status: "DOCUMENTED / HISTORICAL EVIDENCE"
  note: "Demonstrated by historical test harness process isolation and public/private filesystem boundaries. SHA-256 verifies artifact integrity only, not access isolation."
  evidence:
    harness_architecture: "Isolated Evaluator Process"
    public_directory: "evaluation/public/task-suite.json"
    private_directory: "evaluation/private/"
    task_input_sanitization:
      contract_applied: "evaluation/schemas/public-blind-task-schema-v2.1.json"
      fields_exposed_to_agent: ["task_id", "surface", "user_intent"]
      fields_stripped_at_boundary:
        - "risk_envelope"
        - "routing"
        - "hard_constraints"
        - "soft_preferences"
        - "verification_contract"
        - "target_path"
    canary_leak_check: "ZERO_LEAKS (Historical telemetry confirmed zero direct access to private/ directory during task run)"
```

---

## 5. REPRODUCIBILITY BASELINE (N = 3 RUNS)

The 5 Golden Tasks were subjected to $N=3$ identical runs under fixed environmental seeds to test decision stability:

```yaml
reproducibility_runs:
  sample_size: 3
  metrics:
    routing_variance: 0.00
    skill_capability_variance: 0.00
    worker_spawning_variance: 0.00
    hitl_trigger_variance: 0.00
    hard_constraint_pass_variance: 0.00
  stability_verdict: "REPRODUCIBLE_3_RUNS"
  clarification: "Reproducibility confirmed for 3 fixed runs; this does not constitute an assertion of universal non-deterministic invariance across all stochastic conditions."
```
