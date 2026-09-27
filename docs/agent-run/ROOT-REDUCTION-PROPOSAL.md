# MiAyudaTICS — Propuesta de Reducción Segura de Raíz (Fase Final)

**Fecha:** 2026-09-26
**Workspace:** `./`
**Estado:** Propuesta Técnica de Arquitectura y Evaluación de Tooling

---

## 1. Auditoría del Estado Actual de la Raíz

Tras la consolidación exitosa de dominios (`docs/` y `marketing/`), la raíz contiene:
- **5 Dominios Principales de Producto:**
  - `client/` (Frontend React + Vite)
  - `server/` (Backend Express + Socket.io + MongoDB)
  - `mobile/` (App Móvil Expo / React Native)
  - `docs/` (Base de conocimiento: `current/`, `history/`, `design/`, `specs/`, etc.)
  - `marketing/` (Showcase de video y lanzamiento: `product-film/`, `hyperframes/`, etc.)
- **3 Carpetas Técnicas de Soporte:**
  - `packages/` (`packages/contracts`)
  - `scripts/` (Automatización operativa en Bash y TS)
  - `e2e/` (Pruebas Playwright end-to-end)
- **4 Carpetas de Herramientas Obligatorias en Raíz:**
  - `.agents/` (Antigravity/ATL Workspace Customizations Root)
  - `.cursor/` (Cursor IDE rules, subagents, settings, hooks)
  - `.github/` (GitHub Actions CI/CD workflows)
  - `.husky/` (Git hooks runner nativo)
- **6 Carpetas Locales / Regenerables (Gitignored):**
  - `.vercel/` (Vinculación de proyecto Vercel para deploy del cliente)
  - `.engram/` (Base de datos SQLite local de memoria para MCP Engram)
  - `.idea/` (Configuraciones de entorno JetBrains WebStorm / IntelliJ)
  - `.atl/` (Caché local del runtime de Antigravity)
  - `node_modules/` (Dependencias físicas de pnpm)
  - `test-results/` (Artefactos y capturas locales de Playwright)

---

## 2. Evaluación de Movimiento: `scripts/` y `e2e/`

### A. Evaluación de `scripts/` → `tools/scripts/`
- **Uso actual:**
  - `package.json` raíz invoca `bash scripts/smoke-prod.sh`, `bash scripts/e2e-ticket-lifecycle.sh`, `bash scripts/smoke-mobile-api.sh`.
  - Los scripts contienen `set -euo pipefail` y referencias internas como `./scripts/smoke-prod.sh`.
  - Múltiples documentos canónicos y guías operativas (`AGENTS.md`, `README.md`, `docs/operating-model.md`, `PROJECT_SIGNAL_REPORT.md`) referencian las rutas directas `scripts/`.
- **Análisis de riesgo:**
  - Moverlo crearía una nueva carpeta de primer nivel (`tools/`), por lo que **no reduce el número de carpetas en la raíz** (reemplazaría `scripts/` por `tools/`).
  - Rompe comandos rápidos de terminal que los desarrolladores y agentes ya conocen y ejecutan directamente (`./scripts/...`).
- **Decisión:** **Mantener `scripts/` en raíz**. Crear `tools/scripts/` no genera ahorro neto de carpetas y añade indirección innecesaria.

### B. Evaluación de `e2e/` → `tests/e2e/`
- **Uso actual:**
  - `playwright.config.ts` configura `testDir: './e2e'` y carga `dotenv.config({ path: path.resolve(__dirname, 'e2e/.env.e2e') })`.
  - `e2e/helpers/report.ts` resuelve rutas locales relativas al cwd para `.reports`.
  - `package.json` invoca `playwright test`.
- **Análisis de riesgo:**
  - Moverlo crearía una nueva carpeta de primer nivel (`tests/`), por lo que **tampoco reduce el número de carpetas en la raíz** (reemplaza `e2e/` por `tests/`).
  - No aporta ningún beneficio de aislamiento real, ya que Playwright es una suite global de caja negra.
- **Decisión:** **Mantener `e2e/` en raíz**.

---

## 3. Evaluación de Carpetas Locales y de Tooling

### A. `.vercel/`, `.engram/`, `.idea/`, `.atl/`, `node_modules/`, `test-results/`
- **Estado Git:** Ya están todas ignoradas por `.gitignore`.
- **Comportamiento de IDEs y CLI:**
  - `vercel CLI` busca `.vercel/project.json` estrictamente en la raíz del repositorio.
  - `engram MCP` (configurado en `opencode.json`) almacena el estado del proyecto en la raíz.
  - JetBrains lee `.idea/` obligatoriamente en la raíz.
  - Antigravity genera `.atl/` en la raíz.
- **Decisión:** No deben moverse. Forzarlas a `.local/` rompería el funcionamiento nativo de cada herramienta.
- **Acción de optimización:** Asegurar que estén explícitamente excluidas del indexado de agentes en `.cursorignore` y `.agentignore`.

---

## 4. Árbol Antes y Después de la Fase Final

### Árbol de Carpetas Raíz (Estructura Óptima Demostrada):
```text
MiAyudaTics_v1.0/
├── client/                       # [DOMINIO 1] Web Frontend React + Vite
├── server/                       # [DOMINIO 2] Backend API Express + MongoDB + Socket.io
├── mobile/                       # [DOMINIO 3] Mobile Expo / React Native
├── docs/                         # [DOMINIO 4] Toda la Documentación (current, history, design, specs)
├── marketing/                    # [DOMINIO 5] Toda la Suite Audiovisual (film, launch)
├── packages/                     # Monorepo Workspace Package (@miayuda/contracts)
├── scripts/                      # Automatización operativa directa
├── e2e/                          # Pruebas globales Playwright
├── .agents/                      # Customizaciones Antigravity (skills, index)
├── .cursor/                      # Cursor IDE rules y subagents
├── .github/                      # GitHub Actions workflows
├── .husky/                       # Git hooks
│
└── [Carpetas locales excluidas de indexado (.gitignore, .cursorignore, .agentignore)]
    ├── .vercel/
    ├── .engram/
    ├── .idea/
    ├── .atl/
    ├── node_modules/
    └── test-results/
```

---

## 5. Medidas de Blindaje Agéntico (Fase 6)

Para reducir al mínimo el ruido en los agentes de IA (Cursor y Antigravity) sin romper ninguna herramienta:
- Actualizar `.cursorignore` y `.agentignore` para excluir formalmente:
  ```ignore
  # Metadatos locales de herramientas y entornos
  .vercel/
  .engram/
  .idea/
  .atl/
  ```
- Con esto, **las carpetas locales quedan 100% invisibles para los indexadores de contexto**, logrando una superficie funcional limpia de solo 5 dominios y 3 carpetas de soporte técnico.

---

## 6. Conclusión y Plan de Acción
1. **No crear carpetas artificiales** como `tools/` o `tests/` que solo mueven carpetas de un lado a otro sin reducir la raíz.
2. **Blindar el indexado agéntico** excluyendo `.vercel/`, `.engram/`, `.idea/` y `.atl/` en `.cursorignore` y `.agentignore`.
3. Validar la integridad total del monorepo (`pnpm` typecheck y tests).
