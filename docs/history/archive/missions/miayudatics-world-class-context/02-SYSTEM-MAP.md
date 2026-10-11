# 02-SYSTEM-MAP.md — Mapa Integral del Sistema y Topología de Aplicación

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Arquitectura General del Monorepo

MiAyudaTics es una plataforma de mesa de ayuda TIC orientada a la infraestructura académica y administrativa del Centro de Teleinformática y Producción Industrial (**CTPI SENA Cauca**).

```text
MiAyudaTics_v1.0/
├── client/                     # Aplicación Web SPA (React 18, Vite 8, Tailwind CSS)
│   ├── src/
│   │   ├── app/                # Enrutador (App.tsx), Guards (RequireAuth, RequireRole)
│   │   ├── features/           # Módulos por dominio (auth, tickets, notifications, users)
│   │   ├── pages/              # Vistas por Rol (funcionario, tecnico, admin)
│   │   ├── shared/             # UI Components, Experiments, Theme, Utils, Types
│   │   └── tests/              # 23 Suites Vitest (80 pruebas de integración/componente)
├── server/                     # API RESTful + SSE (Node.js, Express 5, Mongoose 8)
│   ├── src/
│   │   ├── core/               # Conexión DB, Middlewares globales, App express
│   │   ├── features/           # Controladores, Rutas y Dominio de tickets y usuarios
│   │   ├── shared/             # Utilidades de JWT, Email (Brevo/SMTP), Storage, Realtime
│   │   └── tests/              # 27 Suites Vitest (153 pruebas unitarias y de integración)
├── packages/contracts/         # Tipos compartidos TypeScript (@miayuda/contracts)
└── docs/                       # Documentación de arquitectura y misiones
```

---

## 2. Mapa de Rutas Críticas Post-Login

| Ruta en Cliente | Componente Principal | Rol Requerido | Propósito Operativo |
|---|---|---|---|
| `/login` | `Login.tsx` | Público / Todos | Autenticación con credenciales SENA (Email/Pass) |
| `/funcionario` | `Funcionario.tsx` | `funcionario` | Master-Detail: Cola personal y Expediente con Timeline en vivo |
| `/casos-por-resolver` | `CasosPorResolverTabla.tsx` | `tecnico` | Workbench Operativo: Cola de urgencia, Active Job, Bitácora y Resolución |
| `/adminSolicitud` | `AdminSolicitud.tsx` | `lider` / `admin` | Mesa de Despacho L2: Triaje y Asignación de solicitudes en 1 clic |
| `/admin` / `/admin/estadisticas` | `AdminEstadisticas.tsx` | `admin` | Métricas operativas consolidadas del centro |
| `/admin/ambientes` | `AdminAmbientes.tsx` | `admin` | Catálogo de aulas y ambientes de formación CTPI |

---

## 3. Topología de Comunicación y Transporte de Datos

1. **HTTP/REST (Cliente -> Backend):**
   - Prefijo de API: `/api`
   - Cabeceras de Autenticación: `Authorization: Bearer <jwt_token>`
   - Modos de carga: JSON para mutaciones de estado; `multipart/form-data` para radicación con fotografías.

2. **Canal Push Unidireccional SSE (Backend -> Cliente):**
   - Endpoint: `/api/notificaciones/stream`
   - Eventos emitidos:
     - `nuevaNotificacion`: Alertas personales en tiempo real para el usuario.
     - `actualizarSolicitud`: Evento de broadcast que dispara `window.dispatchEvent(new CustomEvent('ticket:updated'))` en el navegador, provocando refresco transparente sin recargar página.

3. **Mecanismo de Desconexión y Reconexión:**
   - Si el stream SSE cae (ej. corte de Wi-Fi institucional), el cliente ejecuta reintento automático con temporizador de 5 segundos (`setTimeout(connectSSE, 5000)`).
