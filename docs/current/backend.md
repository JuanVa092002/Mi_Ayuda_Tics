# Superficie Backend (API) — Perfil de Contexto Agéntico

## Propósito
Desarrollo, lógica de negocio, persistencia, autenticación RBAC, WebSockets y servicios transaccionales de MiAyudaTIC.

## Rutas que el agente DEBE leer
- `server/src/` (Controladores, modelos Prisma/Mongoose, rutas, middlewares y sockets)
- `packages/contracts/src/` (Definiciones canónicas de contratos de solicitud y roles)
- `docs/current/current-web-backend-behavior-v2.md` (Comportamiento detallado de endpoints v2 e idempotencia)
- `docs/contracts.md` (Reglas de autorización RBAC e invariantes de negocio)

## Fuente de verdad
- Comportamiento de endpoints: `docs/current/current-web-backend-behavior-v2.md`
- Contratos y Zod schemas: `packages/contracts/src/`
- Guardrail Cursor: `.cursor/rules/70-platform-scope.mdc`
- Subagente: `.cursor/agents/product-engineer-platform.md`

## Comandos de validación
```bash
pnpm -C server run typecheck
pnpm -C server run test
pnpm -C server run build
```

## Rutas que DEBE excluir
- `client/` (Frontend React)
- `mobile/` (Frontend Expo)
- `marketing/` (Piezas audiovisuales)
- `docs/history/` (Histórico cerrado)

## Riesgos y archivos protegidos
- **Archivos protegidos:** `server/src/shared/middleware/auth.ts`, `server/src/shared/middleware/checkRol.ts`, esquemas de base de datos.
- **Prohibiciones:** HITL obligatorio para cambios de JWT, schemas y variables de entorno de producción. Jamás ejecutar `DELETE` sobre colecciones de tickets en producción.
