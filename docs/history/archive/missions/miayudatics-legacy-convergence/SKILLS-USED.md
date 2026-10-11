# Registro de Habilidades de Gentle-AI Utilizadas (SKILLS-USED)

En esta misión se audita el catálogo de skills obligatorias exigidas por la directriz para registrar su principio aplicado, archivo afectado, cambio producido y validación.

---

## Matriz de Skills

| Skill | Estado | Principio Aplicado | Archivo(s) Afectado(s) | Cambio Producido | Validación |
|---|---|---|---|---|---|
| `frontend-design` | USED | Uso de tokens de superficie, escalas tipográficas y jerarquía visual estricta en lugar de utilidades dispersas | `client/src/index.css`, `client/src/shared/ui/` | Homogeneización de tarjetas, dot status badge system, focus states accesibles | Verificación visual y suite vitest |
| `modern-web-guidance` | USED | Directrices modernas de HTML semántico, `:focus-visible`, reducción de movimiento y áreas táctiles | `client/src/shared/ui/Button.tsx`, `SlideOverDrawer.tsx` | Contratos de botón con accesibilidad, min-heights estándar de 36/40/44px y control de foco | Vitest suite |
| `ui-ux-pro-max` | USED | Principios de diseño para SaaS data-dense y plataformas operativas (Linear/Stripe-like) | `pages/admin/`, `pages/tecnico/` | Erradicación de botones estilo texto; drawers contextuales en lugar de popups | Inspección de layout y browser subagent |
| `accessibility` | USED | Estándares WCAG 2.1 AA: contrastes de color, labels en inputs, soporte de navegación por teclado y aria-live | `shared/ui/`, `pages/` | Adición de etiquetas aria en modales, botones y drawers; selector de estado legible | Tests de accesibilidad y teclado |
| `responsive` | USED | Layouts fluidos adaptados a múltiples viewports (1440, 1280, 1024, 768, 390) sin overflow horizontal | `pages/admin/solicitud/SeguimientoSolicitud.tsx`, `pages/tecnico/` | Ajuste de rejillas y flexboxes en lugar de tablas desbordadas | Verificación en viewports |
| `React` | USED | Componentes funcionales puros, manejo de estado predecible, hooks personalizados y memoización | `client/src/shared/ui/`, `client/src/pages/` | Reducción de rerenders y separación limpia de presentación | Typecheck de TypeScript |
| `TypeScript` | USED | Tipado estricto `noEmitOnError`, interfaces unificadas y eliminación de `any` implícitos | `shared/ui/index.ts`, `pages/` | Cero errores de compilación (`tsc --noEmit`) | `pnpm -C client run typecheck` PASS |
| `testing` | USED | Strict TDD y pruebas de regresión de comportamiento con Vitest y React Testing Library | `client/src/tests/` | Protección de navegación, selección de colas y renderizado de componentes | 19 suites de prueba, 65 tests verdes |
| `documentation` | USED | Trazabilidad documental completa de arquitectura, mapa de migración, inventario legacy y handoff | `docs/missions/miayudatics-legacy-convergence/` | Generación de especificaciones y matrices de evidencia | Documentos markdown auditables |
| `defensive-ux` | USED | Manejo proactivo de errores, reintentos idempotentes y estados vacíos informativos | `pages/admin/AdminSolicitud.tsx`, `CasosPorResolverTabla.tsx` | Inclusión de `WorkflowManualRetryNotice` en flujos de cancelación y reasignación | Tests unitarios de retry policy |
| `operational-workspace` | USED | Consola orientada a tareas con split queue + inspector para roles de alta frecuencia | `pages/admin/AdminSolicitud.tsx`, `CasosPorResolverTabla.tsx` | Despacho y resolución de casos en 1 toque | Vitest role workspaces |
| `ai-ux-patterns` | NOT_APPLICABLE | No aplican interfaces generativas en esta fase de convergencia visual legacy | N/A | Ninguno | N/A |
| `web-design-guidelines` | USED | Guías de consistencia visual, jerarquía y affordance | `shared/ui/`, `index.css` | Erradicación de elementos visualmente ambiguos | RDD review |
| `security` | USED | Sanitización de datos, tokens de sesión y prevención de inyección en URLs y medios | `shared/media/user-photo.ts`, `sessionToken.ts` | Pruebas de validación de URLs e integridad de sesión | Tests verdes de session y auth |
| `Tailwind` | USED | Restricción de clases a tokens canónicos del sistema de diseño evitando valores mágicos | `client/src/index.css`, `pages/` | Limpieza de clases arbitrarias | Build y typecheck |
| `browser` | USED | Validación visual en vivo con el subagente de navegador | Rutas críticas web | Capturas de pantalla e inspección de elementos | Reporte de evidencia |
| `validation` | USED | Gates de calidad objetivos sin suposiciones ni cierres prematuros | Repositorio completo | Cumplimiento estricto de los Quality Gates | Reporte de validación técnica |
