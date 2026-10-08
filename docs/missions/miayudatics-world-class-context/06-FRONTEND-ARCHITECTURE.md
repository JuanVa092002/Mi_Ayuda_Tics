# 06-FRONTEND-ARCHITECTURE.md — Arquitectura Frontend y Sistema de Diseño

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Estructura de Capas Frontend

```text
client/src/
├── app/
│   ├── App.tsx                     # Enrutador BrowserRouter, ToastContainer, Rutas protegidas
│   └── main.tsx                    # React DOM render, estilos globales
├── shared/
│   ├── ui/                         # Design System (AppShell, StatusBadge, SemanticIcon, FeedbackBanner)
│   ├── experiments/                # ExperienceContext (gestor de variantes Lider/Tecnico/Funcionario)
│   ├── theme/                      # Tokens SENA (#04324d verde #39a900) y sombras
│   ├── utils/                      # ticketContext.ts, apiError.ts
│   └── types/                      # Declaraciones de tipos TypeScript de dominio
├── features/
│   ├── auth/                       # useAuth, AuthContext, login, tokenSign
│   ├── tickets/                    # Servicios de API de solicitudes, workflow retry, modales
│   ├── notifications/              # useNotificaciones, stream SSE, campana
│   └── users/                      # getTecnicosAprobados, perfiles
└── pages/
    ├── funcionario/                # Portal Funcionario (Master-Detail, Timeline, Radicación)
    ├── tecnico/                    # Workbench Técnico (Cola de urgencia, Bento Grid, Intervención)
    └── admin/                      # Líder TIC y Administración (Despacho, Ambientes, Estadísticas)
```

---

## 2. Sistema de Diseño y Tokens Institucionales SENA

1. **Colores Canónicos:**
   - **Azul Institucional SENA:** `#04324d` (Navegación principal, encabezados, acciones corporativas).
   - **Verde SENA:** `#39a900` (Éxito, botón de radicación, visto bueno de solución).
   - **Fondo Operativo:** `bg-slate-50/70` con bordes `border-slate-200/90`.
2. **Iconografía Semántica (`SemanticIcon.tsx`):**
   - Mapeo canónico a Google Material Symbols Outlined sin íconos ad-hoc.
3. **Badges de Estado (`StatusBadge.tsx`):**
   - Adaptación semántica por rol: el estado `esperando_usuario` muestra "Espera de usuario" para el técnico/líder y "En espera de ti" para el funcionario.
