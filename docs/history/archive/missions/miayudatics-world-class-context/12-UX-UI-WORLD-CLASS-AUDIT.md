# 12-UX-UI-WORLD-CLASS-AUDIT.md — Auditoría UX/UI World-Class de Superficies

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Matriz de Auditoría por Dimensión y Rol

| Dimensión | Funcionario (`/funcionario`) | Técnico (`/casos-por-resolver`) | Líder TIC (`/adminSolicitud`) | Evaluación | Riesgo Observado | Oportunidad Futura |
|---|---|---|---|:---:|---|---|
| **Comprensión en 3s** | Inmediata (Banner de estado + Radicar) | Rápida (Active Job destacado) | Alta (Cola de despacho) | `ÓPTIMA` | Ninguno | Tooltips explicativos en hover |
| **Acción Primaria** | "+ Radicar" o "Responder" | "Iniciar Atención" / "Resolver" | "Asignar Técnico" | `CLARA` | Ninguno | Atajos de teclado en desktop |
| **Jerarquía Visual** | Título claro, Bento Header | Bento Grid (Var B), Metadatos limpios | Lista izquierda, Detalle derecho | `FUERTE` | Ninguno | Consolidar componentes comunes |
| **Densidad Cognitiva** | Balanceada (Tarjetas modulares) | Eficiente para trabajo de campo | Media-alta (Muchos datos por caso) | `BUENA` | Densidad en pantallas móviles <360px | Modo colapsado en mobile |
| **Feedback de Acción** | Toast + FeedbackBanner contextual | Toast + Banners de transición | Toast + actualización optimista | `ROBUSTO` | Cierre inadvertido de toast rápido | Historial de alertas en campana |
| **Estados Vacíos / Carga**| `AdaptiveSkeletonDetail`, Empty state | `AdaptiveSkeletonList`, sin casos | Empty states con iconografía | `RESILIENTE`| Ninguno | Ilustraciones vectoriales propias |
| **Responsive Táctil** | Master-detail en 1 col en mobile | Tabla colapsa a tarjetas táctiles | Split panel colapsa con drawer | `ADAPTADO` | Tablas anchas en tablets 768px | Swipe gestures para avanzar |
| **Accesibilidad (a11y)** | Textos de alto contraste, semántica | Botones con etiquetas y títulos | Foco por teclado en selectores | `ALTA` | Warnings `act(...)` en tests admin | E2E con axe-core automatizado |
