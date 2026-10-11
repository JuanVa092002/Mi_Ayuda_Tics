- **Misión:** Reconstrucción Integral UX/UI Web Multirol (Líder TIC, Funcionario, Técnico).
- **Modo:** `/goal` (Long-running autonomous execution).
- **Estado General:** COMPLETED_WITH_CAVEATS (Reabierta por misión correctiva P0 — post-login workspace visual reconstruction).
- **Superficie autorizada:** Exclusivamente `client/` y documentación en `docs/missions/miayudatics-web-ux-ui-reconstruction/`.
- **Scope Prohibido:** `server/`, `mobile/`, `packages/contracts/`.
- **Seguridad:** Cero secrets en código, cero git push, cero deploy.

## Inventario de Capacidades del Entorno

| Capacidad | Estado | Modo de Uso en la Misión |
|---|---|---|
| **gentle-ai (v2.5.0 CLI)** | AVAILABLE / USED | Ejecución de `gentle-ai skill-registry refresh`, ODD/SDD contracts |
| **Engram (v1.20.0 MCP)** | AVAILABLE / USED | Memoria persistente MCP configurada en Antigravity `mcp_config.json` |
| **ui-ux-pro-max** | AVAILABLE / USED | 10 pilares arquitectónicos, 192 paletas, 119 reglas de UX en `.agents/skills/` |
| **web-design-guidelines** | AVAILABLE / USED | Directrices Vercel/Linear: focus rings (`:focus-visible:ring-2`), semántica HTML, A11y |
| **frontend-design (Anthropic)** | AVAILABLE / USED | Principios Anti-AI Slop, copywriting centrado en usuario, diseño intencional |
| **ai-ux-patterns** | AVAILABLE / USED | Google PAIR & Shape of AI: confianza calibrada, explicabilidad, HITL |
| **operational-workspace** | AVAILABLE / USED | Master-detail split pane, slide-over drawer, no horizontal scroll |
| **defensive-ux** | AVAILABLE / USED | Adaptive skeletons con shimmer (CLS < 0.1), optimistic updates, recovery |
| **Antigravity Browser** | AVAILABLE / USED | Validación y navegación visual de flujos de roles en cliente web |
| **Antigravity Terminal** | AVAILABLE / USED | Comandos Git, validación y verificación de artefactos |

## Gates de la Misión

- [x] **Gate 0 (Bootstrap):** Entorno verificado, capacidades registradas, baseline limpio en branch `master`.
- [x] **Gate 1 (Auditoría Frontend):** Flujos mapeados para Líder TIC, Funcionario y Técnico.
- [x] **Gate 2 (Skills & Design Patterns):** Skills instaladas y catalogadas en `.atl/skill-registry.md`.
- [x] **Gate 3 (Especificación & Tokens):** Matriz Figma adaptada a tokens SENA en Tailwind / index.css.
- [x] **Gate 4 (Fundación Visual):** Primitives `SlideOverDrawer`, `AdaptiveSkeletonList` y `AdaptiveSkeletonDetail` creados en `shared/ui`.
- [x] **Gate 5 (Workspace Líder TIC):** `AdminSolicitud.tsx` refactorizado con split pane y drawer de cancelación.
- [x] **Gate 6 (Workspace Funcionario):** `Funcionario.tsx` y `HistorialFuncionario.tsx` con skeletons y card de caso activo.
- [x] **Gate 7 (Workspace Técnico):** `CasosPorResolverTabla.tsx` con slide-over drawer para bitácora y soluciones.
- [x] **Gate 8 (A11y & Defensive State):** `focus-visible`, contraste WCAG AA, cero scroll horizontal operativo.
- [x] **Gate 9 (Git & Handoff):** Commits locales atómicos, HANDOFF.md generado.
