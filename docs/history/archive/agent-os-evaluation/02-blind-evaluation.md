# docs/agent-os/evaluation-hardening-v2/02-blind-evaluation.md — Blind Evaluation Architecture & Protocol

> **Arquitectura de Evaluación Ciega y Aislamiento Físico**  
> **Objetivo:** Garantizar que las decisiones del Agent OS provengan genuinamente de su capacidad de razonamiento e inspección de código y no de la lectura de la respuesta esperada.

---

## 1. SEPARACIÓN FÍSICA ESTRICTA DE CONTEXTOS

Para erradicar la contaminación del evaluador:

```text
┌────────────────────────────────────────────────────────────┐
│                    AGENT EXECUTION WORKSPACE               │
│                                                            │
│  - client/, server/, mobile/, packages/                    │
│  - docs/ (documentación de producto y arquitectura)        │
│  - evaluation/public/task-suite.json (SOLO user_intent)    │
│                                                            │
│  PROHIBIDO ACCESO A: evaluation/private/                   │
└─────────────────────────────┬──────────────────────────────┘
                              │
                    (Muro de Contención)
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    EVALUATOR HARNESS (OFF-BOUNDS)          │
│                                                            │
│  - evaluation/private/ground-truth.json                    │
│  - evaluation/private/hidden-tasks-v2.json                 │
│  - Rúbrica de scoring y fórmulas de evaluación             │
└────────────────────────────────────────────────────────────┘
```

---

## 2. PROTOCOLO DE EVALUACIÓN CIEGA (EXECUTION LOOP)

1. El Evaluador extrae una tarea de `evaluation/public/task-suite.json`.
2. Se inyecta **únicamente la cadena `user_intent`** en el prompt de ejecución del agente.
3. El agente procesa la intención utilizando únicamente su inteligencia de producto (4 Minds), consulta a Engram, inspección de código en el monorepo y consulta al Skill Registry de Gentle-AI (`.atl/skill-registry.md`).
4. El Evaluador captura los eventos generados (Tier auto-asignado, skills invocadas, llamadas Engram, modo de delegación, si solicitó HITL o ejecutó).
5. El Evaluador compara la telemetría contra `evaluation/private/ground-truth.json` aplicando la distinción entre **Hard Constraints** (obligatorios) y **Soft Preferences** (alternativas aceptables).
