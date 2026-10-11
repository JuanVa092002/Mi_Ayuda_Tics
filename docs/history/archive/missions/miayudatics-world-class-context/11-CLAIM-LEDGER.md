# 11-CLAIM-LEDGER.md — Ledger de Verificación de Capacidades y Claims

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Clasificación Exhaustiva de Claims de Producto

| Capacidad / Claim | Estado de Verificación | Evidencia Técnica |
|---|:---:|---|
| **Case Journey de 4 etapas para Funcionario** | `IMPLEMENTED_AND_CODE_VERIFIED` | `FuncionarioCaseDetail.tsx:148-268` (Radicación -> Asignación -> En Atención -> Solucionado). |
| **Stepper con Historial en vivo sincronizado** | `IMPLEMENTED_AND_CODE_VERIFIED` | `FuncionarioCaseDetail.tsx:58-98` y evento SSE `ticket:updated`. |
| **Trazabilidad append-only sin borrado de eventos** | `TEST_VERIFIED` | `solicitud-workflow.ts:540-575` y `solicitud-lifecycle.test.ts`. |
| **Ordenamiento de cola por Urgencia de aula** | `IMPLEMENTED_AND_CODE_VERIFIED` | `CasosPorResolverTabla.tsx:168-201` (Clase en Vivo score 12). |
| **Filtro de Ruta Física agrupado por Ambiente** | `IMPLEMENTED_AND_CODE_VERIFIED` | `CasosPorResolverTabla.tsx:156-166` (Orden alfabético por ambiente). |
| **Desduplicación de ubicación (Ambiente/Oficina/Puesto)** | `IMPLEMENTED_AND_CODE_VERIFIED` | `ticketContext.ts` y Bento Grid en `IncidentHeaderABVariants.tsx`. |
| **Badge contextual por rol ("Espera de usuario" vs "En espera de ti")** | `IMPLEMENTED_AND_CODE_VERIFIED` | `StatusBadge.tsx:37-39`. |
| **Reintento con idempotencia en transiciones técnicas** | `TEST_VERIFIED` | `workflow-idempotency.test.ts` y cabeceras `operationId`. |
| **Despacho en 1 Clic para Líder TIC** | `TEST_VERIFIED` | `AdminSolicitud.tsx` y `frontier-vertical-slices.test.tsx`. |
| **Notificaciones en tiempo real vía SSE** | `IMPLEMENTED_AND_CODE_VERIFIED` | `sseBroadcaster.ts` y `useNotificaciones.ts:43-100`. |
| **Carga de evidencia fotográfica** | `TEST_VERIFIED` | `solicitud.ts:265-275` y `media-access.test.ts`. |
| **Visto bueno final y cierre formal por el funcionario** | `TEST_VERIFIED` | `Funcionario.tsx:148-182` y `solicitud-workflow.ts:350-390`. |
| **Chat interactivo sincrónico dentro del ticket** | `NOT_SUPPORTED_BY_DATA` | No existe socket chat; el canal formal es preguntas y respuestas estructuradas en el historial. |
| **Geolocalización GPS en tiempo real de técnicos** | `NOT_SUPPORTED_BY_DATA` | No existe GPS; el seguimiento se basa en ambiente físico declarado en la solicitud. |
| **Soporte offline completo con PWA Service Worker** | `NOT_SUPPORTED` | El cliente no tiene service worker offline activo; requiere conexión HTTP/SSE. |
