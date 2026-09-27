# MiAyudaTICS — Propuesta Integral de Consolidación Documental, Contexto y Skills

**Fecha:** 2026-09-26
**Workspace:** `./`
**Estado:** Propuesta de arquitectura y diseño (Solo lectura / Planificación verificable).
**Regla de seguridad:** Cero pérdida de información. Los archivos originales no se borran; se unifican en fuentes canónicas y se trasladan a `archive/`.

---

## 1. Diagnóstico del Estado Actual

Tras la inspección profunda de los directorios documentales, se identificaron:
- **`docs/`**: 29 archivos Markdown (~230 KB), con duplicación conceptual entre guías operativas, runbooks de incidentes resueltos y checklists de fases pasadas (`docs/baseline/`, `docs/case-study/`).
- **`context/`**: 3 archivos Markdown (~80 KB), con **duplicación semántica crítica**: `current-web-backend-behavior.md` (v1, junio 2026) vs `current-web-backend-behavior-v2.md` (v2, agosto 2026).
- **`archive/`**: 54 archivos Markdown (~350 KB) de auditorías pasadas, briefs y PR reviews.
- **`.cursor/`**: 8 reglas `.mdc`, 6 agentes `.md`, 6 skills `.md` y 1 hook `.json`.
- **`.agents/`**: 325 archivos Markdown correspondientes a la suite de Hyperframes y el recién creado `PROJECT-INDEX.md`.

---

## 2. Matriz de Clasificación Canónica (Fases 1 y 2)

Cada documento del proyecto se mapea formalmente a **una única categoría primaria**:

| Categoría Primaria | Documentos Actuales | Archivo Canónico Objetivo | Acción Propuesta |
|---|---|---|---|
| **GOVERNANCE** | `AGENTS.md`, `.cursor/rules/00-founder-os.mdc`, `docs/operating-model.md`, `docs/execution-rhythm.md` | `AGENTS.md` + `.agents/rules/governance.md` | Mantener `AGENTS.md` como raíz ultra-corta; mover modelo operativo a `docs/governance/`. |
| **PROJECT_INDEX** | `.agents/PROJECT-INDEX.md`, `llms.txt` | `.agents/PROJECT-INDEX.md` | Preservar intacto como enrutador principal. |
| **PRODUCT** | `docs/product.md`, `docs/analytics.md` | `docs/product/product.md` | Consolidar ICP, métricas y roadmap en un solo documento vivo. |
| **DESIGN** | `docs/design-system.md`, `.cursor/rules/40-design-system.mdc` | `docs/design/design-system.md` | Preservar tokens SENA y reglas visuales. |
| **ARCHITECTURE** | `docs/architecture.md`, `docs/contracts.md`, `docs/workflow-v2.md` | `docs/architecture/architecture.md` + `docs/architecture/contracts.md` | Mantener arquitectura global y contratos de máquina de estados v2 sincronizados con `@miayuda/contracts`. |
| **CONTEXT_CURRENT** | `context/current-mobile-agent-context.md`, `context/current-web-backend-behavior-v2.md` | `context/mobile.md` + `context/web-backend.md` | Renombrar limpiamente; archivar el obsoleto `current-web-backend-behavior.md` (v1). |
| **RUNBOOK** | `docs/mobile-deployment.md`, `docs/rollback-procedure.md`, `docs/runbooks/*.md`, `docs/quality-bar.md` | `docs/runbooks/development.md`, `testing.md`, `deployment.md` | Agrupar por ciclo de vida operativo. |
| **HISTORY** | `docs/baseline/*`, `docs/case-study/*`, `docs/incidents/*`, `docs/handoffs/*`, `archive/*` | `archive/baseline/`, `archive/case-study/`, etc. | Mover formalmente al directorio `archive/` para excluirlos del contexto activo. |
| **SKILL** | `.cursor/skills/*`, `.agents/skills/*` | `.cursor/skills/*` (core) y `.agents/skills/` (multimedia) | Preservar sin romper invocaciones. |

---

## 3. Detección de Duplicados y Solapamientos (Fase 3)

| Grupo | Archivos Involucrados | Tema | Fuente más Actual | Pérdida Potencial | Acción Recomendada |
|---|---|---|---|---|---|
| **G1: Comportamiento Backend** | `context/current-web-backend-behavior.md` vs `context/current-web-backend-behavior-v2.md` | Especificación de endpoints y sockets | `current-web-backend-behavior-v2.md` | Cero; v2 incluye workflow v2, idempotencia y correcciones de sockets. | Mover v1 a `archive/context/v1/` y renombrar v2 a `context/web-backend.md`. |
| **G2: Reglas de Handoff** | `docs/handoff-template.md` vs `.cursor/rules/30-handoffs.mdc` | Protocolo de entrega de workstream | `docs/handoff-template.md` | Cero; la regla `.mdc` solo resume el template. | Mantener template canónico en `docs/governance/` y regla ágil en `.cursor/rules/`. |
| **G3: Casos de Estudio & Baseline** | `docs/baseline/PHASE-05-*.md` (4 archivos) y `docs/case-study/MIAYUDATIC-*.md` (3 archivos) | Auditoría forense de releases pasadas (D1, D2) | `docs/baseline/MIAYUDATIC-BASELINE.md` | Cero; son actas de verificación histórica ya cerradas. | Mover en bloque a `archive/baseline/` y `archive/case-study/`. Despeja más de 2.000 líneas del indexador. |
| **G4: Runbooks de Unicidad** | `docs/runbooks/solicitud-codigo-caso-unique.md` vs `docs/runbooks/historial-operation-id-unique.md` | Migraciones MongoDB de índices únicos | Ambos vigentes pero específicos | Ninguna si se consolidan. | Fusionar en `docs/runbooks/database-migrations.md`. |

---

## 4. Auditoría de Skills y Reglas de Agentes (Fase 4)

- **Skills Core de Negocio (`.cursor/skills/` - 6 skills):**
  - `ticket-lifecycle`: Máquina de estados de tickets (v1 vs v2, historial).
  - `rbac-review`: Middleware de autorización y roles.
  - `mobile-field-ux`: Cámara, galería y permisos en Expo.
  - `design-system`: Tokens y UI.
  - `release-readiness`: Checklists pre-deploy.
  - `docs-handoff`: Cierre de tareas.
  - **Decisión:** **Preservar intactas**. Son invocadas activamente por nombre en Cursor y Antigravity.
- **Skills Multimedia (`.agents/skills/` - 26 skills):**
  - Orientadas a video, audio, GSAP y animación (Hyperframes).
  - **Decisión:** Ya fueron blindadas en `.cursorignore` y `.agentignore`. No deben tocarse para mantener su reproducibilidad (`skills-lock.json`).

---

## 5. Estructura Documental Canónica Objetivo

```text
MiAyudaTics_v1.0/
├── AGENTS.md                          # Entrada raíz concisa (roles, scopes, verify)
├── .agents/
│   ├── PROJECT-INDEX.md               # Mapa de enrutamiento y reglas de alcance
│   └── skills/                        # Skills Hyperframes / video (bajo demanda)
├── .cursor/
│   ├── settings.json                  # Plugins compartidos
│   ├── rules/                         # Guardrails de Cursor por archivo (*.mdc)
│   ├── agents/                        # 6 subagentes especializados
│   └── skills/                        # Skills core de producto (ticket, rbac, etc.)
├── context/                           # ESTADO VIVO DE SUPERFICIES (Ultra-rápido)
│   ├── mobile.md                      # Estado real de la app Expo (antiguo current-mobile...)
│   └── web-backend.md                 # Estado real de API y web (antiguo *-behavior-v2)
├── docs/                              # DOCUMENTACIÓN VIVA DEL PRODUCTO
│   ├── product/
│   │   ├── product.md                 # ICP, roadmap y alcance
│   │   └── design-system.md           # Tokens y estilo visual
│   ├── architecture/
│   │   ├── architecture.md            # Diagramas, bounded contexts y topología
│   │   └── contracts.md               # Schemas Zod y RBAC
│   ├── runbooks/
│   │   ├── development.md             # Guía de setup local y emulador
│   │   ├── testing.md                 # Unit tests, integration y e2e
│   │   ├── database-migrations.md     # Índices y scripts de mantenimiento
│   │   └── deployment.md              # Checklists y rollback
│   └── agent-run/                     # Logs de progreso y control del agente
└── archive/                           # MEMORIA HISTÓRICA FUERA DE CONTEXTO
    ├── baseline/                      # Fases D1, D2 cerradas
    ├── case-study/                    # Auditorías forenses
    ├── incidents/                     # Reportes post-mortem de 2026
    ├── handoffs/                      # Handoffs de sesiones anteriores
    └── context-v1/                    # Comportamiento legacy v1 archivado
```

---

## 6. Plan de Ejecución por Fases Controladas (Commits por Dominio)

### Fase A: Limpieza y Reubicación a `archive/` (Reducción inmediata de ruido)
- Mover `docs/baseline/`, `docs/case-study/`, `docs/incidents/` y `docs/handoffs/` a `archive/`.
- Mover `context/current-web-backend-behavior.md` (v1) a `archive/context-v1/`.
- **Commit propuesto:** `docs(archive): move historical baselines, forensics and v1 context to archive`

### Fase B: Reorganización y Renombrado de Contexto Vivo
- Renombrar `context/current-mobile-agent-context.md` -> `context/mobile.md`.
- Renombrar `context/current-web-backend-behavior-v2.md` -> `context/web-backend.md`.
- Actualizar enlaces en `AGENTS.md` y `.agents/PROJECT-INDEX.md`.
- **Commit propuesto:** `docs(context): standardize canonical active context names`

### Fase C: Estructuración Canónica de `docs/` (Product, Architecture, Runbooks)
- Crear carpetas `docs/product/`, `docs/architecture/`, `docs/runbooks/`.
- Mover y consolidar documentos en sus respectivas carpetas temáticas.
- Unificar runbooks de migraciones en `docs/runbooks/database-migrations.md`.
- Actualizar enlaces cruzados.
- **Commit propuesto:** `docs(architecture): reorganize product, architecture and operational runbooks`

---

## 7. Métricas de Impacto Esperadas

- **Archivos en `docs/` y `context/` activos:** Reducción de **32 archivos** a **8 archivos canónicos**.
- **Líneas de contexto activas:** Reducción de más del **65% de tokens** al consultar la documentación operativa.
- **Riesgo de pérdida de información:** **0%** (el 100% del historial se preserva en `archive/`).
- **Validaciones:** `pnpm test` y typecheck se ejecutan tras cada commit sin tocar código de producción.

---

```text
PROPUESTA COMPLETADA — LISTA PARA REVISIÓN
No se han modificado archivos de código ni se ha ejecutado git commit.
```
