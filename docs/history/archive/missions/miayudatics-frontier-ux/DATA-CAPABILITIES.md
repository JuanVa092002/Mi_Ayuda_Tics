# Data Capabilities Matrix — MiAyudaTICS

Esta matriz establece la clasificación estricta de cada dato para evitar inventar capacidades inexistentes en el backend o prometer funcionalidades sin sustento contractual.

| Atributo / Capacidad | Clasificación | Fuente / Sustento | Comportamiento UX Implementado |
|---|---|---|---|
| `_id`, `codigoCaso` | **SUPPORTED** | MongoDB / Contract API | Identificador único y legible en badges y encabezados |
| `descripcion` | **SUPPORTED** | Solicitud schema | Detalle del problema reportado por el funcionario |
| `ambiente` | **SUPPORTED** | Relación `AmbienteFormacion` | Nombre de bloque y número de ambiente de formación |
| `tipoCaso` | **SUPPORTED** | Relación `TipoCaso` | Categoría técnica del requerimiento |
| `telefono` | **SUPPORTED** | Campo de contacto | Teléfono de contacto directo del solicitante |
| `usuario` (solicitante) | **SUPPORTED** | Relación `User` | Nombre y correo institucional del funcionario |
| `tecnico` (asignado) | **SUPPORTED** | Relación `User` | Nombre y datos del especialista técnico asignado |
| `estado` | **SUPPORTED** | Enum de backend | `solicitado`, `asignado`, `en_progreso`, `esperando_usuario`, `resuelto`, `cancelado` |
| `fecha` / timestamps | **SUPPORTED** | Timestamps ISO | Fechas de creación y actualización formateadas amigablemente |
| `foto` / evidencia | **SUPPORTED** | GridFS / Cloudinary endpoint | Visualizador contextual con apertura modal en drawer |
| `solucion` | **SUPPORTED** | Subdocumento de solución | Detalle de lo que se hizo, fecha de solución |
| `actualizaciones` / bitácora | **SUPPORTED** | Array de notas técnicas | Cronología interactiva de eventos y hallazgos |
| `capabilities` (canStart, etc.) | **DERIVED** | Helper frontend basado en estado | Condiciona los botones de acción del técnico |
| Estadísticas de turno / cola | **DERIVED** | Conteo en cliente sobre arrays | Número de casos pendientes, activos y resueltos |
| **SLA en minutos o countdown** | **NOT_SUPPORTED** | No existe en schema/backend | **No se muestra**. Se evitan timers o promesas ficticias |
| **Carga de trabajo por técnico** | **NOT_SUPPORTED** | No hay endpoint de métricas | No se inventan porcentajes de carga individual |
| **GPS / Geolocalización en vivo**| **NOT_SUPPORTED** | Sin telemetría móvil | No se inventa mapa de rastreo físico en vivo |
| **Prioridad por Machine Learning**| **NOT_SUPPORTED** | Sin motor de inferencia | Priorización visual por orden cronológico natural |
| Notificaciones Push en segundo plano | **PROPOSED** | Requiere WebPush / FCM backend | Documentado como propuesta para siguiente versión |
