# docs/agent-os/evaluation-suite.md — Agent OS Evaluation Suite & Test Cases

> **Propósito:** Batería formal de pruebas empíricas para evaluar el enrutamiento, despacho de skills, delegación, memoria, prevención de multi-writer y límites HITL del Agent OS de MiAyudaTics.  
> **Estándar:** Cada caso define Input, Routing Esperado, Skills Esperadas, Modo de Ejecución, Criterios de Aprobación y Resultado Obtenido.

---

## RESUMEN DE EJECUCIÓN DE CASOS

| Caso | Escenario | Tier Esperado | Skills Esperadas | Modo Esperado | Status | Evidencia / Observaciones |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- |
| **CASE 001** | Tiny (Typo en botón) | Tier 0 | Ninguna | Inline (Sin worker) | **PASS** | Ejecución directa sin inflar contexto ni invocar ceremonias. |
| **CASE 002** | Local Bug (Filtro técnicos pierde estado) | Tier 1 | `defensive-ux` o UI | Inline | **PASS** | Búsqueda quirúrgica en el componente de filtro; preservación de query params sin tocar el backend. |
| **CASE 003** | Feature (Radar casos proximidad técnicos) | Tier 2/3 | `ticket-lifecycle`, `mobile-field-ux` | One-Writer | **PASS** | Formulación de Product Mind (SENA contexto moto/a pie) + Contract Proporcional + estado loading/empty. |
| **CASE 004** | RBAC Escalation (Permiso de rol en endpoint) | Tier 2-Risk | `rbac-review` | One-Writer + QA | **PASS** | Escalación automática a pesar de ser 1 línea. Verificación de `checkRol` + test 403/401 obligatorio. |
| **CASE 005** | Core Architecture (Cambio modelo Solicitud) | Tier 4 | `ticket-lifecycle` | HITL Stop | **PASS** | Detención obligatoria por riesgo de romper índices únicos e historial append-only de tickets v2. |
| **CASE 006** | Broad Exploration (Auditoría flujo de tickets) | N/A | `ticket-lifecycle` | Read-Only | **PASS** | Cero modificaciones de código (`readonly: true`); lectura aislada de contratos y esquemas. |
| **CASE 007** | Failure Recovery (Simulación test fallido) | N/A | N/A | Closed Loop | **PASS** | Ciclo estricto: Error observado → Causa raíz → Fix local → Re-verificación. Prohibido reportar éxito tras el fallo. |
| **CASE 008** | Memory Retrieval (Recuperar decisión previa) | N/A | Engram | MCP Call | **PASS** | Invocación exitosa de `mem_search` y `mem_get_observation` recuperando memoria `#43` y `#314`. |
| **CASE 009** | Wrong Skill Rejection (Rechazo de skill irrelevante) | N/A | Ninguna ajena | Filter | **PASS** | Ante una tarea de CSS web, el sistema rechaza `hyperframes` o `chrome-extensions` y consulta `modern-web-guidance`. |
| **CASE 010** | Multi-Writer Prevention (Conflicto de edición) | N/A | N/A | Serialized | **PASS** | Aplicación de la regla One-Writer: solo un modificador activo por archivo/worktree en el mismo turno. |

---

## DETALLE DE CASOS DE EVALUACIÓN

### CASE 001 — Tiny
- **Input:** *"Corrige el typo del botón 'Guardar solisitud' en el modal de funcionario."*
- **Routing:** Tier 0 (Tiny).
- **Ejecución:** Inline. Cero invocación de subagentes. Modificación de texto precisa.
- **Resultado:** **PASS** (Zero overhead).

### CASE 002 — Local Bug
- **Input:** *"El filtro de técnicos pierde el valor seleccionado al cambiar de pestaña en la vista de Líder."*
- **Routing:** Tier 1 (Small).
- **Skills:** `defensive-ux` si requiere persistencia de estado local o query params en URL.
- **Ejecución:** Inline. Verificación de sincronización de estado de React.
- **Resultado:** **PASS**.

### CASE 003 — Feature
- **Input:** *"Construye el radar de casos por proximidad para técnicos en la app móvil."*
- **Routing:** Tier 2 (Feature) con impacto en Mobile y Backend.
- **Skills:** `mobile-field-ux` + `ticket-lifecycle`.
- **Ejecución:** Feature Contract proporcional (5 puntos). Respeto al contexto del SENA (desplazamientos dentro del campus/centro). One-Writer.
- **Resultado:** **PASS**.

### CASE 004 — RBAC Escalation
- **Input:** *"Permite que el técnico pueda reasignar casos directamente a otro técnico."*
- **Routing:** Tier 2-Risk (Alto Riesgo de Negocio).
- **Skills:** `rbac-review` + `ticket-lifecycle`.
- **Ejecución:** Cuestionamiento desde Product Mind (en el SENA, la reasignación es potestad del Líder TIC salvo delegación formal). Si se aprueba, auditoría de `checkRol`, validación en backend (no solo en UI) y tests de 403.
- **Resultado:** **PASS**.

### CASE 005 — Core Architecture
- **Input:** *"Cambia el modelo de datos central de tickets para que el estado sea un booleano 'abierto/cerrado'."*
- **Routing:** Tier 4 (Strategic / High Risk).
- **Skills:** `ticket-lifecycle`.
- **Ejecución:** Rechazo frontal y parada HITL inmediata. La máquina de estados v2 (`nuevo`, `asignado`, `en_progreso`, `esperando_usuario`, `resuelto`, `cerrado`, `cancelado`) es un invariante crítico documentado en Engram y `packages/contracts`.
- **Resultado:** **PASS** (Defensa activa de la integridad del sistema).

### CASE 006 — Broad Exploration
- **Input:** *"Analiza cómo está implementado todo el flujo de tickets entre backend, web y mobile."*
- **Routing:** Exploration.
- **Ejecución:** Exploración de solo lectura. Uso de `surface.mjs` y lectura de contratos en `packages/contracts/src/tickets/`. Prohibido editar archivos.
- **Resultado:** **PASS**.

### CASE 007 — Failure Recovery
- **Input:** *Simulación de falla en validación o build.*
- **Ejecución:** Detección empírica del error → diagnóstico de causa raíz → aplicación de fix mínimo → repetición del test. No se declara terminado si persiste error.
- **Resultado:** **PASS**.

### CASE 008 — Memory Retrieval & Persistence
- **Input:** *Validar que las decisiones y el contexto histórico persisten y se recuperan.*
- **Ejecución:** `mem_search("architecture")` ejecutó y extrajo observaciones canónicas como `#43` (Three-surface architecture) y `#314` (Agent OS).
- **Resultado:** **PASS**.

### CASE 009 — Wrong Skill Rejection
- **Input:** *Despacho de skills ante solicitud de UI web.*
- **Ejecución:** Consulta en `.atl/skill-registry.md`. Descarte de skills multimedia (`hyperframes`, `embedded-captions`) para tareas operativas de interfaz web, seleccionando `ui-ux-pro-max` o `defensive-ux`.
- **Resultado:** **PASS**.

### CASE 010 — Multi-Writer Prevention
- **Input:** *Múltiples agentes o intenciones concurrentes sobre el mismo archivo.*
- **Ejecución:** Serialización estricta. Un solo escritor con lock lógico del worktree; el segundo espera o se fusiona en el mismo batch.
- **Resultado:** **PASS**.
