# 10-EXPERIMENTS-AND-VARIANTS.md — Inventario de Experimentos y Variantes

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `BROWSER_VERIFIED`

---

## 1. Sistema de Variantes de Rol (`ExperienceContext.tsx`)

| Rol | Variante Activa por Defecto | Variantes Disponibles | Mecanismo de Selección |
|---|---|---|---|
| **Funcionario** | `f1-journey` (Journey de Confianza) | `f1-journey`, `f2-clarity`, `f3-conversation`, `f4-inbox`, `f5-reassurance` | `localStorage` (`miayudatics_role_variant_funcionario`) o query param `?f_variant=` |
| **Técnico** | `t1-workbench` (Workbench de Intervención) | `t1-workbench`, `t2-execution-queue`, `t3-field-checklist`, `t4-resolution-timeline`, `t5-mobile-dispatch` | `localStorage` (`miayudatics_role_variant_tecnico`) o query param `?t_variant=` |
| **Líder TIC** | `l2-decision-queue` (Cola de Decisiones) | `l1-dispatch-desk`, `l2-decision-queue`, `l3-exception-center`, `l4-continuity-control`, `l5-triage` | `localStorage` (`miayudatics_role_variant_lider`) o query param `?l_variant=` |

---

## 2. Experimento A/B de Portada en Técnico (`IncidentHeaderABVariants.tsx`)

- **Variante Ganadora de Control:** **`variantB` (Bento Grid Operativo ⭐)**
  - Elegida por el usuario por su alto impacto visual, balance modular de información, desduplicación de ubicación (Ambiente + Oficina + Puesto) y cero rectángulos redundantes.
- **Variantes evaluadas en el selector:** `variantB` (Ganadora), `variantE` (Compact Elevada), `control`, `variantA` (Priority Card), `variantC` (Minimal), `variantD` (Dark Action).
