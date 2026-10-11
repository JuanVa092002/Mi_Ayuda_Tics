# Registro de Decisiones y Skills Usadas — REBUILD 01

## 1. Skills Aplicadas y Decisiones de Ingeniería

| Skill | Decisión de Producto / Arquitectura | Archivo Afectado | Impacto Observable |
|---|---|---|---|
| `field-technician-workbench` | Reconstruir la consola del técnico como estación de campo asimétrica con resumen de turno, mesa central de diagnóstico y drawers de bitácora/solución. | `CasosPorResolverTabla.tsx` | El técnico no salta de pantalla para atender, registrar notas intermedias o cerrar un caso. |
| `command-center-ux` | Sustituir la tabla plana de solicitudes por un centro de despacho con telemetría de cola y selector de especialistas de un solo clic. | `AdminSolicitud.tsx` | Despacho instantáneo y seguro de casos con feedback claro y drawer de cancelación justificada. |
| `case-lifecycle-design` | Implementar un Case Journey empático y humano para el funcionario con stepper de 4 fases y bloques explícitos de estado y siguiente acción. | `Funcionario.tsx` | Comprensión del caso activo en menos de 3 segundos sin jerga técnica. |
| `workflow-feedback-design` | Diseñar e integrar `FeedbackBanner` para notificar al usuario sobre qué caso cambió, quién quedó involucrado y cuál es el próximo paso. | Todas las páginas | Claridad operacional tras cada mutación de base de datos. |
| `defensive-ux` | Incorporar `WorkflowManualRetryNotice` e `InlineAlert` ante desconexión de red sin pérdida de formularios. | Todas las páginas | Resiliencia ante caídas de conexión o reintentos manuales. |
| `accessibility` | Añadir soporte estricto de tecla `Escape`, navegación secuencial por tabulador y atributos `aria-hidden` / `aria-label`. | Primitivas compartidas y páginas | Cumplimiento accesible y ergonomía de teclado. |

---

## 2. Inventario de Componentes Nuevos / Modificados

### Creados y Consolidados
- `ShiftHeader`: Resumen de turno de técnicos, contadores tácticos y barra de filtros.
- `FieldWorkbench`: Consola de campo con `WorkQueue` (cola lateral), `ActiveJob` (mesa de trabajo), `JobBrief` (contacto y aula), `WorkChecklist` y `ActionRail`.
- `OperationsHeader`: Mando operativo para despacho ágil de requerimientos.
- `DecisionWorkspace`: Panel de decisión con `DecisionQueue`, `RequestBrief` y `SpecialistPicker`.
- `PersonalStatusBar`: Saludo institucional, frase de situación y CTA de radicación.
- `CaseJourney`: Stepper de 4 hitos claros y bloques contextuales *"Qué está pasando"* y *"Próximo paso"*.
- `SlideOverDrawer`: Paneles deslizantes laterales para bitácora, radicación y cancelación con cierre por `Escape`.
