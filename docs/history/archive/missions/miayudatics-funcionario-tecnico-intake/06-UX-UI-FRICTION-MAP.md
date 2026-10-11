# 06-UX-UI-FRICTION-MAP.md — Mapa de Fricciones UX/UI

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `UX_AUDIT_VERIFIED`

---

## 1. Clasificación de Fricciones por Impacto

### P0 (Bloqueantes — Resueltos en Misiones Anteriores)
- [x] **P0-1:** Inversión de prioridad en cola del técnico (casos con "Clase en Vivo" enviados a la página 2). *(Resuelto)*
- [x] **P0-2:** Badge duplicado y texto erróneo "En espera de ti" visto por técnicos. *(Resuelto)*

### P1 (Duda o Incomodidad Operativa — Candidatos Pre-MVP)
- **F-01 (Técnico / Funcionario):** Falta de indicador visual de estado SSE cuando se pierde la conexión de red en sótanos o aulas alejadas.
  - *Síntoma:* Si cae el Wi-Fi, no hay aviso de "Reconectando canal en vivo".
  - *Impacto:* Sensación de incertidumbre sobre si han entrado novedades.
- **F-02 (Funcionario):** Subida de imágenes sin compresión previa en el cliente.
  - *Síntoma:* Fotos pesadas (10+ MB) tardan en subirse bajo datos móviles lentos.
  - *Impacto:* Demora percibida al radicar.

### P2 (Ralentización o Carga Cognitiva Menor)
- **F-03 (Técnico):** Paginación rígida a 10 elementos sin selector para ver 20 o 50 casos en turnos de alta demanda.
- **F-04 (Funcionario):** Falta de persistencia de borrador de texto en el input de respuesta si el usuario navega a otra pestaña antes de enviar.

### P3 (Refinamiento Estético / Polish)
- **F-05:** Añadir microinteracción de confeti o check animado al otorgar el visto bueno final.
