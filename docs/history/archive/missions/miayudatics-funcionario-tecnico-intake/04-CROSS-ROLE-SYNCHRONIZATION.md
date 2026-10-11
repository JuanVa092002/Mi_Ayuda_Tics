# 04-CROSS-ROLE-SYNCHRONIZATION.md — Auditoría de Sincronización Funcionario ↔ Técnico

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Mapa Exhaustivo de Eventos Cruzados

| Evento | Creado Por | Persistencia en DB | Visión del Técnico | Visión del Funcionario | Visibilidad Correcta | Mecanismo de Refresco |
|---|---|---|---|---|:---:|:---:|
| **`created`** | Funcionario | `HistorialSolicitud` (append-only) | Aparece tras asignación del líder | Banner gris "Recepción & Programación" | ✅ Sí | HTTP inicial + SSE |
| **`assigned`** | Líder TIC | `HistorialSolicitud` | Caso entra a su cola de trabajo | Ficha de Especialista (nombre/celular) | ✅ Sí | `ticket:updated` (SSE) |
| **`started`** | Técnico | `HistorialSolicitud` | Caso pasa a Score 5 (en progreso) | Hero Banner cambia a azul activo | ✅ Sí | `ticket:updated` (SSE) |
| **`note_added`** | Técnico | `HistorialSolicitud` | Visible en bitácora del caso | Visible en Drawer de Historial | ✅ Sí | `ticket:updated` (SSE) |
| **`waiting_for_requester`**| Técnico | `HistorialSolicitud` | Badge: *"Espera de usuario"* | Hero Banner ámbar con input de respuesta | ✅ Sí | `ticket:updated` (SSE) |
| **`requester_reply`** | Funcionario | `HistorialSolicitud` | Toast + Caso reactivado en cola | Toast de confirmación de envío | ✅ Sí | `ticket:updated` (SSE) |
| **`resolved`** | Técnico | `HistorialSolicitud` | Modal se cierra; caso desaparece de cola | Hero Banner esmeralda "Dar visto bueno" | ✅ Sí | `ticket:updated` (SSE) |
| **`closed`** | Funcionario | `HistorialSolicitud` | Registro archivado formalmente | Caso completado con visto bueno registrado | ✅ Sí | `ticket:updated` (SSE) |

---

## 2. Clasificación del Mecanismo de Frescura Real
- **Mecanismo:** `REALTIME_SSE` combinado con `SSE_REFETCH`.
- **Funcionamiento Empírico:**
  1. Backend ejecuta mutación transaccional en `solicitud-workflow.ts`.
  2. Invoca `sseBroadcaster.broadcastToUser()` o `broadcastToUsers()`.
  3. El cliente [`useNotificaciones.ts`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/features/notifications/hooks/useNotificaciones.ts) escucha el stream `/api/notificaciones/stream` y despacha `window.dispatchEvent(new CustomEvent('ticket:updated'))`.
  4. Los componentes activos (`Funcionario.tsx`, `CasosPorResolverTabla.tsx`, `FuncionarioCaseDetail.tsx`) ejecutan refetch sin recargar página completa.
- **Riesgo:** Si la conexión SSE se interrumpe (Wi-Fi inestable), el cliente ejecuta backoff a 5 segundos pero no presenta un indicador visual de desconexión en pantalla.
