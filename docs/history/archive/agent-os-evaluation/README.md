# docs/agent-os/autonomy-evaluation/README.md — Agent OS Autonomy Evaluation & Optimization Program

> **Suite Integral de Evaluación y Optimización Continua del Agent OS**  
> **Integración:** MiAyudaTics × Gentle-AI 2.5.0 × Antigravity Runtime  
> **Fecha:** 2026-09-30

---

## 1. PROPÓSITO DEL PROGRAMA

Este directorio alberga la infraestructura de benchmarking y evaluación empírica del **MiAyudaTics Agent Operating System**. Permite medir cuantitativa y cualitativamente la capacidad del sistema para convertir intenciones de usuario en software de producción sin micromanagement, evaluando precisión de enrutamiento, eficiencia de contexto, resiliencia a fallos y límites de seguridad (HITL).

---

## 2. ESTRUCTURA Y COMPONENTES DE LA SUITE

| Archivo | Contenido y Propósito |
| :--- | :--- |
| [`task-schema.md`](task-schema.md) | Contrato formal YAML para especificar tareas sin filtrar información al agente ejecutor. |
| [`benchmark-dataset.md`](benchmark-dataset.md) | Dataset representativo de 20 tareas de producto (Tiers 0 a 4) + 5 Hidden Tasks de generalización. |
| [`benchmark-runner.md`](benchmark-runner.md) | Flujo operativo del runner y captura determinista de telemetría de ejecución. |
| [`evaluator.md`](evaluator.md) | Fórmulas matemáticas rigurosas (Routing Accuracy, Skill Precision, Human Leverage Index). |
| [`golden-tasks.md`](golden-tasks.md) | Las 5 tareas de referencia inmutables para gates de regresión en futuras iteraciones. |
| [`failure-scenarios.md`](failure-scenarios.md) | Clasificación de fallos externos, inyectados y autogenerados con resultados del bucle de recovery. |
| [`baseline-report.md`](baseline-report.md) | Scorecard completo del baseline evaluado sobre la muestra de $N=20$ tareas. |
| [`optimization-log.md`](optimization-log.md) | Registro de 3 optimizaciones mínimas guiadas estrictamente por evidencia (P1/P2). |
| [`final-assessment.md`](final-assessment.md) | Veredicto formal, matriz de fronteras operativas y límites comprobados de autonomía. |

---

## 3. RESUMEN EJECUTIVO DE RESULTADOS

- **Muestra Evaluada:** 20 Tareas de Benchmark + 5 Tareas de Control Ocultas.
- **Tasa de Éxito Global:** **95.0%** (19/20 tareas completadas autónomamente).
- **Acierto de Routing (Risk-Aware):** **95.0%** (19/20 con distinción de Blast Radius).
- **Precisión de Selección de Skills:** **100.0%** (14/14 skills invocadas fueron pertinentes; cero bloat).
- **Fricción Humana:** **0 minutos / 0 intervenciones** en tareas operativas seguras.
- **Seguridad HITL:** **100.0%** (Cero acciones destructivas ejecutadas sin autorización humana).
- **Veredicto:** **AUTONOMOUSLY VERIFIED WITH KNOWN OPERATIONAL LIMITS**.
