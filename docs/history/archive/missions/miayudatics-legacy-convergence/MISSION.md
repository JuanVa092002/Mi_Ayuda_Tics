# Misión P1: Eliminación de Legacy y Convergencia UX/UI Multirol

## 1. Identificación y Estado
- **ID:** `miayudatics-legacy-convergence`
- **Prioridad:** P1 (Systemic Convergence)
- **Modo:** `/goal` (Long-running autonomous execution)
- **Estado:** IN_PROGRESS
- **Superficie autorizada:** `client/` y documentación en `docs/missions/miayudatics-legacy-convergence/`

---

## 2. Outcome Obligatorio
Eliminar de forma quirúrgica e integral las fricciones e inconsistencias entre las nuevas interfaces post-login y las superficies/componentes legacy:
1. **Unificación de Primitivas:**
   - Botones: erradicar botones inline de texto, enlaces estilizados toscamente o variaciones incompatibles; converger hacia la primitiva canónica `Button` (`primary`, `secondary`, `tertiary`, `destructive`, `success`).
   - Modales y Drawers: reglas estrictas donde formularios de radicación/actualización usan `SlideOverDrawer`, y modales breves se reservan exclusivamente para confirmaciones o diálogos atómicos accesibles.
   - Tablas y Listas: erradicación definitiva del patrón de tabla ancha con scroll horizontal en vistas principales; convergencia hacia `SplitWorkspace` (`QueueList` + `DetailPane`).
   - Tokens de Superficie: canvas global cohesivo (`--canvas`), superficies limpias (`--surface-0`, `--surface-1`), bordes nítidos (`--border-c`, `--border-strong-c`) e ink de alto contraste.
2. **Convergencia Multirol sin pérdida de identidad:**
   - **Líder TIC (`/adminSolicitud`):** Centro de decisión y despacho sin elementos residuales de CRUD clásico.
   - **Funcionario (`/funcionario`):** Centro de acompañamiento y seguimiento humanizado sin formularios invasivos en el canvas principal.
   - **Técnico (`/casos-por-resolver`):** Consola de resolución operativa con Focus Case superior y pestañas clasificadas sin tablas desbordadas.
3. **Calidad de Pruebas y Evidencia:**
   - Cobertura de regresión con Strict TDD en componentes migrados.
   - Verificación en navegador y preservación de capturas sanitizadas.

---

## 3. Plan de Fases & Quality Gates

- [ ] **Fase 0:** Bootstrap, verificación de estado git, creación de contratos y baseline.
- [ ] **Fase 1:** Inventario de componentes y patrones legacy (`LEGACY-INVENTORY.md`).
- [ ] **Fase 2:** Mapa de convergencia de componentes (`COMPONENT-MIGRATION-MAP.md`).
- [ ] **Fase 3:** Especificación de convergencia (`CONVERGENCE-SPEC.md`).
- [ ] **Fase 4:** Eliminación de legacy por dominio (Foundation, Interaction, Data, Líder, Funcionario, Técnico).
- [ ] **Fase 5:** Pruebas TDD y protección contra regresiones.
- [ ] **Fase 6:** Validación visual en Browser subagent (múltiples viewports, accesibilidad, overflow).
- [ ] **Fase 7:** RDD y revisión de calidad.
- [ ] **Fase 8:** Validación técnica (typecheck, tests, build) y métricas de convergencia.
- [ ] **Fase 9:** Commits locales estructurados y handoff final.
