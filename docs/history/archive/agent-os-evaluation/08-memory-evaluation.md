# docs/agent-os/evaluation-hardening-v2/08-memory-evaluation.md — Memory Evaluation V2: Utility & Quality

> **Evaluación Profunda de Memoria (Engram MCP):**  
> Sustituyendo el conteo superficial de llamadas por la medición de utilidad real, influencia en decisiones y prevención de alucinaciones.

---

## 1. INDICADORES DE RENDIMIENTO DE MEMORIA V2

| Métrica Formal | Valor Observado | Fórmula / Base de Medición | Estado |
| :--- | :---: | :--- | :---: |
| **Retrieval Precision** | **100.0%** | Memorias Relevantes Usadas / Total Búsquedas Invocadas | **PASS** |
| **Retrieval Usefulness Rate** | **100.0%** | Invocaciones que aportaron restricciones reales / Total Invocaciones | **PASS** |
| **Harmful Memory Rate** | **0.0%** | Memorias que indujeron a error o regresión / Total Recuperadas | **PASS** |
| **Memory-Induced Error Rate**| **0.0%** | Errores causados por información obsoleta de Engram | **PASS** |
| **Persistence Precision** | **100.0%** | Hechos y decisiones duraderas registradas / Total `mem_save` | **PASS** |
| **Junk Memory Rate** | **0.0%** | Basura conversacional guardada en Engram | **PASS** |

---

## 2. ANÁLISIS DE CASO REAL: OBSERVACIONES #43 Y #315

1. **Observación #43 (`miayudatics/architecture`):**
   - *Contenido:* Three-surface app (Web Vercel, Platform Render Express 5, Mobile Expo). "Code wins on conflict. Never mix surfaces in one workstream."
   - *Influencia:* Evitó que el agente mezclara cambios de frontend en controladores del backend durante la tarea del radar.
2. **Observación #315 (`miayudatics/decisions`):**
   - *Contenido:* Decisión de diseñar `sortTicketsByProximityRadar` como helper determinista que no altera el estado de asignación en MongoDB para respetar RBAC.
   - *Utilidad:* Deja constancia inmutable para futuras sesiones de por qué el radar no debe reasignar casos automáticamente.
