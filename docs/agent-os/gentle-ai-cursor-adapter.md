# Adapter Cursor

Cursor es el runtime actual. Estos archivos no son la arquitectura de MiAyudaTICS.

| Ruta | Qué aporta | Quién lo posee | ¿Editar a mano? |
|---|---|---|---|
| `.cursor/rules/` | Guardrails de alcance web, móvil, plataforma | Proyecto, pero solo los lee Cursor | Sí, como adapter. El contrato portable está en `docs/` |
| `.cursor/agents/` | Subagentes de este IDE | Adapter | No copiarlos a otro IDE. El rol de producto está en `docs/agents.md` |
| `.cursor/skills/` | Skills de producto (ticket, RBAC, diseño, release) | Conocimiento de producto atrapado en el adapter | Deben poder vivir donde Gentle-AI registre skills. Hoy el registry es `.atl/skill-registry.md` |
| `.cursor/hooks.json` | Lint, contratos, comandos peligrosos | Adapter | No son invariantes del producto |
| `AGENTS.md` | Entrada que varios IDEs leen | Portable, con restos de layout Cursor | La primera sección apunta al contrato portable |
| `opencode.json` | MCP Engram + Stitch para OpenCode | Adapter OpenCode, generado/ajustado para ese runtime | No es fuente de dominio. Rutas absolutas de Windows |
| `.atl/` | Registry de Gentle-AI | Gestionado por `gentle-ai skill-registry refresh` | No editar como si fuera docs de producto |

## Lo que Cursor no debe poseer

Dominio, RBAC, contratos, estrategia de pruebas y memoria. Esos están en `docs/`, `packages/contracts/` y Engram.

## Acoplamiento que sigue

Las skills de producto están bajo `.cursor/skills/`. Un runtime que no lee `.cursor/` no las carga hasta que `gentle-ai sync` o el registry las publique. No se duplicaron a mano en esta pasada: el registry ya es la autoridad de Gentle-AI.

`opencode.json` fija `C:\Users\JuanC\go\bin\engram.exe`. Eso es adapter de máquina, no del producto.

## Portabilidad

| Prueba | Resultado |
|---|---|
| Cursor + Gentle-AI | Doctor ok para Cursor y Engram. Review limpio en este repo |
| OpenCode | Binario presente, duplicado en PATH. `opencode.json` apunta a Engram |
| Antigravity | No instalado en este doctor |
| Runtime nuevo que solo lee el repo + Gentle-AI | Puede leer `docs/`, `AGENTS.md` y el contrato de esta carpeta. Engram requiere el CLI. CodeGraph no está. Las skills bajo `.cursor/skills/` no se descubren solas |

## Skills: infraestructura vs producto

Infraestructura (Gentle-AI, fuera del producto): review, Engram, skill-creator, skill-improver, registry.  
Producto (hoy en `.cursor/skills/`): `ticket-lifecycle`, `rbac-review`, `mobile-field-ux`, `design-system`, `release-readiness`, `docs-handoff`.
