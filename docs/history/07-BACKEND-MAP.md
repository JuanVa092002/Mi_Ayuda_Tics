# 07 — Mapa del Backend (Backend Map & Endpoints)

> **Clasificación:** `VERIFIED` en `server/src/core/routes.ts` y controladores de features.

---

## 1. Catálogo Completo de Rutas y Endpoints

Todos los endpoints se montan bajo el prefijo canónico `/api`.

### Autenticación y Cuentas (`/api/auth`, `/api/recuperarPassword`, `/api/restablecerPassword`)
| Método | Ruta | Middleware / Guardas | Controlador | Propósito |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Rate limit (`authLimiter`) | `login` | Autentica credenciales y emite cookie httpOnly o JWT. |
| `POST` | `/api/auth/register` | Rate limit, `validarRegistro` | `registro` | Crea nuevo usuario institucional. |
| `GET` | `/api/auth/verify-token` | `authMiddleware` | `verifyToken` | Retorna datos del usuario autenticado. |
| `POST` | `/api/auth/logout` | Ninguno | `logout` | Limpia cookies de sesión en el navegador. |
| `POST` | `/api/recuperarPassword` | Rate limit | `recuperarPassword` | Genera token de reset y envía correo transaccional Brevo. |
| `POST` | `/api/restablecerPassword` | Rate limit | `restablecerPassword` | Valida token temporal y actualiza contraseña hasheada. |

---

### Solicitudes y Workflow de Tickets (`/api/solicitud`)
| Método | Ruta | Rol Requerido | Validadores / Middleware | Controlador |
|---|---|---|---|---|
| `GET` | `/api/solicitud/` | `lider` | `authMiddleware`, `checkRol(['lider'])` | `getSolicitud` |
| `GET` | `/api/solicitud/pendientes` | `lider` | `checkRol(['lider'])` | `getSolicitudesPendientes` |
| `GET` | `/api/solicitud/historialSolicitudes` | `lider` | `checkRol(['lider'])` | `getHistorialSolicitud` |
| `GET` | `/api/solicitud/asignadas` | `tecnico` | `checkRol(['tecnico'])` | `getSolicitudesAsignadas` |
| `GET` | `/api/solicitud/finalizadas` | `tecnico` | `checkRol(['tecnico'])` | `getSolicitudesFinalizadas` |
| `GET` | `/api/solicitud/historial` | `funcionario` | `checkRol(['funcionario'])` | `historialSolicitudesCreadas` |
| `POST` | `/api/solicitud/` | `funcionario` | `uploadLimiter`, Multer `foto`, `validarSolicitud` | `crearSolicitud` |
| `GET` | `/api/solicitud/:id` | Todos (dueño / asignado / líder) | `checkRol(['lider', 'tecnico', 'funcionario'])` | `getSolicitudId` |
| `GET` | `/api/solicitud/:id/historial` | Todos (según caso) | `checkRol(['lider', 'tecnico', 'funcionario'])` | `getSolicitudHistorial` |
| `PUT` | `/api/solicitud/:id/asignarTecnico` | `lider` | `validarAsignarTecnico` | `asignarTecnicoSolicitud` |
| `PUT` | `/api/solicitud/:id/reasignarTecnico` | `lider` | `validarReasignarTecnico` | `reasignarTecnicoSolicitud` |
| `POST` | `/api/solicitud/:id/iniciarAtencion` | `tecnico` | `checkRol(['tecnico'])` | `iniciarAtencionSolicitud` |
| `POST` | `/api/solicitud/:id/actualizacion` | `tecnico` | Multer `evidencia`, `validarMensajeWorkflow` | `agregarActualizacionSolicitud` |
| `POST` | `/api/solicitud/:id/solicitarInformacion` | `tecnico` | `validarMensajeWorkflow` | `solicitarInformacionSolicitud` |
| `POST` | `/api/solicitud/:id/responder` | `funcionario` | Multer `evidencia`, `validarMensajeWorkflow` | `responderInformacionSolicitud` |
| `POST` | `/api/solicitud/:id/solucionParcial` | `tecnico` | Multer `evidencia`, `validarSolucionParcial` | `registrarSolucionParcial` |
| `POST` | `/api/solicitud/:id/solucionTotal` | `tecnico` | Multer `evidencia`, `validarSolucionTotal` | `registrarSolucionTotal` |
| `POST` | `/api/solicitud/:id/confirmarSolucion` | `funcionario` | `checkRol(['funcionario'])` | `confirmarSolucionSolicitud` |
| `POST` | `/api/solicitud/:id/reabrir` | `funcionario` | `validarMotivoWorkflow` | `reabrirSolicitud` |
| `POST` | `/api/solicitud/:id/cancelar` | `lider` | `validarMotivoWorkflow` | `cancelarSolicitud` |
| `DELETE` | `/api/solicitud/:id` | `lider` | **DEPRECATED** (Hard delete) | `deleteSolicitud` |

---

### Gestión de Especialistas Técnicos (`/api/tecnicos`)
| Método | Ruta | Rol Requerido | Controlador | Propósito |
|---|---|---|---|---|
| `GET` | `/api/tecnicos/tecnicosPendientes` | `lider` | `listaTecnicosPendientes` | Lista técnicos con `estado: false` pendientes de aprobación. |
| `GET` | `/api/tecnicos/tecnicosAprobados` | `lider` | `listaTecnicosAprobados` | Lista técnicos activos habilitados para asignación. |
| `PUT` | `/api/tecnicos/:id/aprobarTecnico` | `lider` | `aprobarTecnico` | Pasa `estado: true` y envía email de bienvenida. |
| `PUT` | `/api/tecnicos/:id/denegarTecnico` | `lider` | `denegarTecnico` | Elimina o inhabilita al postulante y notifica por email. |

---

### Catálogos y Ambientes (`/api/ambienteFormacion`, `/api/tipoCaso`)
| Método | Ruta | Rol Requerido | Validadores | Propósito |
|---|---|---|---|---|
| `GET` | `/api/ambienteFormacion/` | Autenticado | Ninguno | Lista ambientes de formación activos. |
| `POST` | `/api/ambienteFormacion/` | `lider` | `validarCrearAmbiente` | Crea un nuevo ambiente de formación. |
| `PUT` | `/api/ambienteFormacion/:id` | `lider` | `validarActualizarAmbiente` | Actualiza nombre o estado activo del ambiente. |
| `GET` | `/api/tipoCaso/` | Autenticado | Ninguno | Lista categorías de soporte técnico. |
| `POST` | `/api/tipoCaso/` | `lider` | `validarCrearTipoCaso` | Crea una nueva categoría. |
| `PUT` | `/api/tipoCaso/:id` | `lider` | `validarActualizarTipoCaso` | Modifica nombre o descripción de la categoría. |
| `DELETE` | `/api/tipoCaso/:id` | `lider` | Guarda integridad (409) | Elimina la categoría si no posee tickets asociados. |

---

### Notificaciones y Streaming en Vivo (`/api/notificaciones`)
| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| `GET` | `/api/notificaciones/stream` | Autenticado | Canal Server-Sent Events (SSE) para recepción de eventos en vivo. |
| `GET` | `/api/notificaciones/` | Autenticado | Obtiene la lista de notificaciones no leídas del usuario. |
| `PATCH` | `/api/notificaciones/:id/leer` | Autenticado (dueño) | Marca una notificación específica como leída. |
| `PATCH` | `/api/notificaciones/leer-todas` | Autenticado | Marca todas las notificaciones del usuario como leídas. |

---

### Analítica y Métricas (`/api/graficaSolicitudesPorAmbiente`, `/api/graficaSolicitudesPorMes`)
| Método | Ruta | Rol Requerido | Propósito |
|---|---|---|---|
| `GET` | `/api/graficaSolicitudesPorAmbiente` | `lider` | Agregación MongoDB de tickets por ambiente. |
| `GET` | `/api/graficaSolicitudesPorMes` | `lider` | Agregación MongoDB de tickets agrupados por mes cronológico. |
