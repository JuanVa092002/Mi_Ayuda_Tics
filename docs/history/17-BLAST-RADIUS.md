# 17 — Matriz de Blast Radius y Riesgo de Cambios (Blast Radius Matrix)

> **Uso Obligatorio:** Antes de modificar un archivo o módulo, consulta esta matriz para conocer el impacto cruzado y las pruebas requeridas.

---

| Módulo / Archivo | Nivel de Riesgo | Áreas Afectadas | Consecuencia Potencial de un Fallo | Suites de Verificación Obligatorias |
|---|:---:|---|---|---|
| `packages/contracts/src/*` | `CRITICAL` | Backend, Frontend Web, Mobile | Errores de compilación TypeScript monorepo, desalineación de contratos API, payloads corruptos. | `pnpm -C packages/contracts run build`, `pnpm --filter server typecheck`, `pnpm --filter client typecheck` |
| `server/src/shared/middleware/session.ts` | `CRITICAL` | Toda la API autenticada | Bloqueo masivo de usuarios (401), caída de sesiones en web o mobile, vulnerabilidad de bypass de auth. | `auth.test.ts`, `extractAuthToken.test.ts`, `qa-matrix-rbac-isolation.test.ts` |
| `server/src/features/tickets/domain/solicitud-lifecycle.ts` | `CRITICAL` | Toda la gestión de casos, ambos clientes | Inconsistencia en la máquina de estados, tickets atrapados en limbo, transiciones ilegales. | `solicitud-lifecycle.test.ts`, `solicitud-workflow.test.ts`, `ticket-lifecycle.test.ts` |
| `server/src/features/tickets/domain/solicitud-workflow.ts` | `CRITICAL` | Mutaciones de tickets, transacciones | Pérdida de atomicidad, eventos huérfanos, desincronización de revisiones y bloqueos en MongoDB. | `solicitud-workflow.test.ts`, `workflow-atomicity.test.ts`, `workflow-idempotency.test.ts` |
| `server/src/features/tickets/models/solicitud.ts` | `HIGH` | Persistencia de tickets, agregaciones | Desajuste de índices, degradación severa de consultas estadísticas, fallos de esquema. | `solicitud.test.ts`, `mongo-duplicate.test.ts`, `consecutivoCaso.retry.test.ts` |
| `server/src/shared/services/sseBroadcaster.ts` | `HIGH` | Realtime de todos los roles | Pérdida de sincronización en vivo, fugas de memoria por clientes desconectados, caídas de stream. | `cors.test.ts`, `useNotificaciones.ts` (test cliente) |
| `client/src/features/auth/*` | `HIGH` | Acceso a la plataforma web | Pantalla en blanco en login, fallos de refresco de sesión o bucles infinitos de redirección. | `auth-context.bootstrap.test.ts`, `auth.verify-token.test.ts`, `private.routes.test.tsx` |
| `client/src/pages/admin/AdminSolicitud.tsx` | `MEDIUM` | Consola del Líder TIC | Imposibilidad de asignar o reasignar casos, bloqueos visuales en el drawer de triage. | `role-workspaces.test.tsx`, `role-convergence-antiduplicity.test.tsx` |
| `client/src/pages/tecnico/CasosPorResolverTabla.tsx` | `MEDIUM` | Trabajo diario de técnicos | Imposibilidad de iniciar atención o abrir el modal de intervenciones. | `frontier-vertical-slices.test.tsx`, `casos-resueltos-audit.test.tsx` |
| `server/src/features/shared/controllers/ambienteFormacion.ts` | `LOW` | Configuración de aulas | Fallo al listar o crear ambientes; no altera el flujo de tickets existentes. | `logic.test.ts` |
