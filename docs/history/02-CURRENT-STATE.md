# 02 — Estado Real del Proyecto (Current Project State)

> **Regla de Clasificación Rigurosa:**  
> - `DONE`: Verificado en código fuente y con pruebas automatizadas pasando.  
> - `PARTIALLY_DONE`: Funcional en backend o frontend pero con brechas de integración o flujos secundarios incompletos.  
> - `IN_PROGRESS`: Código activo bajo desarrollo o con refactor pendiente.  
> - `PLANNED`: Definido en specs/arquitectura pero no implementado en código.  
> - `BROKEN`: Componente o endpoint roto, no probado o inconsistente.  
> - `DEPRECATED`: Código legado mantenido por compatibilidad regresiva.  
> - `UNKNOWN`: No puede determinarse su estado sin pruebas de entorno externo.

---

## 1. Clasificación por Módulos y Capacidades

| Módulo / Capacidad | Estado | Backend | Frontend Web | Mobile | Tests | Evidencia / Notas |
|---|---|---|---|---|---|---|
| **Autenticación (Login, Registro, Password Reset)** | `DONE` | `DONE` | `DONE` | `DONE` | 100% Pass | Web usa cookies `httpOnly`; Mobile usa Bearer JWT en SecureStore. Reset password vía tokens temporales en MongoDB y correo Brevo. |
| **Workflow de Tickets v2 (Ciclo de Vida)** | `DONE` | `DONE` | `DONE` | `PARTIALLY_DONE` | 100% Pass | 7 estados v2 (`nuevo`, `asignado`, `en_progreso`, `esperando_usuario`, `resuelto`, `cerrado`, `cancelado`). Transacciones en MongoDB Atlas con atomicidad e idempotencia por `Idempotency-Key`. |
| **Historial y Bitácora de Casos (Append-Only)** | `DONE` | `DONE` | `DONE` | `PARTIALLY_DONE` | 100% Pass | Colección `HistorialSolicitud` almacena todos los eventos (`started`, `note_added`, `partial_solution`, etc.). Interfaz Web muestra timeline interactivo con badges de rol. |
| **Aprobación de Técnicos por Líder TIC** | `DONE` | `DONE` | `DONE` | N/A (Web only) | 100% Pass | Técnicos nacen con `estado: false`. Líder los aprueba vía `PUT /api/tecnicos/:id/aprobarTecnico`. Middleware `accountStatus.ts` bloquea técnicos no aprobados. |
| **Gestión de Ambientes de Formación** | `DONE` | `DONE` | `DONE` | N/A (Web only) | 100% Pass | CRUD en `/api/ambienteFormacion`. Validación Zod en HTTP boundary recién blindada. |
| **Gestión de Tipos de Caso (Categorías)** | `DONE` | `DONE` | `DONE` | N/A (Web only) | 100% Pass | CRUD en `/api/tipoCaso`. Validación Zod en HTTP boundary y guardia de integridad referencial (409 Conflict si hay tickets vinculados). |
| **Realtime Push (SSE Broadcaster + Socket.IO)** | `DONE` | `DONE` | `DONE` | `PLANNED` | 100% Pass | Backend expone `GET /api/notificaciones/stream` (SSE). Cliente Web escucha `nuevaNotificacion` y `actualizarSolicitud`, despachando eventos a la ventana y refrescando sin recarga. Polling de respaldo a 60s. |
| **Subida y Almacenamiento de Multimedia (Fotos/Evidencias)** | `DONE` | `DONE` | `DONE` | `PARTIALLY_DONE` | 100% Pass | Multer + almacenamiento en disco local y Cloudinary. Endpoints dedicados en `/api/media` y `/api/storage`. Validación mágica de buffer y cuota. |
| **Radar de Proximidad Física para Técnicos** | `DONE` | `DONE` | `DONE` | `PLANNED` | 100% Pass | Función determinística `sortTicketsByProximityRadar` en dominio; Web muestra chips de tier (`mismo_ambiente`, `misma_sede`, `otra_sede`). |
| **Estadísticas y Métricas del Líder TIC** | `PARTIALLY_DONE` | `DONE` | `PARTIALLY_DONE` | N/A (Web only) | Básico | Endpoints `/api/graficaSolicitudesPorAmbiente` y `/api/graficaSolicitudesPorMes` activos con índices optimizados `{ fecha: -1 }`. Frontend renderiza Chart.js pero faltan filtros temporales avanzados. |
| **Offline Mode & Sync Queue** | `PLANNED` | `PLANNED` | N/A | `PLANNED` | Sin tests | Diseñado conceptualmente en `architecture.md` para mobile (borradores locales y sincronización con `draftId`). Cero código implementado actualmente. |
| **Workflow Legado v1 (`SolucionCaso`)** | `DEPRECATED` | `DEPRECATED` | `DEPRECATED` | `DEPRECATED` | 100% Pass | Rutas `/api/solucionCaso` se mantienen exclusivamente para cerrar tickets legacy pre-v2. No se utiliza para tickets creados con `workflowVersion: 2`. |
| **Despliegue en Producción (Render / Vercel)** | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | N/A | El repositorio tiene configuración (`vercel.json`), pero el estado real de sincronización del commit actual en Render/Vercel no puede auditarse sin credenciales de consola externa. |

---

## 2. Detalle de Elementos Parcialmente Construidos

### 1. Estadísticas del Líder TIC (`AdminEstadisticas.tsx`)
- **Qué existe:** Visualización básica de gráficos de barras y líneas consumiendo los agregados de Mongo por mes y por ambiente.
- **Qué funciona:** Carga los datos globales y muestra gráficas interactivas con Chart.js.
- **Qué falta:** Selectores dinámicos de rango de fechas (mes/año actual vs anterior), selector por sede y exportación de reportes PDF/Excel.

### 2. Flujo de Casos en Mobile Expo
- **Qué existe:** Autenticación completa (login, registro, recuperación con SecureStore y Bearer).
- **Qué funciona:** Inicio de sesión y verificación de tokens.
- **Qué falta:** Integración completa de las pantallas rediseñadas de funcionario y técnico con la máquina de estados v2 y canal SSE en vivo.
