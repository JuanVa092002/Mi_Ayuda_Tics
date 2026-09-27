# MiAyudaTICS — Project Index

## Workspace activo

Este repositorio es el monorepo activo de MiAyudaTICS.

## Superficies

| Superficie | Ruta | Cuándo leerla |
|---|---|---|
| Web | `client/` | Cambios de frontend |
| API | `server/` | Cambios de backend, sockets o persistencia |
| Contratos | `packages/contracts/` | Cambios de DTOs, Zod o integración client/server |
| Mobile | `mobile/MiAyudaTIC-Mobile/` | Cambios de Expo/React Native |
| Video | `video/` | Cambios del showcase Remotion |
| Marketing | `marketing/` | Cambios de Hyperframes o piezas de lanzamiento |
| E2E | `e2e/` | Cambios de pruebas end-to-end |
| Scripts | `scripts/` | Automatización y validaciones |

## Fuentes de verdad

- Producto: `docs/product.md`
- Arquitectura: `docs/architecture.md`
- Contratos: `packages/contracts/` y `docs/contracts.md`
- Estado mobile: `docs/current/current-mobile-agent-context.md`
- Estado backend: `docs/current/current-web-backend-behavior-v2.md`
- Reglas generales: `AGENTS.md`
- Reglas específicas de Cursor: `.cursor/rules/`
- Skills bajo demanda: `.agents/skills/`

## Regla de alcance

Leer solo la superficie necesaria para la tarea.
No indexar ni explorar por defecto:

- `docs/history/`
- `marketing/**/out/`
- `video/out/`
- `node_modules/`
- `server/storage/`
- `*.mp4`
- `*.fig`
- `*.zip`

## Protocolo de inicio

Antes de editar:

1. Identificar la superficie afectada.
2. Leer la regla específica aplicable.
3. Leer la fuente de verdad correspondiente.
4. Inspeccionar el estado Git.
5. Definir archivos permitidos.
6. Ejecutar cambios mínimos.
7. Validar únicamente la superficie afectada.

## Seguridad

- No mostrar secretos.
- No leer valores de `.env`.
- No hacer deploy sin autorización.
- No hacer migraciones destructivas.
- No modificar archivos fuera del alcance.
- No ejecutar comandos destructivos sin confirmación.

## Regla de contexto

No leer todo el repositorio.
No cargar skills multimedia salvo que la tarea sea de video, audio o motion.
