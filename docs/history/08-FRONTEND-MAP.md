# 08 — Mapa del Frontend Web (Frontend Web Map)

> **Clasificación:** `VERIFIED` en árbol de componentes de `client/src` y rutas de `Allroutes.tsx`.

---

## 1. Arquitectura y Organización del Código

El frontend web sigue un patrón **FSD-lite (Feature-Sliced Design)**:
- `client/src/app/`: Providers globales (`AuthProvider`, `ExperienceProvider`), Error Boundary y router (`Allroutes.tsx`).
- `client/src/pages/`: Vistas y composición de pantallas por rol (`funcionario`, `tecnico`, `admin`, `shared`).
- `client/src/features/`: Módulos de dominio (`auth`, `tickets`, `ambientes`, `notifications`, `users`, `estadisticas`). Sin importaciones cruzadas directas.
- `client/src/shared/`: Cliente Axios configurado, utilidades multimedia, componentes atómicos UI y tipos globales.

---

## 2. Mapa Completo de Rutas del Frontend

```text
/ (Redirige a /loginMain)
│
├── Rutas Públicas (GuestOnlyRoutes)
│   ├── /loginMain              # Selector principal de acceso
│   ├── /login                  # Formulario directo de login con credenciales
│   ├── /register               # Registro de funcionarios y técnicos
│   ├── /forgot                 # Solicitud de restablecimiento de contraseña
│   └── /restablecerPassword/:token # Formulario para nueva contraseña
│
└── Rutas Protegidas (PrivateRoutes - Requiere Autenticación)
    ├── /perfil                 # Información y datos del usuario actual
    │
    ├── Zona Funcionario (RequireRole: 'funcionario')
    │   └── /funcionario        # Mesa de trabajo: Radicar caso, listar casos, ver estados y timeline
    │
    ├── Zona Técnico (RequireRole: 'tecnico')
    │   ├── /casos-por-resolver # Cola de trabajo activa ordenada por radar de proximidad
    │   ├── /mis-casos          # Redirección canónica a /casos-por-resolver
    │   └── /casos-resueltos    # Historial de casos resueltos con drawer de auditoría
    │
    └── Zona Líder TIC (RequireRole: 'lider')
        ├── /adminSolicitud     # Mesa de triage Bento Grid: Casos pendientes de asignación
        ├── /adminTecnicos      # Vista consolidada de técnicos
        ├── /tecnicosActivos    # Gestión de técnicos aprobados
        ├── /tecnicosInactivos  # Aprobación o rechazo de nuevos técnicos
        ├── /adminAmbientes     # Administración de sedes y ambientes de formación
        ├── /adminCasos         # Administración de categorías (tipos de caso)
        ├── /seguimiento        # Auditoría y seguimiento detallado de casos
        └── /adminEstadisticas  # Tablero de métricas operativas con Chart.js
```

---

## 3. Manejo de Estado y Sincronización en Vivo

1. **Estado de Autenticación (`AuthContext`):**
   - Mantiene en memoria: `user`, `isAuthenticated`, `isLoading`, `login`, `logout` y `refreshUser`.
   - No almacena JWT en `localStorage`; confía en la cookie `httpOnly` validada mediante `GET /api/auth/verify-token`.
2. **Hook de Notificaciones y Eventos (`useNotificaciones`):**
   - Establece conexión persistente con `GET /api/notificaciones/stream` (SSE).
   - Recibe eventos `nuevaNotificacion` y `actualizarSolicitud`.
   - Al recibir `actualizarSolicitud`, emite un evento del DOM (`ticket:updated`), permitiendo que `Funcionario.tsx`, `CasosPorResolverTabla.tsx` y `AdminSolicitud.tsx` recarguen sus listas sin que el usuario tenga que presionar F5.
   - Cuenta con sondeo secundario cada 60s en caso de fallo de conexión.
3. **Manejo de Formularios y Mutaciones:**
   - React Hook Form en formularios complejos.
   - Headers `Idempotency-Key` generados con `crypto.randomUUID()` para cada acción de workflow.
