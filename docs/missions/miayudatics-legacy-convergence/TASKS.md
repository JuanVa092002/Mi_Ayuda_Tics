# Matriz de Tareas y Tracking de Ejecución (TASKS)

## Estado General
- **Total tareas:** 18
- **Completadas:** 4
- **En progreso:** 1
- **Pendientes:** 13

---

## Tareas por Fase

### Fase 0 — Bootstrap y Baseline
- [x] **TASK-001:** Verificar estado de Git, HEAD, commits anteriores e integridad del árbol de trabajo.
- [x] **TASK-002:** Correr typecheck y suite de pruebas para confirmar baseline funcional y corregir aserciones de prueba obsoletas.
- [x] **TASK-003:** Identificar y registrar skills disponibles e integrables.

### Fase 1 — Inventario y Diagnóstico Legacy
- [x] **TASK-004:** Inspeccionar `client/src/shared/ui/`, `pages/admin/`, `pages/funcionario/`, `pages/tecnico/` y `layouts/`. Documentar hallazgos en `LEGACY-INVENTORY.md`.

### Fase 2 y 3 — Mapa de Migración y Especificación
- [x] **TASK-005:** Redactar `COMPONENT-MIGRATION-MAP.md` y `CONVERGENCE-SPEC.md` con reglas estrictas de convergencia.

### Fase 4 — Eliminación Legacy por Dominio
- [ ] **TASK-006 (Grupo A - Foundation):** Delegar `PrimaryButton` y `SecondaryButton` directamente a `Button` para erradicar divergencias de botones; exportar limpiamente en `shared/ui/index.ts`.
- [ ] **TASK-007 (Grupo B - Líder TIC `/seguimiento`):** Reemplazar `LeaderKpiCard` por `KpiCard`, `LeaderStatusPill` por `StatusBadge`, eliminar botones tipo texto para acciones, e implementar `SlideOverDrawer` para reasignaciones/cancelaciones con validación de motivo y retry notice.
- [ ] **TASK-008 (Grupo B - Líder TIC `/adminTecnicos`):** Converger `AdminTecnicos`, `TecnicosActivos` y `TecnicosInactivos` hacia la primitiva canónica `Button` (`success` para aprobar, `secondary` para denegar/inactivar) y `PaginationFooter`.
- [ ] **TASK-009 (Grupo B - Líder TIC `/adminAmbientes` y `/adminCasos`):** Normalizar formularios y botones a `Button` canónico y `PaginationFooter`.
- [ ] **TASK-010 (Grupo B - Líder TIC `/adminEstadisticas`):** Normalizar selectores e indicadores de carga hacia la escala y tokens estándar.
- [ ] **TASK-011 (Grupo C - Técnico `/mis-casos` y `/casos-resueltos`):** Verificar alineación de tablas y componentes compartidos con la consola técnica.
- [ ] **TASK-012 (Grupo D - Shared `/perfil`):** Asegurar consistencia visual y de tokens en la vista de perfil de usuario.

### Fase 5 — Pruebas TDD y Regresión
- [ ] **TASK-013:** Proteger las rutas y comportamientos migrados mediante tests en `client/src/tests/`.
- [ ] **TASK-014:** Confirmar que `typecheck` y `vitest` pasen al 100% de manera determinista.

### Fase 6 — Evidencia en Browser y Auditoría Visual
- [ ] **TASK-015:** Ejecutar navegador en los tres roles (`/adminSolicitud`, `/funcionario`, `/casos-por-resolver`, `/seguimiento`) y verificar viewports responsivos sin scroll horizontal imprevisto.

### Fase 7 a 9 — RDD, Métricas y Handoff
- [ ] **TASK-016:** Elaborar `QUALITY-GATES.md`, `QUALITY-REVIEW.md` y `EVIDENCE.md`.
- [ ] **TASK-017:** Crear commits locales atómicos y estructurados por dominio (sin push ni deploy).
- [ ] **TASK-018:** Generar informe final de misión y `HANDOFF.md`.
