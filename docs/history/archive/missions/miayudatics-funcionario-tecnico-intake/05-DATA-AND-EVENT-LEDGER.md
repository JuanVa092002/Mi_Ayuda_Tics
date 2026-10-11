# 05-DATA-AND-EVENT-LEDGER.md — Ledger de Datos, Eventos y Visibilidad

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `CODE_VERIFIED` / `DATA_VERIFIED`

---

## 1. Esquema Formal de Eventos en `HistorialSolicitud`

```typescript
interface IHistorialSolicitud {
  solicitud: Types.ObjectId        // Referencia obligatoria al caso
  type: HistorialEventType         // created | assigned | started | note_added | waiting_for_requester | requester_reply | resolved | closed | cancelled
  author: Types.ObjectId           // Funcionario, Técnico o Líder TIC autor
  message: string                  // Mensaje legible institucional
  operationId?: string             // Token de idempotencia (prevención de duplicados)
  metadata?: {
    previousStatus?: string
    nextStatus?: string
    whatWasDone?: string           // Detalle de labores aplicadas
    reason?: string                // Motivo de cancelación si aplica
  }
  createdAt: Date                  // Timestamp inmutable
}
```

---

## 2. Reglas de Filtrado y Sanitización de Visibilidad

1. **Notas Técnicas en Bitácora (`note_added`):**
   - El técnico escribe la labor realizada (ej. *"Se verificó cable HDMI y se configuró resolución 1080p"*).
   - Ambos roles pueden leer el mensaje. No existen notas secretas u ocultas en el modelo de datos.
2. **Consultas Directas (`waiting_for_requester`):**
   - Almacena la pregunta del técnico (ej. *"¿El proyector enciende el LED naranja o no da energía?"*).
   - El funcionario la ve destacada en el Hero Banner y en el Drawer de Historial.
3. **Respuesta del Funcionario (`requester_reply`):**
   - Almacena la respuesta escrita por el docente.
   - Aparece en el feed de auditoría de ambos roles y reactiva el caso en la cola del técnico.
