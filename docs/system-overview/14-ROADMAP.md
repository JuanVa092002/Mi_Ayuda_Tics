# 14 — Roadmap Técnico Basado en Evidencia (Evidence-Based Roadmap)

> **Clasificación:** Basado estrictamente en las necesidades observables del código y arquitectura actual. Sin fechas inventadas ni compromisos ficticios.

---

## 1. Horizonte: NOW (Inmediato / En Curso)

- **[E2E Documentation & Context Handoff]:** Finalizar y fijar la base de conocimiento operacional del repositorio en `docs/system-overview/`.
- **[Defensive UI Property Access]:** Añadir encadenamiento opcional defensivo (`row.ambiente?.nombre`, `row.usuario?.nombre`) en componentes de tabla de técnicos y líderes para evitar TypeErrors si se consultan datos históricos inconsistentes.
- **[Audit Tracking de Aprobación de Técnicos]:** Documentar la conveniencia de persistir `aprobadoPor` (ObjectId del Líder) y `aprobadoAt` (Date) en el modelo `Usuario` cuando se programe una ventana de migración de esquema.

---

## 2. Horizonte: NEXT (Siguiente Iteración)

- **[Mobile Ticket Lifecycle v2 Integration]:** Conectar las pantallas móviles de Funcionario y Técnico de Expo con las mutaciones de Workflow v2 (`iniciarAtencion`, `solicitarInformacion`, `solucionTotal`, etc.) pasando la cabecera `Idempotency-Key`.
- **[Mobile Realtime Stream]:** Implementar el cliente SSE en React Native consumiendo `GET /api/notificaciones/stream` con reconexión automática en segundo plano.
- **[Deprecación de Hard-Delete]:** Retirar gradualmente la llamada al endpoint `DELETE /api/solicitud/:id`, canalizando todas las bajas de tickets a través de `POST /api/solicitud/:id/cancelar`.

---

## 3. Horizonte: LATER (Evolución Futura)

- **[Distributed SSE / Socket Adapter]:** En caso de escalamiento horizontal a múltiples instancias en nube, conectar `@socket.io/redis-adapter` y un canal Redis Pub/Sub para que el broadcast de notificaciones alcance a usuarios conectados en distintos nodos.
- **[Offline Draft Queue en Mobile]:** Implementación del almacenamiento local de borradores de tickets con sincronización automática al recuperar señal, tal como fue proyectado en la especificación de arquitectura.
