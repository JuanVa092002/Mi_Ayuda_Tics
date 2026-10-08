# Handoff Operacional & Guía de Mantenimiento

## 1. Localización de Componentes y Páginas Principales
- **Consola de Mando Operativo (Líder TIC):** `client/src/pages/admin/AdminSolicitud.tsx`
  - Utiliza `SpecialistPicker` integrado con `asignarSolicitudTecnico` y despliega `FeedbackBanner`.
- **Field Service Workbench (Técnico de Campo):** `client/src/pages/tecnico/CasosPorResolverTabla.tsx`
  - Maneja cola de casos, detalle físico del ambiente, mutaciones de atención y `FeedbackBanner`.
- **Centro de Acompañamiento (Funcionario):** `client/src/pages/funcionario/Funcionario.tsx`
  - Visualiza el progreso de 4 etapas (`getStageStep`), `NextStepCard`, radicación en drawer y `FeedbackBanner`.
- **Primitivas UI y Semánticas:** `client/src/shared/ui/`
  - `FeedbackBanner.tsx`: Notificación persistente con metadatos contextuales.
  - `SemanticIcon.tsx`: Iconografía SVG vectorial estandarizada.
  - `AppShell.tsx`: Estructura base de navegación.

## 2. Recomendaciones para Próximos Sprints
- Si el backend incorpora endpoints para SLA o tiempos de atención formal, integrar en `DATA-CAPABILITIES.md` y desplegar badges de tiempo transcurrido en el `ActiveJob` del técnico.
- Mantener la regla estricta de no agregar botones decorativos ni duplicar componentes de tabla en las vistas reconstruidas.
