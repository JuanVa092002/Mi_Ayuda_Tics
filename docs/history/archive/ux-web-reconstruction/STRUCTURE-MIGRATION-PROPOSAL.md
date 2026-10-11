# MiAyudaTICS — Propuesta Integral de Migración Estructural hacia Dominios Mínimos

**Fecha:** 2026-09-26
**Workspace:** `./` (MiAyudaTics_v1.0 monorepo root)
**Branch:** `chore/measured-production-system`
**HEAD:** `b81d1fd`
**Estado:** Propuesta exhaustiva (Fase 4 completada - previa a ejecución)

---

## 1. Árbol Actual de la Raíz

Actualmente la raíz contiene **23 directorios** y **19 archivos**:

```text
MiAyudaTics_v1.0/
├── .agents/                      # 937 archivos (Customizaciones Antigravity/ATL, PROJECT-INDEX, skills)
├── .atl/                         # 2 archivos (Cache local Antigravity, gitignored)
├── .cursor/                      # 27 archivos (Reglas .mdc, subagentes, settings, hooks de Cursor)
├── .engram/                      # 4 archivos (Memoria local Engram SQLite, gitignored)
├── .github/                      # 2 archivos (CI workflows de GitHub Actions)
├── .husky/                       # 20 archivos (Git hooks pre-commit, commit-msg)
├── .idea/                        # 9 archivos (Configuración local JetBrains, gitignored)
├── .vercel/                      # 1 archivo (Project ID de despliegue Vercel, gitignored)
├── archive/                      # 66 archivos (Histórico consolidado en Fase A: baseline, case-study, incidents, handoffs, context-v1)
├── client/                       # 278 archivos (Frontend React + Vite de producción)
├── context/                      # 2 archivos (Contexto activo: current-mobile-agent-context.md, current-web-backend-behavior-v2.md)
├── design/                       # 11 archivos (Figma specs de onboarding y tokens de diseño)
├── docs/                         # 31 archivos (Documentación viva, arquitectura, producto, agent-run/)
├── e2e/                          # 12 archivos (Playwright tests end-to-end)
├── marketing/                    # 462 archivos (Piezas de lanzamiento: hyperframes y remotion vertical)
├── mobile/                       # 41.789 archivos (App móvil Expo / React Native)
├── node_modules/                 # Dependencias pnpm
├── openspec/                     # 7 archivos (Especificaciones SDD y configuraciones)
├── packages/                     # 20 archivos (Workspace member: packages/contracts)
├── scripts/                      # 4 archivos (Scripts bash para smoke tests, keepalive y e2e)
├── server/                       # 477 archivos (Backend API Express + Prisma + Socket.io)
├── test-results/                 # 1 archivo (Resultados locales de Playwright, gitignored)
└── video/                        # 355 archivos (Showcase de producto Remotion 16:9 y assets)
```

Archivos raíz: `.agentignore`, `.cursorignore`, `.gitignore`, `.npmrc`, `.prettierignore`, `.prettierrc`, `AGENTS.md`, `CHANGELOG.md`, `commitlint.config.js`, `llms.txt`, `opencode.json`, `package.json`, `playwright.config.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `PROJECT_SIGNAL_REPORT.md`, `README.md`, `RELEASE_NOTES.md`, `skills-lock.json`.

---

## 2. Árbol Objetivo Conceptual

Consolidación en los **5 dominios funcionales y de producto**, manteniendo únicamente las excepciones técnicas estrictamente requeridas por el tooling:

```text
MiAyudaTics_v1.0/
├── client/                       # [DOMINIO 1] Web Frontend React + Vite
├── server/                       # [DOMINIO 2] Backend API Express + MongoDB + Socket.io
├── mobile/                       # [DOMINIO 3] Mobile Expo / React Native
├── docs/                         # [DOMINIO 4] Toda la Documentación (viva, histórica, diseño, specs)
│   ├── current/                  # Estado vivo (antiguo context/: mobile.md, web-backend.md)
│   ├── history/                  # Memoria histórica (antiguo archive/)
│   ├── design/                   # Especificaciones de diseño y figma (antiguo design/)
│   ├── specs/                    # Especificaciones SDD (antiguo openspec/)
│   ├── product/                  # Producto, ICP y visión
│   ├── architecture/             # Arquitectura y contratos
│   ├── runbooks/                 # Procedimientos y guías operativas
│   └── agent-run/                # Logs y control de ejecución de agentes
├── marketing/                    # [DOMINIO 5] Toda la Suite Audiovisual y de Lanzamiento
│   ├── hyperframes-launch/       # Animaciones de lanzamiento
│   ├── remotion-launch/          # Video vertical / social
│   └── product-film/             # Showcase 16:9 de producto (antiguo video/)
│
│── [EXCEPCIONES TÉCNICAS DE MONOREPO & TOOLING (Conservadas)]
├── packages/                     # packages/contracts (pnpm workspace member obligatorio)
├── scripts/                      # Automatización bash referenciada en root package.json
├── e2e/                          # Pruebas Playwright referenciadas en playwright.config.ts y CI
├── .github/                      # GitHub Actions workflows
├── .husky/                       # Git hooks
├── .cursor/                      # Cursor IDE rules, subagents, settings
├── .agents/                      # Antigravity/ATL workspace customizations root
├── .vercel/, .engram/, .idea/    # Metadatos locales gitignored
├── node_modules/, test-results/  # Entorno y outputs gitignored
└── Archivos raíz obligatorios    # package.json, pnpm-workspace.yaml, AGENTS.md, etc.
```

---

## 3. Matriz Carpeta por Carpeta

| Carpeta Origen | Destino Propuesto | Motivo | Referencias Analizadas | Riesgo | Validación | Rollback |
|---|---|---|---|---|---|---|
| `context/` | `docs/current/` | Unificar el estado activo de superficies bajo el dominio documental | `AGENTS.md`, `.agents/PROJECT-INDEX.md`, `llms.txt`, `PROJECT_SIGNAL_REPORT.md` | Muy bajo | `grep_search` para enlaces rotos | `git mv docs/current context` |
| `archive/` | `docs/history/` | Centralizar el histórico cerrado en la documentación sin contaminar la raíz | `AGENTS.md`, `.agents/PROJECT-INDEX.md`, `README.md`, `PROJECT_SIGNAL_REPORT.md`, `.cursor/rules/00-founder-os.mdc` | Muy bajo | `grep_search` para enlaces rotos | `git mv docs/history archive` |
| `design/` | `docs/design/` | Centralizar especificaciones UI/Figma dentro de docs | `.cursor/rules/40-design-system.mdc` | Nulo (assets estáticos) | Verificación de paths en reglas | `git mv docs/design design` |
| `openspec/` | `docs/specs/` | Documentación SDD de diseño e invariantes | `opencode.json` (solo context metadata) | Nulo (especificaciones markdown) | Comprobación de lectura | `git mv docs/specs openspec` |
| `video/` | `marketing/product-film/` | Agrupar todo el material audiovisual bajo el dominio `marketing/` | `.agents/PROJECT-INDEX.md`, `.gitignore` | Bajo (requiere ajustar scripts en package.json y tsconfig) | `pnpm -C marketing/product-film run build --help` o typecheck | `git mv marketing/product-film video` |
| `packages/` | **Permanecer en raíz (`packages/`)** | Es miembro obligatorio de `pnpm-workspace.yaml` (`packages/contracts`) y paquete `@miayuda/contracts` importado por el backend | `pnpm-workspace.yaml`, `.github/workflows/ci.yml`, `server/package.json` | **Alto** si se mueve; rompería resolución de dependencias | CI y `pnpm -C packages/contracts run build` | N/A (se mantiene) |
| `scripts/` | **Permanecer en raíz (`scripts/`)** | Scripts bash invocados por `package.json` (`smoke:prod`, `e2e:ticket`, `smoke:mobile-api`) y CI | `package.json`, `.github/workflows/ci.yml` | Medio si se mueve; rompería comandos directos de desarrollador | Ejecución de scripts | N/A (se mantiene) |
| `e2e/` | **Permanecer en raíz (`e2e/`)** | `playwright.config.ts` busca `testDir: './e2e'` directamente desde la raíz | `playwright.config.ts`, `package.json` | Medio; moverlo requeriría reconfigurar Playwright | Playwright test | N/A (se mantiene) |

---

## 4. Excepciones Obligatorias de Raíz

Las siguientes carpetas **NO se mueven a subcarpetas** porque romperían estándares de la industria y tooling:
1. **`.agents/`**: Estándar canónico de Antigravity (Workspace Customizations Root). Requiere estar en `<repo-root>/.agents/`.
2. **`.cursor/`**: Estándar obligatorio de Cursor IDE para reglas `.cursor/rules/` y subagentes `.cursor/agents/`.
3. **`.github/`**: Exigencia inamovible de GitHub Actions para flujos de integración continua en `.github/workflows/`.
4. **`.husky/`**: Hook runner estándar de Git (`core.hooksPath` o script de preparación).
5. **`packages/`**: Convención universal de monorepos pnpm/yarn/npm workspaces.
6. **`scripts/`**: Automatización operativa de primer nivel.
7. **`e2e/`**: Suites de integración de caja negra de la aplicación completa.
8. **`.vercel/`, `.engram/`, `.idea/`, `.atl/`**: Carpetas locales o de IDEs ignoradas en Git.

---

## 5. Carpetas que Deben Permanecer Separadas

- `packages/` **no debe fusionarse** con `scripts/` ni moverse a `.workspace/`. La separación clara entre código compartido versionado (`packages/contracts`) y automatización en shell (`scripts/`) previene confusiones arquitectónicas.
- `e2e/` **no debe meterse en `client/`**, ya que prueba el sistema completo en vivo (Frontend en Vercel + Backend en Render + Base de Datos).

---

## 6. Carpetas que Pueden Consolidarse de Inmediato

1. **Documentación (`context/`, `archive/`, `design/`, `openspec/`):**
   - Pueden consolidarse de forma inmediata y 100% segura dentro de `docs/` (`docs/current/`, `docs/history/`, `docs/design/`, `docs/specs/`).
   - Cero impacto en código funcional.
   - Solo requiere actualización de enlaces y referencias en `AGENTS.md`, `.agents/PROJECT-INDEX.md`, `README.md` y `llms.txt`.
2. **Video (`video/` -> `marketing/product-film/`):**
   - Proyecto autónomo de Remotion que encaja naturalmente en `marketing/`.
   - Se actualizan las referencias de paths y `.gitignore`.

---

## 7. Ahorro Estimado de Contexto

- **Reducción de directorios de primer nivel:** De **23 carpetas a 18** (reducción neta de 5 carpetas en la raíz).
- **Dominios conceptuales limpios:** Se reduce la carga cognitiva a 5 dominios evidentes (`client/`, `server/`, `mobile/`, `docs/`, `marketing/`).
- **Navegación agéntica:** Un agente que ingrese a buscar documentación o contexto no se dispersará entre `context/`, `archive/`, `design/`, `openspec/` y `docs/`; todo reside dentro del árbol de `docs/`.

---

## 8. Impacto en la Experiencia de Desarrollo (DX Humana)

- La raíz deja de parecer un "cajón de sastre" desorganizado.
- Estructura limpia y predecible: cualquier desarrollador nuevo entiende de inmediato qué contiene cada una de las 5 carpetas principales.
- Se respetan todos los comandos existentes en `package.json` (`pnpm dev`, `pnpm run smoke:prod`, `pnpm test:e2e`).

---

## 9. Impacto en la Experiencia Agéntica (DX Agéntica)

- Los indexadores de Cursor y Antigravity procesan una jerarquía mucho más jerárquica y delimitada.
- `.agents/PROJECT-INDEX.md` y `AGENTS.md` se simplifican drásticamente, disminuyendo el consumo de tokens en prompts iniciales.
- El blindaje de exclusiones (`.agentignore`, `.cursorignore`) es más fácil de mantener con dominios agrupados.

---

## 10. Cambios que NO Deben Hacerse

- **NO** mover `packages/contracts` a `.workspace/contracts`. Rompería `pnpm-workspace.yaml`, Dockerfiles, Vercel build configs y los imports de TypeScript.
- **NO** mover `.github/`, `.husky/`, `.cursor/` ni `.agents/` a subcarpetas.
- **NO** modificar código funcional dentro de `client/src/`, `server/src/`, `mobile/MiAyudaTIC-Mobile/src/` ni `packages/contracts/src/`.
- **NO** hacer `git push`.
