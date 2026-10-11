# docs/agent-os/agent-os-metrics.md — Agent OS Performance, Autonomy & Quality Metrics

> **Propósito:** Definir y medir los indicadores clave de desempeño (KPIs) del Agent OS de MiAyudaTics, evaluando autonomía, eficiencia de contexto, calidad de entrega e impacto humano.

---

## 1. DIMENSIONES DE MEDICIÓN

```text
                  MÉTRICA NORTE:
        MAXIMIZAR: (User Value × Quality × Autonomy)
        MINIMIZAR: (Context Waste + Human Friction + Ceremony)
```

---

## 2. MÉTRICAS OPERATIVAS

### 2.1 Autonomía y Reducción de Fricción Humana
- **Human Minutes per Completed Task (`human_minutes/task`):**
  - *Meta:* < 1 minuto en tareas Tier 0-2 (solo revisión de resultado).
  - *Comportamiento Actual:* Los tests, corrección de lints y lectura de archivos se ejecutan 100% de forma autónoma.
- **Autonomous Completion Rate:**
  - *Fórmula:* `(Tareas completadas sin intervención humana / Total de tareas) * 100`
  - *Meta:* > 85% en tareas no estratégicas.
  - *Excepciones Válidas:* Paradas HITL obligatorias (cambios de credenciales, destrucción de datos, cambios de arquitectura core).

### 2.2 Eficiencia de Contexto & Recursos
- **Useful Memory Retrieval Rate:**
  - *Fórmula:* `(Memorias relevantes recuperadas vía Engram / Total de memorias inyectadas)`
  - *Estándar:* Búsquedas quirúrgicas con `mem_search` y lectura de observaciones completas con `mem_get_observation` solo cuando aportan valor al ticket.
- **Skill Dispersion Ratio:**
  - *Regla:* Cero carga masiva de skills. Solo 1 a 2 skills específicas inyectadas por tarea desde `.atl/skill-registry.md`.
- **Context Bloat Prevention:**
  - *Mecanismo:* Empleo estricto de `scripts/context/surface.mjs` para delimitar superficies (`web`, `backend`, `mobile`), ignorando carpetas irrelevantes.

### 2.3 Calidad & Resiliencia Técnica
- **P0/P1 Regression Rate:**
  - *Meta:* 0 fallos P0 introducidos en `master`.
- **Verification Strictness:**
  - Prohibido marcar una tarea como completada sin evidencia observable (`TEST: PASS`, `BUILD: PASS`, `OBSERVED EVIDENCE`).
- **One-Writer Compliance:**
  - 100% de cumplimiento: cero colisiones de escritura concurrente sobre los mismos archivos.

---

## 3. CHECKLIST DE META-OPTIMIZACIÓN PERIÓDICA

Cada ciclo de desarrollo el sistema evalúa:
1. ¿Se interrumpió al usuario para una acción que podía resolverse de forma autónoma y segura? → *Si sí, corregir la regla de autonomía.*
2. ¿Se cargó una skill que no se utilizó durante la implementación? → *Si sí, afinar el trigger en `.atl/skill-registry.md`.*
3. ¿Ocurrió un bug que no fue capturado por un test? → *Convertir inmediatamente la falla en una prueba permanente de regresión.*
4. ¿Se descubrió una decisión o restricción de negocio clave? → *Persistir en Engram mediante `mem_save`.*
