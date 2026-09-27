# MiAyudaTICS — Plan de Misión Integral UX/UI Web Frontier (/goal)

## 1. Identificación y Estado
- **Misión:** Reconstrucción integral UX/UI Web Multirol de Clase Mundial (Líder TIC, Funcionario, Técnico).
- **Modo:** `/goal` (Long-running autonomous execution).
- **Estado General:** IN_PROGRESS.
- **Superficie autorizada:** Exclusivamente `client/` y documentación en `docs/missions/miayudatics-web-ux-ui/`.

---

## 2. Inventario de Skills Activas y Matriz de Uso

| Skill | Dominio | Propósito en la Misión | Fase | Estado |
|---|---|---|---|---|
| `ui-ux-pro-max` | UX/UI / Design System | 10 pilares arquitectónicos, tipografía, paletas semánticas, ergonomía táctil (44px) | Specify, Design, Implement | ACTIVE |
| `web-design-guidelines` | A11y / Frontend Standards | Directrices Vercel/Linear: focus rings (`:focus-visible:ring-2`), aria-labels, a11y audit | Review, Validate | ACTIVE |
| `frontend-design` | UI Craft (Anthropic) | Anti-AI Slop, copywriting centrado en usuario, jerarquía visual de alto impacto | Design, Implement | ACTIVE |
| `ai-ux-patterns` | AI UX / Interaction | Directrices Google PAIR & Shape of AI: confianza calibrada, HITL, explicabilidad | Design, Implement | ACTIVE |
| `operational-workspace` | High-density B2B UX | Master-detail split pane, drawers laterales, reemplazo de tablas horizontales | Implement (Líder/Técnico) | ACTIVE |
| `defensive-ux` | State Management | Skeletons adaptativos con shimmer, optimistic updates, rollback y recovery | Implement, Test | ACTIVE |
| `design-system` | Tokens Institucionales | Coherencia con identidad SENA / MiAyudaTIC web | Design, Implement | ACTIVE |

---

## 3. Fases de Ejecución

### Fase 1: Context Discovery & Baseline Audit [EN PROCESO]
- [x] Crear estructura de persistencia en `docs/missions/miayudatics-web-ux-ui/`.
- [ ] Mapear flujos actuales por rol en `client/src/pages/`:
  - **Líder TIC:** `admin/` (despacho, métricas, reasignación, carga de técnicos).
  - **Funcionario:** `funcionario/` (radicación asistida, timeline de caso activo, historial).
  - **Técnico:** `tecnico/` (cola priorizada, bitácora, evidencias, drawer de resolución).
- [ ] Comprobar servidor dev y estado de compilación.

### Fase 2: Matriz de Adaptación de Patrones (Figma Community CRM UI Kit + Linear Standard)
- [ ] Documentar matriz de adaptación: Patrón Figma -> Intención UX -> Problema en MiAyudaTICS -> Solución -> Rol -> Archivos.

### Fase 3: Arquitectura y Componentes Base de Workspace
- [ ] Implementar primitives en `client/src/shared/ui/`:
  - `MasterDetailLayout.tsx` (Split-pane interactivo).
  - `SlideOverDrawer.tsx` (Inspector lateral con backdrop blur).
  - `AdaptiveSkeleton.tsx` (Shimmer con CLS < 0.1).
  - `StatusPill.tsx` (Dual encoding: Dot/Icon + Label + Color).
  - `UndoToast.tsx` (HITL 5s Grace Period).

### Fase 4: Reconstrucción de Experiencia por Rol
- [ ] **Rol Funcionario:** Vista sin fricción, radicación conversacional guiada, timeline interactivo de estados.
- [ ] **Rol Técnico:** Eliminación de tabla horizontal en `CasosPorResolverTabla.tsx`, vista split-pane con inspección de caso y bitácora en drawer.
- [ ] **Rol Líder TIC:** Panel de supervisión, métricas de SLA destacadas, asignación ágil sin recarga en `AdminSolicitud.tsx`.

### Fase 5: Verificación Visual, Accesibilidad y QA Adversarial
- [ ] Auditoría visual en navegador (Playwright / Browser inspection).
- [ ] Verificación de accesibilidad: Tab order, focus-visible, contraste WCAG AA, labels semánticos.
- [ ] Typecheck estricto (`tsc --noEmit`) y build de validación (`pnpm build`).

### Fase 6: Handoff y Cierre
- [ ] Generación de reporte final de misión con evidencia visual y técnica.
- [ ] Commits locales estructurados.
