# 04-REQUEST-LIFECYCLE.md — Ciclo de Vida Formal del Requerimiento

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Diagrama de Estados Reales en Base de Datos

```text
               ┌───────────┐
               │   NUEVO   │ ◄── Radicado por Funcionario (POST /api/solicitud)
               └─────┬─────┘
                     │  (Líder TIC asigna especialista)
                     ▼
               ┌───────────┐
               │ ASIGNADO  │ ◄── Técnico notificado en cola de campo
               └─────┬─────┘
                     │  (Técnico llega a sitio y presiona "Iniciar Atención")
                     ▼
               ┌─────────────┐
        ┌─────►│ EN PROGRESO │ ◄── Bitácora y pruebas en sitio
        │      └──────┬──────┘
        │             │
(Funcionario responde)│ (Técnico solicita información o acceso)
        │             ▼
        │      ┌──────────────────┐
        └──────┤ ESPERANDO USUARIO│ ◄── Caso pausado; esperando aclaración
               └──────────────────┘
                     │
                     │  (Técnico concluye y formaliza "Solución Total")
                     ▼
               ┌───────────┐
               │ RESUELTO  │ ◄── Solución registrada; notificado funcionario
               └─────┬─────┘
                     │  (Funcionario valida y otorga "Visto Bueno")
                     ▼
               ┌───────────┐
               │  CERRADO  │ ◄── Fin del ciclo de vida formal
               └───────────┘
```

---

## 2. Event Sourcing Inmutable (`HistorialSolicitud`)

Cada transición de estado genera un documento independiente e inalterable en la colección `HistorialSolicitud`:

| Tipo de Evento (`type`) | Actor | Mensaje de Negocio | Metadatos Persistidos |
|---|---|---|---|
| `created` | Funcionario | "Solicitud radicada en Mesa de Ayuda TIC" | `nextStatus: 'nuevo'` |
| `assigned` | Líder TIC | "Especialista asignado al caso" | `tecnico: ObjectId` |
| `started` | Técnico | "Atención técnica iniciada en sitio" | `nextStatus: 'en_progreso'` |
| `note_added` | Técnico | "Nota técnica registrada en bitácora" | Mensaje técnico de avance |
| `waiting_for_requester` | Técnico | "Esperando información del solicitante" | Pregunta o requerimiento |
| `requester_reply` | Funcionario | "Respuesta entregada por el solicitante" | Aclaración del usuario |
| `resolved` | Técnico | "Solución técnica aplicada al equipo" | Causa y qué se hizo |
| `closed` | Funcionario | "Visto bueno otorgado por el solicitante" | Confirmación de cierre |
| `cancelled` | Líder TIC | "Solicitud cancelada" | Motivo obligatorio de rechazo |

---

## 3. Garantías de Consistencia y Transaccionalidad
- **Idempotencia:** Cada mutación de flujo v2 incluye cabeceras con `operationId` para evitar duplicación ante reintentos automáticos.
- **Rollback de Compensación:** Si la inserción del evento en `HistorialSolicitud` falla tras mutar el documento principal de `Solicitud`, el servicio revierte automáticamente el estado y número de revisión para evitar registros corruptos o huérfanos.
