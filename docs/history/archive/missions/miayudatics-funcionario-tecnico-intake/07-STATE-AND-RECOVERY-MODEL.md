# 07-STATE-AND-RECOVERY-MODEL.md — Modelo de Estados, Resiliencia y Recuperación

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Matriz de Estados de Interfaz por Componente

| Estado | Funcionario (`Funcionario.tsx`) | Técnico (`CasosPorResolverTabla.tsx`) | Comportamiento Defensivo |
|---|---|---|---|
| **Loading** | `AdaptiveSkeletonDetail` + skeleton en cola | `AdaptiveSkeletonList` en tabla | Cero layout shift (CLS 0). |
| **Empty** | "Sin solicitudes registradas" + CTA Radicar | "No tienes casos asignados en este turno" | Estado positivo tranquilizador. |
| **Error** | Banner rojo con mensaje y botón "Reintentar" | InlineAlert con botón de reintento | Captura de errores con `getApiErrorMessage`. |
| **Concurrencia (409)**| Toast de conflicto y refetch automático | Abort atómico sin corrupción en DB | Preserva estado posterior de la solicitud. |
| **Timeout de Red** | Reintento en 5s en SSE | Backoff exponencial en cliente | Mantiene en memoria el estado previo. |

---

## 2. Garantías de Rollback y Compensación

Si ocurre un fallo en el servidor durante la transición de estado:
1. `solicitud-workflow.ts` detecta si el evento en `HistorialSolicitud` no pudo ser creado.
2. Dispara `compensateTicketIfEventMissing()` revirtiendo el `estado` y el número de `revision` a su valor previo.
3. Retorna HTTP 500 informando que la operación no quedó confirmada, evitando estados inconsistentes o huérfanos.
