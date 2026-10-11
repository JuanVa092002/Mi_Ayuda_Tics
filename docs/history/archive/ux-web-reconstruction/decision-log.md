# MiAyudaTICS — Decision Log

| ID | Fecha | Contexto / Problema | Alternativas evaluadas | Decisión tomada | Justificación técnica |
|---|---|---|---|---|---|
| D0.1 | 2026-09-26 | Ubicación de archivos de control de ejecución del agente | 1. Raíz del workspace<br>2. `docs/agent-run/` | Usar `docs/agent-run/` | Mantiene la raíz completamente limpia y centraliza la auditoría en la documentación técnica versionable. |
| D1.1 | 2026-09-26 | Commit A de Gobernanza | 1. Agrupar todo en 1 commit masivo<br>2. Separar gobernanza e índices primero | Commit A aislado (`a862f37`) | Permite blindar reglas de indexación de Cursor/agentes antes de introducir cualquier código o skill. |
| D3.1 | 2026-09-26 | Versionado de `.agents/skills/` | 1. Ignorar en Git y depender de red<br>2. Versionar completo con `skills-lock.json` | Versionar completo en Commit B | La reinstalación desde GitHub de HeyGen no está fijada a un commit y puede romper reproducibilidad; el lockfile y fuentes aseguran independencia total. |
| D5.1 | 2026-09-26 | Preservación de `packages/`, `scripts/` y `e2e/` en raíz | 1. Mover a subcarpeta `.workspace/`<br>2. Mantener en raíz como excepciones técnicas | Mantener en raíz | `packages/contracts` es miembro de `pnpm-workspace.yaml`; `scripts/` son invocados por `package.json`; `e2e/` es referenciado por `playwright.config.ts`. Moverlos añadiría alias frágiles y rompería CI. |
| D5.2 | 2026-09-26 | Consolidación de `video/` en `marketing/product-film/` | 1. Mantener `video/` separado en raíz<br>2. Integrarlo a `marketing/` | Mover a `marketing/product-film/` | Video es un showcase del producto y encaja naturalmente dentro de la suite de marketing audiovisual, reduciendo una carpeta raíz más. |
