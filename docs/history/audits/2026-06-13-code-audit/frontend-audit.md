# Frontend Audit — MiAyudaTics_v1.0

> Evidencia base: `client/src/**`, `client/package.json`, `client/tailwind.config.js`

---

## Verificado

### Stack

| Capa | Tecnología |
|------|------------|
| UI | React 18.3 |
| Build | Vite 8 |
| Lenguaje | TypeScript strict |
| Routing | react-router-dom 6 |
| HTTP | Axios (`withCredentials: true`) |
| Forms | react-hook-form |
| Estilos | Tailwind 3 + CSS custom (`index.css`) |
| Charts | chart.js + react-chartjs-2 |
| Toasts | react-toastify |
| Tests | Vitest + Testing Library (mínimo) |
| Alias | `@/*` → `src/*` |

### Estructura FSD-lite

```
client/src/
├── app/           App.tsx, layouts/, router/
├── pages/         admin/, funcionario/, tecnico/, auth pages, shared/
├── features/      auth, tickets, users, ambientes, estadisticas, notifications
└── shared/        api/, types/, ui/
```

Regla documentada: `client/src/features/README.md` — `app → pages → features → shared`.

### Rutas y roles

Definición: `client/src/app/router/Allroutes.tsx`.

| Rol | Home | Rutas exclusivas |
|-----|------|------------------|
| funcionario | `/funcionario` | historial implícito en feature |
| tecnico | `/casos-por-resolver` | `/mis-casos`, `/casos-resueltos` |
| lider | `/adminSolicitud` | admin técnicos, ambientes, casos, estadísticas, seguimiento |

**Guards:** `guest.routes.tsx`, `private.routes.tsx`, `RequireRole.tsx` (`client/src/app/router/`).

**Ruta compartida:** `/perfil` — cualquier autenticado.

**Guest:** `/loginMain`, `/login`, `/register`, `/forgot`, `/restablecerPassword/:token`.

### Auth (web)

- **Cookie session** — no localStorage JWT (`client/src/shared/api/axios.ts` `withCredentials: true`).
- Bootstrap: `AuthProvider` → `GET auth/verify-token` (`features/auth/context/AuthContext.tsx`).
- 401 → logout + redirect `/loginMain`.
- Env: `VITE_BACKEND_URL` o `VITE_API_URL` → base `/api` (`axios.ts`).

### Capa API (features/*/api/)

| Módulo | Endpoints principales |
|--------|----------------------|
| auth.service.ts | register, login, verify-token, logout, password |
| solicitud.service.ts | solicitud CRUD, ambientes, tipoCaso, asignar |
| solucion.service.ts | solucionCaso POST |
| tecnicos.service.ts | aprobar/denegar, usuarios activos/inactivos |
| ambiente.service.ts | ambienteFormacion CRUD |
| estadisticas.service.ts | gráficas por ambiente/mes |
| notifications.service.ts | notificaciones + marcar leídas |

### Pantallas principales

| Área | Componentes |
|------|-------------|
| Auth | LoginMain, JustLogin, Register, Forgot, Reset |
| Funcionario | Funcionario (crear solicitud multipart), HistorialFuncionario |
| Líder | AdminSolicitud, AdminTecnicos, AdminAmbientes, AdminCasos, AdminEstadisticas, SeguimientoSolicitud, TecnicosActivos/Inactivos |
| Técnico | CasosPorResolver, MisCasos, CasosResueltos + ResolutionModal |
| Shared | Perfil, NotFound, NavApp (notificaciones poll 30s) |

### Design tokens

`tailwind.config.js`:
- `primary` / `azul-sena`: `#04324d`
- `accent` / `verde-sena`: `#39a900`
- Mockup 2026 palette en `index.css` y `assets/mockups/.../DESIGN.md`

Tipografía: Public Sans, Plus Jakarta Sans (`index.html`).

Iconos: Material Symbols Outlined (activo); Font Awesome en package.json sin uso en src.

### Tipos

`client/src/shared/types/domain.ts` — tipos locales; comentario: mirror backend hasta `@miayuda/types`. **No importa `@miayuda/contracts`.**

### Tests

| Archivo | Cobertura |
|---------|-----------|
| test/example.test.tsx | smoke |
| tests/client-hardening.test.tsx | getRoleHome, getApiErrorMessage, RequireRole |

**Sin** tests de páginas, API integration, E2E en client (E2E en raíz `e2e/`).

### Deploy

- `client/vercel.json` — SPA rewrite `/*` → `/index.html`
- Build exige `VITE_BACKEND_URL` en prod (`vite.config.ts`)

---

## Inferido

- `pages/home/Home.tsx` es código huérfano (no en router).
- `logoSena.png` referenciado pero posiblemente ausente en assets.
- Notificaciones web no usan Socket.IO en cliente (poll HTTP cada 30s).

---

## Riesgos / Deuda

1. Tipos duplicados vs server/contracts — drift risk.
2. Cobertura de tests muy baja.
3. Socket realtime no consumido en web (solo polling).
4. Dependencias declaradas sin uso (fontawesome, js-cookie, react-spinners).
5. Regla cursor antigua colores `#1B2A4A` vs tokens reales `#04324d`.

---

## Preguntas abiertas

- ¿Se migrará client a `@miayuda/contracts`?
- ¿Se implementará Socket.IO en web para notificaciones?

---

## Matriz de confianza

| Componente | Confianza |
|------------|-----------|
| Rutas/roles | verified |
| Auth cookie | verified |
| API endpoints usados | verified |
| Realtime web | verified absent (poll only) |
| Design tokens | verified |
