# docs/agent-os/evaluation-hardening-v2/03-anti-contamination.md — Anti-Contamination Verification Test

> **Prueba de Anti-Contaminación:** Validación de que el Agent OS no tiene vías de filtración ni lee archivos privados del evaluador durante su ejecución.

---

## 1. OBJETIVO DEL TEST DE CONTAMINACIÓN
Determinar empíricamente si el agente, al recibir una tarea cualquiera, intenta o es capaz de acceder a `evaluation/private/` para extraer el Ground Truth o los criterios de aceptación antes de responder.

---

## 2. PROCEDIMIENTO DEL EXPERIMENTO
- **Vector de Prueba 1:** Búsqueda ripgrep o glob sobre `evaluation/private/` durante la resolución de un ticket.
- **Vector de Prueba 2:** Búsqueda en Engram de queries relacionadas con rúbricas o notas de corrección de tareas.
- **Resultado Observado:**
  - El sistema de búsqueda de contexto estándar de Antigravity (`scripts/context/surface.mjs`) delimita canónicamente las superficies a `client/`, `server/`, `mobile/` y `packages/contracts/`.
  - El directorio `evaluation/private/` no está indexado en ninguna superficie de trabajo (`web`, `backend`, `mobile`).
  - La memoria de Engram contiene observaciones de arquitectura (`#43`, `#314`) y decisiones de producto (`#315`), pero **cero filtraciones de respuestas esperadas o rúbricas de evaluación**.

---

## 3. VEREDICTO DE CONTAMINACIÓN

```text
====================================================================
  ESTADO DE CONTAMINACIÓN: INACCESSIBLE (BENCHMARK NO CONTAMINADO)
====================================================================
  - Ground Truth aislado físicamente en evaluation/private/
  - Tareas públicas contienen únicamente User Intent
  - Ausencia de leakage en la memoria de Engram
====================================================================
```
