# MiAyudaTICS — arquitectura IDE-agnóstica sobre Gentle-AI

**Verificado:** 2026-10-07  
**Gentle-AI:** 4.0.0 (latest según `gentle-ai update`)  
**Binario:** `C:\Users\JuanC\go\bin\gentle-ai.exe`  
**Runtime actual:** Cursor. No es una dependencia del producto.

```text
USER
  → IDE / agent runtime (adapter)
    → Gentle-AI 4.0.0
      → contexto portable de MiAyudaTICS
        → docs, contratos, skills de producto, invariantes
          → codebase
```

## Contrato de agente (cualquier runtime)

Identidad: mesa de servicios TIC del CTPI (SENA). Superficies: `client/` (web), `server/` (API), `mobile/MiAyudaTIC-Mobile/` (Expo), `packages/contracts/` (contratos compartidos). No mezclar superficies en un mismo cambio.

Roles de producto: Líder TIC, Funcionario, Técnico. No son personas de un IDE.

Seguridad: no cambiar auth, JWT, RBAC ni esquemas sin aprobación humana. No commitear secretos. No desplegar ni hacer push salvo pedido explícito.

Invariantes y estándares: `docs/contracts.md`, `docs/architecture.md`, `docs/quality-bar.md`, `docs/design-system.md`. pnpm. Sin Flutter legado.

Pruebas: typecheck y tests de la superficie tocada antes de dar por cerrado un cambio.

Estado y deuda: `docs/current/`, `docs/system-overview/`. La memoria operativa es Engram, no un almacén nuevo del repo.

Límites humanos: credenciales, producción, contratos rotos, borrado de datos, estrategia de producto ambigua.

Este contrato no nombra comandos de Cursor, OpenCode ni Antigravity.

## Capas

| Capa | Dónde vive | Ejemplos |
|---|---|---|
| Proyecto portable | repositorio | `docs/`, `AGENTS.md` (entrada), `packages/contracts/`, código |
| Gentle-AI | máquina + assets que el CLI administra | ODD/review, Engram, `.atl/skill-registry.md`, `gentle-ai sync` |
| Adapter de runtime | archivos que solo un IDE lee | `.cursor/`, `opencode.json` |

## Qué no se construye aquí

No hay un segundo Agent OS, un router de agentes, una memoria MiAyudaTICS ni un ODD propio. `docs/agent-os/routing-spec.md` describe cómo clasificar trabajo; no reemplaza `gentle-ai review`.

## Upgrade de Gentle-AI

No hay versión fijada en el código del producto. Comprobar con `gentle-ai update`. Aplicar con `gentle-ai upgrade` y repetir `gentle-ai doctor`. Tras un upgrade, `gentle-ai sync` alinea assets gestionados. El 2026-10-07 Gentle-AI ya está en 4.0.0. Engram instalado 3.1.0, latest 3.2.1: el método oficial es el mismo `gentle-ai upgrade`. No se aplicó en esta pasada.

## Prueba de independencia

Si Cursor desaparece: se pierde conveniencia del IDE (A) y el adapter `.cursor/` (A). Engram, review y el registry siguen en Gentle-AI (B) y otro runtime compatible puede volver a instalarse con `gentle-ai install`. Dominio, reglas, docs y contratos siguen en el repo (no es C/D/E). El producto en runtime (web, API, móvil) no llama a Gentle-AI.
