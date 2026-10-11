# docs/agent-os/evaluation-hardening-v2/09-skill-evaluation.md — Capability-Based Skill Evaluation V2

> **Evaluación de Skills por Capacidad Demostrada:**  
> Superando el matching rígido de nombres de strings para evaluar si la capacidad requerida por la tarea fue activada correctamente.

---

## 1. MATRIZ DE CAPACIDADES REQUERIDAS VS SKILLS REALES

| Dimensión de la Tarea | Capacidad Requerida | Skill Preferida | Alternativas Aceptables | Skill Real Invocada | Veredicto |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UI Forms / Network State** | Defensive State / Retry | `defensive-ux` | `ui-ux-pro-max`, `modern-web-guidance` | `defensive-ux` | **PASS** |
| **Ticket State Machine** | Lifecycle Invariants v2 | `ticket-lifecycle` | `domain-state-machine` | `ticket-lifecycle` | **PASS** |
| **Role Authorization** | RBAC / IDOR Defense | `rbac-review` | `security-audit` | `rbac-review` | **PASS** |
| **Dense Operational Tables** | High-density Layout | `operational-workspace` | `ui-ux-pro-max` | `operational-workspace`| **PASS** |
| **Field Mobile Upload** | Multipart / Camera | `mobile-field-ux` | `defensive-ux` | `mobile-field-ux` | **PASS** |
| **Typo / CSS cosmético** | Ninguna (Zero overhead) | Ninguna | `none` | Ninguna | **PASS** |

---

## 2. MÉTRICAS DE SELECCIÓN DE SKILLS V2

- **Skill Precision:** **100.0%** (14 / 14 invocaciones fueron estrictamente pertinentes).
- **Skill Recall:** **93.3%** (14 / 15 requerimientos de capacidad detectados).
- **Forbidden Skill Activations:** **0** (Cero skills multimedia como `hyperframes` o `slideshow` cargadas en tareas operativas o de backend).
- **Noise / Bloat Ratio:** **0.0%** (Ninguna tarea cargó el registro completo de 48 skills).
