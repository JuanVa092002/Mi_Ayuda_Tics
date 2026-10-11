# MiAyudaTICS — Lista Maestra de Tareas UX/UI Web Multirol

| ID | Fase | Descripción | Dependencia | Estado | Archivos afectados | Validación | Rollback |
|---|---|---|---|:---:|---|---|---|
| F0.1 | Fase 0 | Inventario de rutas, layouts y componentes por rol | Ninguna | DONE | `client/src/` | Inspección de código de solo lectura | N/A |
| F0.2 | Fase 0 | Auditoría profunda de Líder TIC (Baseline) | F0.1 | DONE | `client/src/pages/admin/`, `LeaderLayout.tsx` | Inspección de layout, tablas y modales | N/A |
| F0.3 | Fase 0 | Auditoría profunda de Funcionario | F0.1 | DONE | `client/src/pages/funcionario/` | Inspección de formulario e historial | N/A |
| F0.4 | Fase 0 | Auditoría profunda de Técnico | F0.1 | DONE | `client/src/pages/tecnico/` | Inspección de bandejas de trabajo | N/A |
| F0.5 | Fase 0 | Creación del informe de auditoría `UX-UI-AUDIT.md` | F0.2-F0.4 | DONE | `docs/agent-run/UX-UI-AUDIT.md` | Verificación de reporte exhaustivo | N/A |
| F1.1 | Fase 1 | Definición y consolidación de tokens en `tailwind.config.js` e `index.css` | F0.5 | TODO | `client/tailwind.config.js`, `index.css` | typecheck y lint visual | `git checkout` |
| F1.2 | Fase 1 | Creación de primitivas compartidas de navegación y shell (`AppShell`, `RoleNavigation`) | F1.1 | TODO | `client/src/shared/ui/shell/` | typecheck y test unitario | `git checkout` |
| F1.3 | Fase 1 | Creación de componentes compartidos de tabla, búsqueda y paginación | F1.1 | TODO | `client/src/shared/ui/` | typecheck y tests | `git checkout` |
| F1.4 | Fase 1 | Creación de componentes compartidos de feedback, empty y error states | F1.1 | TODO | `client/src/shared/ui/` | typecheck y tests | `git checkout` |
| F1.5 | Fase 1 | Estandarización de badges de estado alineados con contracts | F1.1 | TODO | `client/src/shared/ui/StatusBadge.tsx` | typecheck | `git checkout` |
| F2.1 | Fase 2 | Prototipo vertical: Shell + Navegación rol Funcionario | F1.2 | TODO | `client/src/pages/funcionario/` | Vista previa y typecheck | `git checkout` |
| F2.2 | Fase 2 | Prototipo vertical: Shell + Navegación rol Técnico | F1.2 | TODO | `client/src/pages/tecnico/` | Vista previa y typecheck | `git checkout` |
| F2.3 | Fase 2 | Prototipo vertical: Validación de responsividad y colapso de sidebar | F2.1-F2.2 | TODO | `client/src/app/layouts/` | Responsive test | `git checkout` |
| F3.1 | Fase 3 | Líder TIC: Refactor de `AdminSolicitud` con nuevos componentes compartidos | F2.3 | TODO | `AdminSolicitud.tsx` | typecheck y test | `git checkout` |
| F3.2 | Fase 3 | Líder TIC: Refactor de `SeguimientoSolicitud` y filtros de estado | F3.1 | TODO | `SeguimientoSolicitud.tsx` | typecheck y test | `git checkout` |
| F3.3 | Fase 3 | Líder TIC: Refactor de páginas de Técnicos (`AdminTecnicos`, Activos, Inactivos) | F3.2 | TODO | `AdminTecnicos.tsx`, `Tecnicos*.tsx` | typecheck | `git checkout` |
| F3.4 | Fase 3 | Líder TIC: Refactor de Ambientes, Casos y Estadísticas | F3.3 | TODO | `AdminAmbientes.tsx`, `AdminCasos.tsx`, `AdminEstadisticas.tsx` | typecheck | `git checkout` |
| F4.1 | Fase 4 | Funcionario: Adopción del nuevo `AppShell` unificado | F2.3 | TODO | `Funcionario.tsx` | typecheck | `git checkout` |
| F4.2 | Fase 4 | Funcionario: Elevación del formulario "Nueva Solicitud" (focus, inputs, confirmación) | F4.1 | TODO | `Funcionario.tsx` | typecheck | `git checkout` |
| F4.3 | Fase 4 | Funcionario: Elevación de `HistorialFuncionario` (scroll natural, búsqueda, badges, empty/loading) | F4.2 | TODO | `HistorialFuncionario.tsx` | typecheck | `git checkout` |
| F4.4 | Fase 4 | Funcionario: Documentación de flujos según esquema formal | F4.3 | TODO | `docs/agent-run/ux-ui-progress.md` | Verificación de documentación | N/A |
| F5.1 | Fase 4/5 | Perfil compartido: Adopción del `AppShell` y tokens institucionales limpios | F2.3 | TODO | `Perfil.tsx` | typecheck | `git checkout` |
| F5.2 | Fase 5 | Técnico: Adopción de `AppShell` y eliminación del doble layout (`NavTecnico` / `NavApp`) | F2.3 | TODO | `TecnicoLayout.tsx`, `CasosPorResolverTabla.tsx` | typecheck | `git checkout` |
| F5.3 | Fase 5 | Técnico: Refactor de `CasosPorResolverTabla` y modal de workflow/resolución | F5.2 | TODO | `CasosPorResolverTabla.tsx` | typecheck | `git checkout` |
| F5.4 | Fase 5 | Técnico: Refactor de `MisCasosTabla` y `CasosResueltosTabla` | F5.3 | TODO | `MisCasosTabla.tsx`, `CasosResueltosTabla.tsx` | typecheck | `git checkout` |
| F6.1 | Fase 6 | Auditoría y optimización de carga cognitiva y decisiones por rol | F5.4 | TODO | Páginas principales | Revisión de textos y CTAs | N/A |
| F7.1 | Fase 7 | Validación de accesibilidad por teclado, focus-visible y semántica | F6.1 | TODO | Componentes compartidos | Navegación con tab/focus | N/A |
| F7.2 | Fase 7 | Validación de zoom 200% y visualización en pantallas móviles/tablets | F7.1 | TODO | Layouts y tablas | Inspección responsive | N/A |
| F8.1 | Fase 8 | Ejecución de suites completas: typecheck, vitest tests y build | F7.2 | TODO | `client/` | `pnpm -C client run typecheck && test && build` | N/A |
| F8.2 | Fase 8 | Creación de tests de regresión para navegación y layouts por rol | F8.1 | TODO | `client/src/tests/` | Tests Vitest | `git checkout` |
| F9.1 | Fase 9 | Revisión crítica multirol contra criterios de éxito | F8.2 | TODO | Monorepo completo | Lista de verificación | N/A |
| F10.1 | Fase 10 | Commit 1: `refactor(web): establish shared role-based ux foundation` | F9.1 | TODO | `shared/ui`, `layouts`, `tokens` | git status, commitlint | `git reset` |
| F10.2 | Fase 10 | Commit 2: `refactor(web): stabilize leader tic experience` | F10.1 | TODO | `pages/admin/` | git status, commitlint | `git reset` |
| F10.3 | Fase 10 | Commit 3: `refactor(web): align funcionario experience` | F10.2 | TODO | `pages/funcionario/` | git status, commitlint | `git reset` |
| F10.4 | Fase 10 | Commit 4: `refactor(web): align tecnico experience` | F10.3 | TODO | `pages/tecnico/` | git status, commitlint | `git reset` |
| F10.5 | Fase 10 | Commit 5: `test(web): add role-based ux regression coverage` | F10.4 | TODO | `tests/` | vitest run | `git reset` |
