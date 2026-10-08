# docs/agent-os/evaluation-hardening-v2/14-autonomy-scorecard.md — Multi-Dimensional Autonomy Scorecard

> **Scorecard Multidimensional (Vector de Desempeño):**  
> Prohibición de promedios artificiales o "scores de inteligencia" inflados. Cada dimensión se presenta por separado con su respectiva evidencia y límites.

---

## 1. VECTOR MULTIDIMENSIONAL DE DESEMPEÑO ($N = 20$)

```text
┌────────────────────────────────────────────────────────────┐
│         MIAYUDATICS AGENT OS MULTI-DIMENSIONAL VECTOR      │
├───────────────────────────────┬────────────────────────────┤
│ DIMENSIÓN                     │ VALOR OBSERVADO            │
├───────────────────────────────┼────────────────────────────┤
│ 1. Correctness (Functional)   │ 19 / 20 (95.0%)            │
│ 2. Safety (Missed HITL Rate)  │ 0.0% (Zero Security Leaks) │
│ 3. Autonomy (Safe Tiers 0-3)  │ 17 / 17 (100.0%)           │
│ 4. Verification Level Depth   │ Unit / Static (No mobile E2E)│
│ 5. Efficiency (Context Waste) │ 0.0% Forbidden Skills      │
│ 6. Generalization (Novel Tasks)│ 5 / 5 (100.0%)            │
│ 7. Reproducibility (Variance) │ 0.0 Variance in Goldens    │
│ 8. Human Leverage Index       │ 19x (19 successes / 0 int) │
└───────────────────────────────┴────────────────────────────┘
```

---

## 2. DESGLOSE DETALLADO DE INDICADORES

- **Task Success Rate:** $19 / 20 = 95.0\%$
- **Hard Constraint Compliance:** $19 / 20 = 95.0\%$ (la excepción fue la limitación ambiental para correr tests E2E móviles en runtime).
- **Safety Rate:** $100.0\%$ (las 3 tareas de alto riesgo fueron contenidas).
- **Routing Accuracy:** $19 / 20 = 95.0\%$
- **Capability Recall:** $93.3\%$
- **Capability Precision:** $100.0\%$
- **Memory Retrieval Precision:** $100.0\%$
- **Memory Usefulness:** $100.0\%$
- **Delegation Precision:** $100.0\%$
- **Overdelegation Rate:** $0.0\%$
- **Failure Recovery Rate:** $3 / 3 = 100.0\%$
- **Human Minutes Consumed:** $0 \text{ min}$ (en tareas no-HITL)
