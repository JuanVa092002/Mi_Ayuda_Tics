# 12 — Registro de Deuda Técnica (Technical Debt Register)

> **Regla:** Solo deuda real observable en código, contratos o infraestructura. Cero opiniones personales o preferencias de framework.

---

## 1. Inventario de Deuda Técnica

| ID | Área | Problema Observable | Evidencia en Código | Impacto | Riesgo | Costo Estimado | Prioridad | Mitigación Recomendada |
|---|---|---|---|---|:---:|:---:|:---:|---|
| **TD-01** | Data / Models | Modelo legado `SolucionCaso` mantenido en paralelo con `HistorialSolicitud`. | `server/src/features/tickets/models/solucionCaso.ts` | Duplicidad conceptual de soluciones de casos antiguos. | LOW | Medio | P2 | Mantenerlo estrictamente para lectura histórica v1; no referenciarlo en nuevas features v2. |
| **TD-02** | Frontend | Web asume objetos poblados (`populate`) en respuestas de solicitud. | `client/src/pages/tecnico/CasosPorResolverTabla.tsx` | Si un ticket tiene un ambiente o usuario huérfano, la UI podría fallar con TypeError al leer `row.ambiente.nombre`. | MEDIUM | Bajo | P1 | Agregar encadenamiento opcional (`row.ambiente?.nombre ?? 'Sin ambiente'`) en todas las tablas de tickets. |
| **TD-03** | Backend | Endpoint legacy de hard-delete `DELETE /api/solicitud/:id`. | `server/src/features/tickets/routes/solicitud.ts:75` | Permite eliminación física de documentos, rompiendo la trazabilidad del historial. | MEDIUM | Bajo | P2 | Deprecar formalmente y forzar el uso de `POST /api/solicitud/:id/cancelar`. |
| **TD-04** | Realtime | Sincronización SSE en memoria local no escalable a múltiples instancias. | `server/src/shared/services/sseBroadcaster.ts` | Si el backend se escala horizontalmente en múltiples contenedores, el broadcast en memoria solo notifica a los clientes conectados a esa réplica. | HIGH | Medio | P3 | Integrar adaptador de eventos distribuidos (ej. Redis Pub/Sub ya instalado en dependencias) si se escala a más de 1 instancia. |
| **TD-05** | Mobile | Pantallas de rediseño móvil pendientes de integración con backend v2. | `mobile/MiAyudaTIC-Mobile` | La app móvil cuenta con login y auth funcional, pero sus pantallas de tickets no consumen el ciclo de vida v2 con la misma madurez que la Web. | HIGH | Alto | P1 | Conectar el cliente móvil a las rutas `/api/solicitud/:id/<acción>` con header `Idempotency-Key`. |
| **TD-06** | Database | Índice unique de `operationId` condicionado a ejecución de script manual. | `server/src/features/tickets/models/historialSolicitud.ts:107` | Si se recrea la base de datos de cero sin ejecutar `migrate:historial-operation-id`, la garantía de idempotencia a nivel índice queda ausente. | HIGH | Bajo | P2 | Incluir la verificación y creación del índice en el script de arranque o health check del servidor. |

---

## 2. Diferenciación: Deuda Real vs No-Deuda

- **Uso de Vanilla CSS / Tailwind en Web:** No es deuda; es una decisión deliberada de diseño para el stack actual.
- **Express 5 en lugar de NestJS:** No es deuda; Express 5 maneja promesas nativas y el monorepo implementa arquitectura de capas modular.
- **Vite SPA en lugar de Next.js SSR:** No es deuda; MiAyudaTics es un sistema interno de gestión que requiere autenticación estricta y sesión interactiva en tiempo real, donde SSR no aporta valor crítico de SEO.
