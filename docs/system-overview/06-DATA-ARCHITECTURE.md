# 06 — Arquitectura de Datos (Data & Database Architecture)

> **Clasificación:** `VERIFIED` en schemas Mongoose de `server/src/features/*/models/*.ts` y scripts de migración.

---

## 1. Colecciones y Modelos en MongoDB

| Colección | Modelo Mongoose | Propósito Operacional | Índices Clave | Riesgo / Consideraciones |
|---|---|---|---|---|
| `usuarios` | `Usuario` | Cuentas institucionales, roles y contraseñas. | `{ correo: 1 }` (unique) | Contraseña excluida por defecto (`select: false`). Técnicos nacen con `estado: false`. |
| `solicituds` | `Solicitud` | Entidad central de soporte técnico TIC. | `{ codigoCaso: 1 }` (unique, sparse), `{ usuario: 1, fecha: -1, _id: -1 }`, `{ tecnico: 1, estado: 1 }`, `{ estado: 1, createdAt: -1 }`, `{ fecha: -1 }`, `{ tipoCaso: 1 }` | `codigoCaso` alfanumérico secuencial autoincremental (`consecutivoCaso`). |
| `historialsolicituds` | `HistorialSolicitud` | Log inmutable (append-only) de eventos por caso. | `{ solicitud: 1, createdAt: 1 }`, `{ solicitud: 1, operationId: 1 }` (unique creado vía script) | No declarar unique de operationId en Mongoose autoIndex para no romper entornos sin réplica. |
| `ambientedeformacions` | `Ambiente` | Catálogo de aulas y ambientes del CTPI. | `{ nombre: 1 }` | Campos `nombre` y booleano `activo`. |
| `tipodecasos` | `TipoDeCaso` | Catálogo de categorías de soporte técnico. | `{ nombre: 1 }` | Protegido con validación de integridad referencial al eliminar. |
| `notificacions` | `Notificacion` | Bandeja de avisos individuales por usuario. | `{ usuario: 1, leido: 1, createdAt: -1 }` | Borrado/marcado en lote soportado vía `PATCH /leer-todas`. |
| `storages` | `Storage` | Metadatos de archivos adjuntos (fotos/evidencias). | `{ _id: 1 }` | URLs públicas o relativas hacia Cloudinary / storage local. |
| `consecutivocasos` | `ConsecutivoCaso` | Secuenciador atómico de códigos de caso. | `{ _id: 1 }` | Usa `$inc` atómico para prevenir colisiones en radicación concurrente. |
| `solucioncasos` | `SolucionCaso` | Modelo legado (Workflow v1). | `{ _id: 1 }` | **DEPRECATED.** Solo activo para lectura o cierre de casos antiguos v1. |

---

## 2. Estrategia de Índices y Rendimiento

1. **Agregaciones Estadísticas:**
   - Para acelerar los endpoints `/api/graficaSolicitudesPorMes` y `/api/graficaSolicitudesPorAmbiente`, el modelo `Solicitud` cuenta con índice dedicado `{ fecha: -1 }` y `{ tipoCaso: 1 }`, evitando collection scans globales.
2. **Bandejas Operativas:**
   - La bandeja del técnico (`/api/solicitud/asignadas`) se apoya en el índice `{ tecnico: 1, estado: 1 }`.
   - La bandeja de entrada del líder (`/api/solicitud/pendientes`) se apoya en `{ estado: 1, createdAt: -1 }`.
3. **Historial por Solicitud:**
   - Consultas de auditoría cargan eventos ordenados por `{ solicitud: 1, createdAt: 1 }`.

---

## 3. Transacciones y Requisitos de MongoDB Atlas

El motor de **Workflow v2** requiere transacciones ACID multie-documento (`session.withTransaction`) para garantizar que:
- La mutación del estado en `Solicitud` y la inserción del evento en `HistorialSolicitud` ocurran de forma estrictamente atómica.
- Si la réplica de MongoDB rechaza la transacción o no está disponible, el sistema detecta el modo de ejecución (producción vs simulación local) y aplica guardias de consistencia controlada.

---

## 4. Integridad Referencial y Prevención de Huérfanos

- **Categorías (`TipoDeCaso`):** Antes de ejecutar `deleteTipoCaso`, el backend ejecuta `await Solicitud.exists({ tipoCaso: id })`. Si existen tickets asociados, responde `409 Conflict`, impidiendo referencias rotas.
- **Ambientes de Formación (`Ambiente`):** En lugar de eliminar físicamente, se recomienda el marcado `activo: false` para preservar el historial estadístico de los casos pasados.
