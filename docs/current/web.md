# Superficie Web — Perfil de Contexto Agéntico

## Propósito
Desarrollo, mantenimiento y evolución de la interfaz web institucional de MiAyudaTIC para usuarios administrativos (líderes de soporte y funcionarios).

## Rutas que el agente DEBE leer
- `client/src/` (Componentes, páginas, hooks, servicios y contextos)
- `packages/contracts/src/` (DTOs, contratos Zod e interfaces compartidas)
- `docs/product/PRODUCT_OVERVIEW.md` (ICP, flujos y objetivos de usuario)
- `docs/design-system.md` (Tokens `#04324d`, `#39a900` y estilos de componentes)

## Fuente de verdad
- UI/UX & Tokens: `docs/design-system.md` y `client/src/index.css`
- Contratos de datos: `packages/contracts/src/`
- Guardrail Cursor: `.cursor/rules/60-web-scope.mdc`
- Subagente: `.cursor/agents/product-engineer-web.md`

## Comandos de validación
```bash
pnpm -C client run typecheck
pnpm -C client run test
pnpm -C client run build
```

## Rutas que DEBE excluir
- `server/` (No mezclar cambios web con backend en el mismo workstream)
- `mobile/` (No tocar la aplicación móvil en tareas de frontend web)
- `docs/history/` (Histórico cerrado)
- `marketing/` (Activos y piezas audiovisuales)

## Riesgos y archivos protegidos
- **Archivos protegidos:** `client/src/shared/utils/axios.ts` (Interceptor de auth e invariantes de token), `packages/contracts/` (requiere sincronización multiplataforma).
- **Prohibiciones:** No hardcodear endpoints; usar siempre `import.meta.env.VITE_BACKEND_URL`. No usar colores ad-hoc fuera de los tokens SENA.
