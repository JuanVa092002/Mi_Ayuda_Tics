# Registro de Skills y gentle-ai Aplicados (SKILLS-USED.md)

| Skill / Herramienta | Principio de Diseño Aplicado | Archivos Modificados / Impactados | Beneficio Real en Producto | Evidencia |
|---|---|---|---|---|
| `operational-workspace` | Arquitectura de comando y foco operacional (Focus Case y SplitWorkspace) | `CasosPorResolverTabla.tsx`, `AdminSolicitud.tsx` | El técnico y el líder reducen el tiempo de decisión de minutos a < 3 segundos | Inspector lateral libre de duplicidad de botones primarios |
| `frontend-design` | Armonía visual, densidad de información y micro-jerarquías | `Funcionario.tsx`, `HistorialFuncionario.tsx`, `index.css` | Se transforma una tabla fría en un centro de acompañamiento cálido con línea de vida de 4 etapas | Hero con Stepper de 4 fases y tarjetas de estado con diseño responsivo |
| `defensive-ux` | Trazabilidad de cancelaciones y manejo resiliente de errores | `AdminSolicitud.tsx`, `Funcionario.tsx` | La cancelación de tickets requiere justificación documentada en un Drawer seguro | Componentes `SlideOverDrawer` y `WorkflowManualRetryNotice` |
| `accessibility` | Foco accesible, navegación por teclado, roles semánticos y contraste | Vistas de roles y componentes `shared/ui` | Cumplimiento de WCAG 2.1 AA en contraste y usabilidad en zoom 200% | Selectores de foco en CSS y atributos aria |
| `testing` | Strict TDD y pruebas de regresión de workflows de acción única | `client/src/tests/` | Protección contra reintroducción de elementos duplicados | Suite `role-convergence-antiduplicity.test.tsx` |
