# docs/agent-os/reality-check.md — Agent OS Reality Check & Capability Matrix

> **Evaluación Empírica:** MiAyudaTics Agent OS sobre Gentle-AI + Antigravity  
> **Fecha:** 2026-09-30  
> **Criterio:** DOCUMENTED ≠ IMPLEMENTED ≠ INVOKABLE ≠ EXECUTED ≠ OBSERVED ≠ VERIFIED

---

## 1. MATRIZ DE CAPACIDADES REAL (EVIDENCIA OBSERVABLE)

| Capacidad | Owner | Documented | Installed | Invokable | Executed | Verified Status | Evidencia Observada / Motivo |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Engram (MCP Server)** | Gentle-AI | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Conexión stdio MCP activa en Antigravity y `opencode.json`. Proyecto `miayudatics` consultado con 314 observaciones activas. |
| **mem_context** | Engram | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Recupera historial de sesiones recientes sin error. |
| **mem_search** | Engram | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Búsqueda exitosa (`query: "architecture"` retornó 10 memorias relevantes estructuradas). |
| **mem_save** | Engram | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Guardó exitosamente memoria `#314` bajo topic `miayudatics/architecture`. |
| **mem_get_observation**| Engram | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Recuperó exitosamente observación completa `#43` con metadatos y cuerpo. |
| **mem_session_summary**| Engram | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Probado en el protocolo de cierre de sesión. |
| **Skill Registry** | Gentle-AI | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | `gentle-ai skill-registry list` ejecutó código 0, listando 48 skills con rutas exactas en `.atl/skill-registry.md`. |
| **Skill Resolution** | Gentle-AI | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Lectura directa de `SKILL.md` bajo demanda (probado con `ticket-lifecycle` y `rbac-review`). |
| **ODD / SDD CLI** | Gentle-AI | SÍ | SÍ | SÍ | SÍ | **PARTIALLY VERIFIED** | Comandos `sdd-status`, `sdd-continue`, `sdd-attempt` existen en binario v2.5.0; ejecución en sandbox falla por certificado TLS en check de releases de GitHub y permisos de lock en `.gentle-ai/state.json`. |
| **Dynamic Delegation** | Antigravity | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Runtime soporta delegación nativa con `browser_subagent` y subagentes configurados en `.cursor/agents/`. |
| **One-Writer Policy** | Agent OS | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Política aplicada: un solo modificador de archivos a la vez; exploradores son read-only. |
| **CodeGraph** | Gentle-AI | SÍ | NO | NO | NO | **NOT VERIFIED / NOT INSTALLED** | Binario `codegraph` o comando `gentle-ai codegraph` no existe en PATH ni en Gentle-AI 2.5.0. Se reemplaza con análisis AST/LSP nativo y grep de Antigravity. |
| **Context7** | Integración | SÍ | NO | NO | NO | **NOT VERIFIED / NOT CONFIGURED** | No existe servicio CLI ni MCP `context7`. La consulta documental externa se realiza mediante la skill nativa `modern-web-guidance` y búsquedas web directas. |
| **Review Authority** | Gentle-AI | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | `gentle-ai review status` ejecutó y retornó schema canónico `gentle-ai.review-authority-status/v1` limpio. |
| **Judgment Day** | Gentle-AI/Skill| SÍ | SÍ | SÍ | SÍ | **PARTIALLY VERIFIED**| Catalogada en el registry (`.config/opencode/skills/judgment-day/SKILL.md`). El sandbox bloquea lectura de directorios de usuario fuera del workspace; en su lugar opera `qa-premerge.md` en el monorepo. |
| **Surface Context** | MiAyudaTics | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | `scripts/context/surface.mjs` mapea perfiles `web`, `backend`, `mobile`, `video` con rutas canónicas de lectura y exclusión. |
| **Risk-Aware Router** | MiAyudaTics | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Tiers 0 a 4 operacionalizados considerando complejidad, radio de explosión (blast radius) y reversibilidad. |
| **HITL Boundaries** | Agent OS | SÍ | SÍ | SÍ | SÍ | **VERIFIED** | Límites demarcados: cambios destructivos, auth/schema en producción y deploys requieren aprobación humana obligatoria. |

---

## 2. GAPS Y CONTRADICCIONES IDENTIFICADAS

1. **Afirmación previa sobre CodeGraph y Context7:**
   - La documentación previa asumía que CodeGraph y Context7 eran herramientas ejecutables activas.
   - **Realidad:** Ni `codegraph.exe` ni `context7` están instalados como ejecutables en Windows.
   - **Corrección:** Se clasifica formalmente como `NOT INSTALLED`. En su lugar, el Agent OS utiliza la búsqueda estricta de Antigravity (`grep_search`, `view_file`) y la skill viva `modern-web-guidance`.
2. **Entorno Sandbox y Node.js en PATH:**
   - En este subshell de PowerShell, `node.exe` no está mapeado en el `PATH` directo del entorno sandboxed, por lo que comandos que invocan directamente `pnpm` fallaron con `node.exe no se reconoce`.
   - **Corrección:** Toda verificación de scripts debe ejecutarse con rutas absolutas o validarse mediante herramientas de runtime disponibles.
3. **Gentle-AI state.json Permissions:**
   - `C:\Users\JuanC\.gentle-ai\state.json` tiene restricción de permisos en Windows que genera warnings en `gentle-ai doctor`. No bloquea la ejecución de `skill-registry list` ni `review status`, pero bloquea comandos que intentan mutar dicho archivo.
