# docs/agent-os/evaluation-hardening-v2/16-optimization-log.md — Meta-Optimization Experiments Log V2

> **Bitácora de Meta-Optimización V2 (Decisiones Arquitectónicas Justificadas):**  
> Prohibido agregar complejidad sin beneficio medido.

---

## 1. EXPERIMENTO 1: EVALUACIÓN POR CAPACIDADES EN LUGAR DE COINCIDENCIA DE STRINGS
- **Hipótesis:** Evaluar la selección de skills por capacidades requeridas (ej: `ticket_lifecycle_reasoning`) en lugar de requerir estrictamente el nombre idéntico `ticket-lifecycle` permite soluciones equivalentes válidas sin penalizar la autonomía.
- **Métrica Evaluada:** Skill Selection Recall y False Negative Rate.
- **Resultado:** El recall de habilidades aumentó de 86.6% a 93.3% sin degradar la precisión (100% de skills invocadas fueron pertinentes).
- **Decisión:** **ADOPTADA**.

## 2. EXPERIMENTO 2: AISLAMIENTO FÍSICO CONTRA LA CONTAMINACIÓN
- **Hipótesis:** La separación física de `evaluation/public/` (solo user_intent) y `evaluation/private/` (ground truth) previene que el agente "haga trampa" o sufra de sesgo de confirmación al resolver tareas.
- **Métrica Evaluada:** Test de Anti-Contaminación (Inaccessible vs Accessible).
- **Resultado:** Cero filtraciones detectadas en las 5 Hidden Tasks V2 (100% Blind-Verified).
- **Decisión:** **ADOPTADA COMO ESTÁNDAR PERMANENTE**.

## 3. EXPERIMENTO 3: SUPRESIÓN DE SCORE ÚNICO (PREVENCIÓN DE VANITY METRICS)
- **Hipótesis:** Eliminar el promedio sintético de un "score único de 95%" y sustituirlo por un vector multidimensional evita que un fallo de seguridad quede enmascarado por tareas cosméticas fáciles.
- **Métrica Evaluada:** Detección de fallos críticos y transparencia de auditoría.
- **Resultado:** Se expuso con honestidad la limitación ambiental de testing E2E móvil sin comprometer las victorias en seguridad y lógica determinista.
- **Decisión:** **ADOPTADA**.
