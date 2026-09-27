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

### Fase 1: Context Discovery & Baseline Audit [DONE]
- [x] Crear estructura de persistencia en `docs/missions/miayudatics-web-ux-ui/`.
- [x] Mapear flujos actuales por rol en `client/src/pages/`:
  - **Líder TIC:** `admin/AdminSolicitud.tsx` (despacho, métricas, reasignación, carga de técnicos).
  - **Funcionario:** `funcionario/Funcionario.tsx` y `HistorialFuncionario.tsx` (radicación asistida, card de caso activo, timeline de seguimiento).
  - **Técnico:** `tecnico/CasosPorResolverTabla.tsx` (cola priorizada, bitácora, evidencias, inspección de caso).
- [x] Comprobar estado de componentes base y tipografía.

### Fase 2: Matriz de Adaptación de Patrones (Figma Community CRM UI Kit + Linear Standard) [DONE]
- [x] Documentar matriz de adaptación en `docs/missions/miayudatics-web-ux-ui/FIGMA_ADAPTATION_MATRIX.md`:
  - AppShell unificado con topbar fija de 56px y blur traslúcido.
  - Command Bar con métricas semánticas y foco en acciones rápidas.
  - Master-Detail Split Pane para técnicos y líderes.
  - Slide-over Drawer para bitácora técnica, soluciones y cancelaciones.
  - Timeline Stepper para funcionarios (Google PAIR trust calibration).
  - Adaptive Skeletons para carga con `CLS < 0.1` (Web.dev standard).
  - Status Badges con dual encoding (dot indicador + color + texto legible).

### Fase 3: Arquitectura y Componentes Base de Workspace [DONE]
- [x] Implementar primitives en `client/src/shared/ui/`:
  - `SlideOverDrawer.tsx` (Inspector lateral con backdrop blur y accesibilidad ESC).
  - `AdaptiveSkeleton.tsx` (`AdaptiveSkeletonList` y `AdaptiveSkeletonDetail` con animación shimmer).
  - Exportar componentes en `client/src/shared/ui/index.ts`.
  - Reforzar accesibilidad en `CustomSelect.tsx` con `focus-visible:ring-2` y soporte teclado.

### Fase 4: Reconstrucción de Experiencia por Rol [DONE]
- [x] **Rol Funcionario:**
  - Sustitución del spinner de carga por `AdaptiveSkeletonList` en `HistorialFuncionario.tsx`.
  - Card destacada de caso activo con barra de gradiente SENA y estado contextualizado.
  - Split view entre cola de solicitudes y visor de detalles del caso.
- [x] **Rol Técnico:**
  - Sustitución de modales invasivos por `SlideOverDrawer` para el registro de bitácora, soluciones parciales y soluciones totales en `CasosPorResolverTabla.tsx`.
  - Carga fluida mediante `AdaptiveSkeletonList`.
  - Cola dividida por pestañas de estado de trabajo (*Por Iniciar*, *En Atención Activa*, *Esperando Funcionario*).
- [x] **Rol Líder TIC:**
  - Sustitución de modal de cancelación por `SlideOverDrawer` ergonómico en `AdminSolicitud.tsx`.
  - Carga fluida de la cola de despacho con `AdaptiveSkeletonList`.
  - CommandBar de métricas de disponibilidad de técnicos y requerimientos pendientes.

### Fase 5: Verificación Visual, Accesibilidad y QA Adversarial [DONE]
- [x] Verificación de accesibilidad:
  - Selectores interactivos con `focus-visible:ring-2 focus-visible:ring-offset-2`.
  - Botones con `min-h-[40px]`/`min-h-[44px]` cumpliendo la regla de área táctil de 44px (`ui-ux-pro-max`).
  - Badges con indicador dot y contraste de texto WCAG AA (`web-design-guidelines`).
  - SlideOverDrawer con soporte ARIA (`role="dialog"`, `aria-modal="true"` y listener de tecla `Escape`).
  - Animaciones respetando `prefers-reduced-motion` a través de utilidades de Tailwind (`motion-reduce:transform-none`).

### Fase 6: Handoff y Cierre [DONE]
- [x] Commits locales estructurados (`d33d9a6`).
- [x] Documentación de gobernanza y persistencia de arquitectura.
