# 16 — Invariantes Críticos del Sistema (Critical Invariants)

> **AVISO SUPREMO PARA DESARROLLADORES Y AGENTIC IDEs:**  
> Estas reglas e invariantes representan los cimientos de integridad del sistema. **NO las alteres, omitas o relajes** bajo ninguna circunstancia sin una evaluación arquitectónica exhaustiva y pruebas rigurosas.

---

## 1. Invariantes de Seguridad y Sesión

1. **Prioridad Estricta de Extracción de Token:**
   - En `extractAuthToken.ts`, el orden de lectura **debe permanecer:**
     `1. Authorization: Bearer` ➔ `2. Cookie 'token'` ➔ `3. Socket auth.token`.
   - Modificar este orden romperá la compatibilidad móvil o expondrá vulnerabilidades de sesión.
2. **Compuerta de Estado de Técnicos (`accountStatus.ts`):**
   - Un usuario con rol `tecnico` **jamás puede operar** si `usuario.estado !== true`.
   - La aprobación de técnicos es potestad exclusiva del Líder TIC.
3. **Cookies Seguras:**
   - La cookie de sesión web debe mantener `httpOnly: true`. El frontend **nunca debe almacenar tokens en `localStorage`**.

---

## 2. Invariantes del Ciclo de Vida de Tickets

1. **Cierre Exclusivo por el Solicitante:**
   - Un técnico **no puede cerrar** unilateralmente un caso v2. Su acción máxima es `resolve` (pasa a estado `resuelto`).
   - El estado terminal `cerrado` solo puede ser alcanzado mediante la acción `confirm` ejecutada por el **Funcionario titular**.
2. **Reversibilidad y Reclamación:**
   - El Funcionario titular tiene el derecho inviolable de ejecutar `reopen` desde el estado `resuelto` si la solución no fue efectiva en el ambiente real.
3. **Cancelación Restringida:**
   - El Líder TIC solo puede cancelar una solicitud si está en estado `nuevo` o `asignado`. Una vez que el técnico ha ejecutado `start` (iniciado atención presencial), la cancelación está prohibida.
4. **Idempotencia Obligatoria:**
   - Las mutaciones de Workflow v2 **exigen `Idempotency-Key`**. El servidor no debe autogenerar llaves si faltan en la petición; debe rechazar con HTTP 400.

---

## 3. Invariantes de Base de Datos y Persistencia

1. **Inmutabilidad del Historial (`HistorialSolicitud`):**
   - Los registros de `HistorialSolicitud` son de tipo **Append-Only**. Jamás se editan ni se eliminan; representan la auditoría forense del sistema.
2. **Atomicidad de Estados y Eventos:**
   - Toda actualización de estado en `Solicitud` debe ir acompañada en la misma transacción de la inserción del evento correspondiente en `HistorialSolicitud`.
3. **Compatibilidad Retrospectiva v1:**
   - Las solicitudes históricas sin `workflowVersion` (v1) no deben ser forzadas a la máquina de estados v2 ni alteradas masivamente. Deben responder 409 ante acciones v2.
