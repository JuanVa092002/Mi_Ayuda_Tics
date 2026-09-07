# Current Web & Backend Behavior (MiAyudaTIC)

## 1. Executive snapshot

- **Estado real del frontend web**: [Verificado] Aplicación React (Vite) en TypeScript. Usa React Router para navegación con guardias por rol (`RequireRole.tsx`). Gestión de estado local y peticiones HTTP vía Axios con interceptores para manejo de errores (401 redirige a login). El diseño usa Tailwind CSS.
- **Estado real del backend**: [Verificado] API REST en Node.js/Express con TypeScript y MongoDB (Mongoose). Arquitectura estructurada por features (`auth`, `users`, `tickets`, `shared`).
- **Qué ya está listo para mobile**: [Verificado] 
  - La autenticación soporta tokens Bearer en el header `Authorization`, lo cual es ideal para React Native.
  - Los endpoints están claramente segmentados por rol.
  - El backend ya expone una configuración de Socket.io que soporta autenticación mediante handshake.
- **Qué no está listo para mobile**: [Riesgo / deuda] 
  - El manejo de subida de archivos asume `multipart/form-data` tradicional, lo cual en React Native requiere configuración específica con FormData adaptado a mobile.
  - Falta un sistema de notificaciones Push nativas (FCM/APNs); actualmente el backend emite eventos por Socket.io y guarda notificaciones en base de datos.
- **Riesgos críticos para no romper web al extender backend**: [Riesgo / deuda] 
  - La web depende de la estructura exacta de las respuestas enriquecidas (`enrichSolicitudList`, `enrichSolicitudFoto`). Cualquier cambio en los populados de Mongoose (ej. quitar `populate('usuario', 'nombre')`) romperá la UI web.
  - La web hace "polling" de notificaciones cada 30 segundos (`setInterval` en `useNotificaciones.ts`). Si se cambia el modelo de notificaciones a solo push/socket y se apagan los endpoints REST, la web dejará de recibir actualizaciones si no se refactoriza.

## 2. Web behavior actual

- **Rutas existentes por rol**: [Verificado]
  - **Públicas**: `/loginMain`, `/register`, `/forgot`, `/restablecerPassword/:token`, `/login`.
  - **Funcionario**: `/funcionario` (Dashboard/Historial).
  - **Técnico**: `/casos-por-resolver`, `/mis-casos`, `/casos-resueltos`.
  - **Líder TIC**: `/adminSolicitud`, `/adminTecnicos`, `/adminAmbientes`, `/adminCasos`, `/adminEstadisticas`, `/tecnicosActivos`, `/tecnicosInactivos`, `/seguimiento`.
  - **Compartidas**: `/perfil`.
- **Qué puede hacer funcionario**: [Verificado] Crear solicitudes (tickets) adjuntando una foto obligatoria, ver su historial de solicitudes creadas.
- **Qué puede hacer técnico**: [Verificado] Ver casos asignados, resolver casos (adjuntando evidencia y descripción), ver casos resueltos.
- **Qué puede hacer líder TIC**: [Verificado] Ver todas las solicitudes, asignar técnicos a solicitudes, gestionar usuarios (activar/inactivar), aprobar/denegar técnicos, gestionar ambientes de formación y tipos de casos, ver estadísticas.
- **Guards reales en UI**: [Verificado] `RequireRole.tsx` verifica que el rol del usuario autenticado coincida con los permitidos para la ruta. Si no, bloquea el acceso.
- **Estados loading/error/empty**: [Verificado] Se usan spinners y modales/toast (`react-toastify`) para errores. Las tablas (ej. `CasosPorResolverTabla.tsx`) tienen estados de carga (spinner) y estados vacíos ("Todo despejado por aquí").
- **Notificaciones en web**: [Verificado] Implementadas mediante *polling* cada 30 segundos en `useNotificaciones.ts` llamando a `GET /api/notificaciones`. No se está usando Socket.io en el cliente web actualmente.
- **Cómo se comporta auth en web**: [Verificado] El login guarda el token (el backend lo envía como cookie o en el body). Axios intercepta los 401 y redirige al login limpiando el estado.
- **Qué partes están pulidas vs incompletas**: [Inferido] El flujo de tickets y asignación está pulido y funcional. El realtime en la web está incompleto (se usa polling en lugar de la infraestructura de sockets ya existente en el backend).
- **Bugs/quirks conocidos todavía vigentes**: [Riesgo / deuda] El polling de notificaciones puede causar carga innecesaria en el servidor si hay muchas pestañas abiertas por muchos usuarios.

## 3. Backend behavior actual

- **Módulos/feature folders reales**: [Verificado] `auth`, `users`, `tickets`, `shared`.
- **Endpoints actuales más importantes**: [Verificado]
  - `POST /api/solicitud`: Crea ticket (Funcionario).
  - `PUT /api/solicitud/:id/asignarTecnico`: Asigna ticket (Líder).
  - `POST /api/solucionCaso/:id`: Resuelve ticket (Técnico).
- **Contratos actuales relevantes para web**: [Verificado] Las respuestas de solicitudes vienen enriquecidas con `enrichSolicitudList` que formatea las URLs de las imágenes y extrae datos poblados para que la web los consuma directamente.
- **Auth real: cookie, bearer, socket**: [Verificado] El middleware `extractAuthToken.ts` busca el token en este orden: 1) Header `Authorization: Bearer ...`, 2) Cookie `token`, 3) Handshake de Socket.io.
- **RBAC real por endpoint**: [Verificado] Middleware `checkRol(['lider', 'tecnico', 'funcionario'])` aplicado a nivel de ruta en Express.
- **Resource-level permissions**: [Verificado] En `GET /api/solicitud/:id`, se verifica que si el usuario es funcionario, solo pueda ver su propia solicitud, y si es técnico, solo las asignadas a él.
- **Uploads/evidencias**: [Verificado] Se usa `multer` (`uploadMiddleware.single()`). MIME/size en `handleStorage`. `GET /api/storage/:id` y `GET /api/media/local/:filename` autorizan por acceso actual al ticket (dueño, técnico asignado, líder), no por autor del archivo.
- **Notificaciones persistidas + realtime**: [Verificado] Se guardan en MongoDB (`Notificacion.create`) y se emiten por Socket.io (`emitNotificacion`, `emitSolicitudUpdate`).
- **Gráficas/estadísticas**: [Verificado] Endpoints dedicados `/graficaSolicitudesPorAmbiente` y `/graficaSolicitudesPorMes` para el dashboard del líder.
- **Qué endpoints son seguros y cuáles son sensibles**: [Verificado] Las mutaciones de estado de tickets (`asignarTecnico`, `solucionCaso`) validan estrictamente el estado actual del ticket (ej. no se puede resolver un ticket ya finalizado).
- **Qué comportamientos son backward-compatible hoy y cuáles son frágiles**: [Riesgo / deuda] El borrado de tickets (`DELETE /api/solicitud/:id`) es un hard delete, lo que podría dejar notificaciones o soluciones huérfanas si no hay borrado en cascada en la DB.

## 4. Cross-surface contract reality

- **Qué consume web hoy del backend**: [Verificado] Endpoints REST estándar con JSON. FormData para subida de imágenes.
- **Qué asume la web que NO se debe romper**: [Verificado] La estructura de los objetos anidados (ej. `row.ambiente.nombre`, `row.usuario.nombre`). Si el backend deja de hacer `.populate()`, la web fallará al intentar renderizar las tablas.
- **Qué campos/flows son invariantes**: [Verificado] Hay dos máquinas. Legacy v1: `solicitado` → `asignado` → `pendiente` (opcional) → `finalizado` (`SolucionCaso`). Workflow v2 (`workflowVersion: 2`): `nuevo` → `asignado` → `en_progreso` ⇄ `esperando_usuario` → `resuelto` → `cerrado` (o `cancelado`). Ausencia de `workflowVersion` = v1. Contratos en `docs/contracts.md`.
- **Qué partes admiten extensión segura para mobile**: [Verificado] Se pueden agregar nuevos endpoints o nuevos campos en las respuestas JSON sin romper la web, siempre que no se eliminen o renombren los existentes.
- **Qué requeriría versionado o nuevo endpoint**: [Inferido] Si mobile requiere paginación por cursor (infinite scroll) en lugar de traer todos los datos de golpe como hace la web actualmente (ej. `getCasosAsignados` trae todo el array sin paginar desde el backend).

## 5. Mobile readiness from current system

- **Qué necesita Expo para comenzar ya**: [Verificado] 
  - Configurar Axios para enviar el token como `Bearer` en el header (ya soportado por el backend).
  - Componentes de UI nativos equivalentes a las vistas web.
  - Lógica para manejar `FormData` con URIs de archivos locales del dispositivo móvil.
- **Qué ya existe y puede reutilizarse**: [Verificado] Todo el backend REST, la lógica de autenticación, la validación de roles y los modelos de datos.
- **Qué gaps impiden construir los flujos mobile completos**: [Riesgo / deuda] 
  - Falta integración con Push Notifications nativas (Firebase/APNs). El Socket.io actual solo funciona con la app abierta y en primer plano.
- **Qué partes del Flutter legacy solo sirven como referencia UX y cuáles no deben tocarse**: [Inferido] El código en `mobile_flutter/MBO_ULT` sirve para entender los flujos de pantalla (`home_funcionario_screen.dart`, `informe_request_screen.dart`), pero la implementación técnica debe rehacerse desde cero en React Native con Expo.

## 6. Suggested handoff to mobile strategy

- **Lista concreta de inputs que necesita el Founding Mobile Engineer**:
  - Colección de Postman/Insomnia o Swagger con los endpoints actuales.
  - Credenciales de prueba para los 3 roles (Funcionario, Técnico, Líder).
  - Diseño en Figma de las pantallas adaptadas a mobile.
- **Lista concreta de decisiones que debe tomar Founder-CTO**:
  - ¿Se implementarán Push Notifications nativas para el MVP mobile o se usará Socket.io en background (poco confiable en iOS)?
  - ¿Se migrará el almacenamiento de imágenes de local a un bucket S3/Cloudinary para mejor rendimiento y escalabilidad en mobile?
- **Lista concreta de contratos a revisar por PE2**:
  - Revisar si los endpoints que devuelven listas grandes (`/solicitud/asignadas`, `/solicitud/pendientes`) necesitan paginación desde el backend para no saturar la memoria del dispositivo móvil.
- **Lista concreta de UX invariants a definir por Design Engineer**:
  - Cómo se mostrarán los estados de los tickets (colores, iconos) para mantener consistencia con la web.
  - Flujo de captura de fotos desde la cámara nativa vs selección desde la galería.

## 7. Appendix

### Tabla endpoint por endpoint

| Endpoint | Método | Quién lo usa hoy | Web depende de esto | Mobile podría usarlo | Riesgo de romper | Notas |
|---|---|---|---|---|---|---|
| `/api/auth/login` | POST | Todos | Sí | Sí | Bajo | Devuelve token |
| `/api/solicitud` | POST | Funcionario | Sí | Sí | Medio | Requiere FormData (foto) |
| `/api/solicitud/asignadas` | GET | Técnico | Sí | Sí | Bajo | Podría requerir paginación en mobile |
| `/api/solucionCaso/:id` | POST | Técnico | Sí | Sí | Medio | Requiere FormData (evidencia) |
| `/api/notificaciones` | GET | Todos | Sí (Polling) | Sí | Bajo | Mobile debería preferir Sockets/Push |

### Tabla screen/flow por rol en web

| Rol | Screen/Flow principal |
|---|---|
| Funcionario | Dashboard (Crear solicitud) -> Historial de solicitudes |
| Técnico | Casos por resolver -> Modal de Resolución -> Casos Resueltos |
| Líder TIC | Dashboard Estadísticas -> Gestión de Solicitudes (Asignar) -> Gestión de Técnicos |

### Tabla de eventos/notificaciones actuales

| Evento / Acción | Notificación DB | Socket.io Event | Email |
|---|---|---|---|
| Crear solicitud | No | No | Sí (Funcionario) |
| Asignar técnico | Sí (Funcionario) | `solicitudUpdate`, `notificacion` | Sí (Técnico) |
| Resolver caso | Sí (Funcionario) | `solicitudUpdate`, `notificacion` | Sí (Funcionario, si es finalizado) |
