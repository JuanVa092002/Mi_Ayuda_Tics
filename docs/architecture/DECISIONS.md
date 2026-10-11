# 15 — Registro de Decisiones de Arquitectura (Architectural Decisions)

> **Clasificación:** Decisiones observadas y deducidas a partir de la implementación y evolución del repositorio.

---

## ADR-01: Máquina de Estados Workflow v2 con Persistencia Append-Only
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** En la versión inicial (v1), el estado de un caso se mutaba directamente y el cierre dependía de una entidad secundaria (`SolucionCaso`), impidiendo saber qué técnico intervino previamente o qué preguntas se realizaron.
- **Decisión:** Implementar Workflow v2 (`workflowVersion === 2`) con 7 estados determinísticos y un historial inmutable (`HistorialSolicitud`) donde cada acción (`started`, `note_added`, `resolved`, etc.) es un registro independiente.
- **Consecuencias:** Trazabilidad absoluta de extremo a extremo, pero exige transacciones de réplica en MongoDB para mantener la atomicidad de las mutaciones.

---

## ADR-02: Garantía de Idempotencia a Nivel de Frontera HTTP
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** En condiciones de conectividad inestable o clics repetidos en la interfaz, una misma acción (ej. resolver un caso o registrar una nota) podía duplicarse o crear condiciones de carrera.
- **Decisión:** Exigir la cabecera HTTP `Idempotency-Key` en todas las acciones de mutación de tickets. Si llega una petición con la misma clave, se devuelve el resultado previo sin volver a mutar ni crear eventos duplicados en la base de datos.
- **Consecuencias:** Elimina duplicaciones accidentales; obliga al cliente a generar UUIDs por cada intención de usuario.

---

## ADR-03: Realtime Híbrido: Server-Sent Events (SSE) + Sondeo Secundario
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** Socket.IO requería configuraciones complejas de handshake, reintentos y dependencias de cliente adicionales en Web.
- **Decisión:** Utilizar **Server-Sent Events (SSE)** mediante `/api/notificaciones/stream` como el mecanismo primario de push para navegadores, con un polling de respaldo de baja frecuencia (60s).
- **Consecuencias:** Funciona sobre HTTP estándar sin librerías pesadas en el frontend; desconexiones transitorias se recuperan automáticamente con backoff.

---

## ADR-04: Exclusión del Rol Líder TIC en la Aplicación Móvil
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** Las tareas del Líder TIC involucran tableros Bento Grid densos, análisis de métricas comparativas y gestión masiva de ambientes y usuarios.
- **Decisión:** Bloquear el acceso a cuentas de Líder en la aplicación Expo (`lider-not-supported.tsx`), forzando el uso exclusivo de la versión Web para este rol.
- **Consecuencias:** Evita degradar la experiencia de coordinación técnica en pantallas pequeñas; simplifica el alcance de la app móvil centrándola en la labor de campo (Funcionario y Técnico).

---

## UX/Web Reconstruction Decisions (2026-09)
Source: docs/agent-run/ux-ui-decisions.md (archived 2026-10-10)

| ID | Date | Context / Problem | Alternatives Evaluated | Decision Made | Technical Justification |
|---|---|---|---|---|---|
| D0.1 | 2026-09-27 | Structural divergence between layouts by role (`LeaderLayout` vs `AppLayout` + `NavApp` vs `TecnicoLayout` + `NavTecnico`) | 1. Keep separate layouts and tweak CSS ad-hoc.<br>2. Unify into shared `AppShell` architecture based on `LeaderLayout` experience, with role-injected navigation. | Unify under multi-role `AppShell`. | Eliminates header duplication, notifications and profiles; ensures Leader TIC, Official, and Technician share same identity, collapsible sidebar, responsive drawer, and navigation experience. |
| D0.2 | 2026-09-27 | Use of non-institutional colors (`#1B2A4A`, `#6B7A99`, `#A0AABF` in Profile) | 1. Tolerate historical colors.<br>2. Strictly standardize on SENA institutional tokens (`#04324d`, `#39a900`, `on-surface`, `on-surface-variant`). | Standardize on institutional tokens. | `docs/design-system.md` explicitly prohibits `#1B2A4A`. Chromatic consistency reinforces SENA B2B identity. |
| D0.3 | 2026-09-27 | Forced internal scroll with `max-h-[calc(100vh-350px)]` and `h-screen` on Technician and Official tables | 1. Keep fixed viewports.<br>2. Migrate to natural flow with maximum width boundary and clean page scroll. | Remove fixed `vh` and adopt natural responsive flow. | Quality rules prohibit `vh` and `h-screen` as default for dynamic content because they break at 200% zoom and on medium/small screens. |
| D0.4 | 2026-09-27 | Duplication of pagination, searchers, and empty states across 7 different tables | 1. Keep isolated implementations.<br>2. Consolidate common components in `shared/ui`. | Consolidate common components in `shared/ui`. | Ensures same accessibility, keyboard, focus, and visual feedback without code redundancy. |

---

## Structural Decisions (Web Reconstruction Workstream, 2026-09)
Source: docs/agent-run/decision-log.md (archived 2026-10-10)

| ID | Date | Context / Problem | Alternatives Evaluated | Decision Made | Technical Justification |
|---|---|---|---|---|---|
| D0.1 | 2026-09-26 | Agent execution control file location | 1. Workspace root<br>2. `docs/agent-run/` | Use `docs/agent-run/` | Keeps root completely clean and centralizes audit in versionable technical documentation. |
| D1.1 | 2026-09-26 | Governance Commit A | 1. Group everything in 1 massive commit<br>2. Separate governance and indexes first | Isolated Commit A (`a862f37`) | Allows hardening Cursor/agent indexing rules before introducing any code or skill. |
| D3.1 | 2026-09-26 | `.agents/skills/` versioning | 1. Ignore in Git and depend on network<br>2. Version completely with `skills-lock.json` | Full versioning in Commit B | Reinstallation from GitHub is not pinned to a commit and can break reproducibility; lockfile and sources ensure total independence. |
| D5.1 | 2026-09-26 | Preservation of `packages/`, `scripts/`, and `e2e/` in root | 1. Move to `.workspace/` subfolder<br>2. Keep in root as technical exceptions | Keep in root | `packages/contracts` is member of `pnpm-workspace.yaml`; `scripts/` are invoked by `package.json`; `e2e/` is referenced by `playwright.config.ts`. Moving them would add fragile aliases and break CI. |
| D5.2 | 2026-09-26 | Consolidation of `video/` into `marketing/product-film/` | 1. Keep `video/` separate in root<br>2. Integrate into `marketing/` | Move to `marketing/product-film/` | Video is a product showcase and naturally fits within marketing media suite, reducing one more root folder. |
