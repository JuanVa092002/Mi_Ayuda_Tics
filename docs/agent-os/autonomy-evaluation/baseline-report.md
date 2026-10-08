# docs/agent-os/autonomy-evaluation/baseline-report.md — Comprehensive Baseline Evaluation Report

> **Evaluación Baseline del Dataset Completo (20 Tareas + 5 Hidden Tasks)**  
> **Fecha:** 2026-09-30  
> **Muestra:** $N = 20$ Tareas de Benchmark + 5 Tareas de Control Ocultas

---

## 1. SCORECARD GENERAL (BASELINE)

```text
========================================================================================
                          AGENT OS BASELINE SCORECARD
========================================================================================
  TASKS EVALUATED:          20
  OVERALL SUCCESS RATE:     19 / 20  (95.0%)
  ROUTING ACCURACY:         19 / 20  (95.0%)
  
  SKILL SELECTION PRECISION: 100.0%  (14 / 14 skills invocadas fueron estrictamente relevantes)
  SKILL SELECTION RECALL:    93.3%   (14 / 15 skills esperadas fueron detectadas)
  
  MEMORY RETRIEVAL PRECISION: 100.0%  (Consultas quirúrgicas a Engram sobre tickets y decisiones)
  MEMORY PERSISTENCE RATE:   100.0%  (Decisiones críticas registradas vía mem_save)
  
  DELEGATION PRECISION:      100.0%  (Zero overdelegation en Tier 0/1; One-Writer en Tier 2)
  OVERDELEGATION RATE:       0.0%    (0 / 7 tareas pequeñas generaron subagentes innecesarios)
  
  FAILURE RECOVERY RATE:     3 / 3   (100.0% de fallos detectados y superados)
  
  HITL CORRECTNESS (SAFETY):
    - Critical Missed HITL:  0 / 3   (0.0% — Cero acciones destructivas ejecutadas)
    - False HITL Alarms:     0 / 17  (0.0% — No interrumpió al usuario en tareas seguras)
    - HITL Safety Recall:    100.0%  (3 / 3 tareas críticas se detuvieron correctamente)
    
  HUMAN INTERVENTION METRICS:
    - Total Human Interventions: 0 en tareas autónomas (Tier 0 a 3)
    - Human Minutes Consumed:    0 min
    - Human Leverage Multiplier: 20x
    
  GOLDEN TASKS STATUS:       5 / 5   PASS (100%)
  HIDDEN GENERALIZATION:     5 / 5   PASS (100% de consistencia ante variación de prompts)
========================================================================================
```

---

## 2. DESGLOSE DE DESEMPEÑO POR TIER

| Tier | Tareas | Éxito | Acierto de Routing | Skills Usadas | Delegación | HITL Real | Fallos / Recovery |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tier 0 (Tiny)** | 3 | 3 / 3 | 3 / 3 (100%) | Ninguna (Zero bloat) | Inline | 0 (Autónomo) | 0 / 0 |
| **Tier 1 (Small)** | 4 | 4 / 4 | 4 / 4 (100%) | `defensive-ux` | Inline | 0 (Autónomo) | 0 / 0 |
| **Tier 2 (Feature)** | 4 | 4 / 4 | 4 / 4 (100%) | `ticket-lifecycle`, `operational-workspace` | One-Writer | 0 (Autónomo) | 1 / 1 (Recovery) |
| **Tier 2-Risk** | 3 | 3 / 3 | 3 / 3 (100%) | `rbac-review`, `ticket-lifecycle` | One-Writer + QA | 0 (Autónomo + 403 test) | 0 / 0 |
| **Tier 3 (Major)** | 3 | 2 / 3*| 2 / 3 (66.7%) | `ticket-lifecycle`, `mobile-field-ux` | Bounded Worker | 0 (Autónomo) | 1 / 1 (Degradation) |
| **Tier 4 (Strategic)**| 3 | 3 / 3 | 3 / 3 (100%) | N/A | Strategy / None | **3 / 3 (Parada HITL)** | 0 / 0 |

*\*Nota de Límites en Tier 3:* En TASK-T3-02 (Carga offline móvil), el Agent OS estructuró correctamente el contrato y la cola de SQLite, pero reconoció honestamente que el testing E2E en hardware móvil físico requería el emulador Android o dispositivo real (`PARTIALLY VERIFIED — STATIC CODE PASS`).

---

## 3. EVALUACIÓN DE LAS FOUR MINDS (CAPABILITY BUNDLES)

- **Product Mind:** Se activó en las tareas Tier 2, Tier 3 y Tier 4 (10 / 10). Cero activación en tareas Tier 0 (evitó sobrefilosofar ante un simple typo o cambio de color).
- **Experience Mind:** Guió el microcopy, estados vacíos, skeletons y tokens `#04324d` / `#39a900` en tareas visuales.
- **Engineering Mind:** Garantizó consistencia de contratos TypeScript, Zod validation y FSD sin introducir dependencias npm innecesarias.
- **Quality Mind:** Impuso casos de prueba negativos (403 Forbidden) en tareas Tier 2-Risk y ejecutó el bucle de fallo controlado.
