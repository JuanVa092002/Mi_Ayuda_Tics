# 05 — Arquitectura del Sistema E2E (System Architecture)

> **Clasificación:** `VERIFIED` en código fuente, configuraciones de pnpm workspace y despliegue.

---

## 1. Topología del Sistema E2E

```text
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│           CLIENTE WEB           │           │         CLIENTE MOBILE          │
│       React 18 + Vite (SPA)     │           │          Expo 56 + RN           │
│   Auth: Cookie httpOnly         │           │   Auth: Bearer JWT SecureStore  │
│   Realtime: SSE + Polling 60s   │           │   Realtime: Polling (SSE plan)  │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 │              /api/solicitud/*               │
                 │           /api/notificaciones/*             │
                 ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND PLATFORM                                │
│                     Express 5.2.1 + TypeScript (Node 20+)                     │
│                                                                               │
│  ┌─────────────────────────┐  ┌────────────────────────┐  ┌────────────────┐  │
│  │    @miayuda/contracts   │  │    Zod HTTP Boundary   │  │   Auth / RBAC  │  │
│  │   Contratos compartidos │  │   Validación de entrada│  │  Middleware    │  │
│  └─────────────────────────┘  └────────────────────────┘  └────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                      Workflow Engine v2 (Atomic Tx)                     │  │
│  │     - Control de revisiones optimistas (workflowRevision)               │  │
│  │     - Idempotencia garantizada por operationId & Idempotency-Key        │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │       SSE Broadcaster Service       │  │       Socket.IO Gateway        │  │
│  │   Heartbeat 25s, rooms por usuario  │  │   Redis adapter (opcional)     │  │
│  └─────────────────────────────────────┘  └────────────────────────────────┘  │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│     MONGODB ATLAS     │  │       CLOUDINARY      │  │         BREVO         │
│  Replica Set M0+      │  │  Almacenamiento de    │  │  Transaccional Email  │
│  Mongoose 8           │  │  fotos y evidencias  │  │  API REST + Fallback  │
│  Índices compuestos   │  │  (Fallback disco loc) │  │  SMTP autenticado     │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

---

## 2. Monorepo y Paquetes Compartidos

El repositorio está estructurado bajo **pnpm workspaces**:
```
MiAyudaTics_v1.0/
├── client/              # Frontend React Vite (FSD-lite)
├── server/              # Backend Express 5
├── packages/
│   └── contracts/       # @miayuda/contracts (Zod schemas, types, eventos compartidos)
├── mobile/              # Aplicación Expo React Native (gestión de dependencias propia)
└── docs/                # Documentación viva y especificaciones
```

### `@miayuda/contracts`
Es el paquete canónico de frontera. Define:
- `solicitudCreateFieldsSchema`, `solucionCasoFieldsSchema`.
- `solicitudWorkflowActionFields` (validación de payload por acción).
- `publicHistorialEventContractSchema` (contrato de serialización del historial).
- `RealtimeEvents` (nombres unificados de eventos: `nuevaNotificacion`, `actualizarSolicitud`, `actualizarTecnico`).

---

## 3. Estrategia de Autenticación Híbrida

El backend implementa un extractor agnóstico de token (`extractAuthToken.ts`) evaluado en el siguiente orden de precedencia:
1. **Header `Authorization: Bearer <token>`**: Usado nativamente por la app móvil.
2. **Cookie `token` (`httpOnly`, `SameSite: Lax/None`, `Secure`)**: Usado por el cliente Web en navegadores.
3. **Handshake `auth.token` en Socket.IO**: Usado para autenticar WebSockets en tiempo real.

---

## 4. Pipeline de Comunicación en Tiempo Real

El sistema implementa una arquitectura híbrida de actualización:
1. **Server-Sent Events (SSE) vía `/api/notificaciones/stream`:**
   - Conexión unidireccional persistente basada en HTTP estándar con keep-alive.
   - Heartbeat cada 25 segundos para evitar timeouts de proxies y balanceadores.
   - Registro en memoria indexado por `userId` y `rol`.
   - Soporta `broadcastToUser`, `broadcastToRole` y `broadcastToUsers`.
2. **Frontend Event Listener:**
   - El hook [`useNotificaciones.ts`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/features/notifications/hooks/useNotificaciones.ts) escucha eventos del stream.
   - Al recibir `actualizarSolicitud`, dispara un `window.dispatchEvent(new CustomEvent('ticket:updated'))`, haciendo que tablas y modales refresquen sus datos locales al instante sin recargar la página.
3. **Respaldo por Sondeo (Polling):**
   - Polling de fondo de baja frecuencia cada 60s en caso de pérdida prolongada de conexión de red.
