# Matriz de capacidades Gentle-AI

**Fecha:** 2026-10-07  
**Comandos:** `gentle-ai version`, `gentle-ai doctor`, `gentle-ai update`, `gentle-ai review status`, `gentle-ai review mode status`.

| Capacidad | Estado | Evidencia |
|---|---|---|
| Gentle-AI CLI 4.0.0 | WORKING | `version` y `update`: installed = latest |
| Doctor | WORKING, degraded | 7 ok, 1 warning: dos binarios `opencode` en PATH |
| Engram | WORKING, versión atrás | Doctor: handshake MCP. Instalada 3.1.0, latest 3.2.1 |
| ODD / review compact-v2 | CONFIGURED | `review status` clean. `review mode`: on por defecto |
| Skill registry | INSTALLED | `.atl/skill-registry.md` presente. Lo administra `gentle-ai skill-registry refresh` |
| OpenCode | PARTIAL | Doctor lo encuentra; hay copia duplicada en npm y en `.gentle-ai/bin` |
| Cursor agent | INSTALLED | `state:json`: agents `cursor`, `opencode` |
| gga | PARTIAL | Doctor ok en `C:\Users\JuanC\bin\gga.bat`. `update` no lee versión instalada |
| Context7 | AVAILABLE vía MCP del runtime | No es dependencia del producto. El repo no debe copiar docs de librerías |
| CodeGraph | UNAVAILABLE | No hay binario en PATH. El producto no lo necesita para ejecutarse |
| Judgment Day | SUPPORTED BY GENTLE-AI, NOT AVAILABLE como comando de este CLI | No hay subcomando `judgment`. No se reimplementa en el repo |
| RDD | CONFIGURED como review | `receipt-driven development: on`. No hay un RDD falso en el código |
| Delegación | SUPPORTED BY GENTLE-AI | No hay worker manager en el producto. Los subagentes de `.cursor/agents/` son adapter |
| Personas de producto | PROJECT | Roles Líder / Funcionario / Técnico en docs, no en el CLI |
| Snapshots | AVAILABLE | `gentle-ai restore` existe. No se ejecutó |
| Telemetría | AVAILABLE | `gentle-ai telemetry`. No se cambió |
| Antigravity | NOT AVAILABLE IN CURRENT RUNTIME | No hay config de Antigravity en el repo ni en el doctor |
| Codex / Claude Code | NOT AVAILABLE IN CURRENT RUNTIME | No aparecen en `state:json` |

## Separación de conocimiento

| Tipo | Fuente |
|---|---|
| Terceros (React, Express, Expo) | Context7 cuando el runtime lo tenga |
| Proyecto | `docs/`, contratos, código |
| Memoria operativa | Engram (`engram` MCP, proyecto `miayudatics` en el adapter OpenCode) |
