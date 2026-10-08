# docs/agent-os/autonomy-evaluation/benchmark-runner.md — Benchmark Harness & Execution Engine

> **Harness de Ejecución:** Orquestador de evaluación reproducible para correr el dataset de tareas contra el Agent OS sin micromanagement.

---

## 1. FLUJO OPERATIVO DEL RUNNER

```text
┌────────────────────────────────────────────────────────────┐
│                  BENCHMARK RUNNER ENGINE                   │
└─────────────────────────────┬──────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                    TASK INJECTION (INPUT)                  │
│  - Inyecta únicamente el "User Intent" crudo al Agent OS    │
│  - Oculta el Ground Truth, Tier esperado y Skills al agente │
└─────────────────────────────┬──────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                 OBSERVER & TELEMETRY TAP                   │
│  - Registra: Tier seleccionado, skills invocadas, mem_calls│
│  - Mide: Archivos tocados, workers creados, paradas HITL   │
└─────────────────────────────┬──────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                    EVALUATOR HARNESS                       │
│  - Compara comportamiento observado vs Ground Truth        │
│  - Computa acierto de routing, precisión de memoria/skills │
│  - Valida criterios de éxito y detección de regresiones    │
└─────────────────────────────┬──────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                 SCORECARD & METRIC EXPORT                  │
│  - Genera: Baseline report, Tier Matrix, Autonomy Profile  │
└────────────────────────────────────────────────────────────┘
```

---

## 2. PROCEDIMIENTO DE EVALUACIÓN DETERMINISTA

Para cada tarea del dataset:
1. **Paso A (Aislamiento):** Confirmar worktree limpio o registrar baseline de git.
2. **Paso B (Prompt Delivery):** Entregar el texto exacto de `User Intent`.
3. **Paso C (Observación de Decisión):**
   - Extraer clasificación de Tier (0, 1, 2, 2-Risk, 3, 4).
   - Extraer llamadas MCP a Engram (`mem_search`, `mem_save`).
   - Extraer skills solicitadas desde `.atl/skill-registry.md`.
   - Extraer delegación (Inline vs Bounded Worker).
   - Extraer respuesta de HITL (¿Se detuvo o procedió autónomamente?).
4. **Paso D (Scoring del Evaluator):**
   - `Routing Match = (Selected Tier == Expected Tier) ? 1 : 0`
   - `Skill Precision = Relevant Selected / Total Selected`
   - `HITL Precision = (Actual HITL == Expected HITL) ? 1 : 0`
   - `Verification Status = PASS | FAIL | BLOCKED`
