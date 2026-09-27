# Mobile Audit — MiAyudaTics_v1.0

> **Decisión de producto:** `mobile/MiAyudaTIC-Mobile` = app mobile **OFICIAL**.  
> `mobile_flutter/MBO_ULT` = prototipo **LEGACY** (no integrar).

---

## Verificado — App oficial: `mobile/MiAyudaTIC-Mobile`

### Stack

| Item | Valor | Evidencia |
|------|-------|-----------|
| Framework | Expo SDK ~56 | `package.json` |
| React Native | 0.85.3 | `package.json` |
| Router | expo-router ~56.2.10 | `app/`, `main: expo-router/entry` |
| Forms | react-hook-form + zod | `src/features/auth/schemas.ts` |
| Token storage | expo-secure-store | `src/shared/storage/token.ts` key `miayudatics_auth_token` |
| New Architecture | enabled | `app.json` `newArchEnabled: true` |
| Bundle ID | com.miayudatics.mobile | `app.json` |
| Deep link scheme | miayudatics | `app.json` |

**No está en pnpm workspace** (`pnpm-workspace.yaml`). Tiene `pnpm-lock.yaml` propio.

### Estructura

```
mobile/MiAyudaTIC-Mobile/
├── app/                    # Expo Router
│   ├── _layout.tsx
│   ├── index.tsx           # Welcome
│   ├── restablecerPassword/[token].tsx
│   └── (auth)/
│       ├── login.tsx
│       ├── register.tsx
│       ├── forgot-password.tsx
│       ├── reset-password/[token].tsx
│       ├── session.tsx     # stub post-auth
│       ├── pending-approval.tsx
│       └── lider-not-supported.tsx
└── src/
    ├── features/auth/      # auth-context, api, schemas, types
    └── shared/             # api/client, storage, theme, ui
```

**Solo feature implementada:** `auth`. No solicitudes, sockets, notificaciones.

### Rutas y flujos

| Pantalla | Archivo | Comportamiento |
|----------|---------|----------------|
| Welcome | `app/index.tsx` | Login / Register |
| Login | `app/(auth)/login.tsx` | POST /auth/login |
| Register | `app/(auth)/register.tsx` | funcionario\|tecnico; multipart si foto |
| Forgot | `app/(auth)/forgot-password.tsx` | POST /recuperarPassword |
| Reset | `app/(auth)/reset-password/[token].tsx` + alias `restablecerPassword/` | POST /restablecerPassword/:token |
| Session | `app/(auth)/session.tsx` | Stub: "Módulo principal en construcción" |
| Pending | `app/(auth)/pending-approval.tsx` | Técnico sin aprobación |
| Líder blocked | `app/(auth)/lider-not-supported.tsx` | Líder debe usar web |

**Guard:** `app/(auth)/_layout.tsx` — redirige líder a `lider-not-supported`; protege `session`.

### Backend integration

- Env: `EXPO_PUBLIC_API_URL` (`.env.example` → `https://miayudatics-v1-0.onrender.com`)
- API base: `{URL}/api` (`src/shared/api/client.ts`)
- Auth: `Authorization: Bearer` — **no cookies**
- Endpoints usados: login, verify-token, logout, register, recuperarPassword, restablecerPassword

### Roles soportados

| Rol | Register | Login | Post-auth |
|-----|----------|-------|-----------|
| funcionario | Sí | Sí | session stub |
| tecnico | Sí (pending) | Tras aprobación | session stub |
| lider | No en schema | Rechazado | lider-not-supported |

### UI / theme

`src/shared/theme/colors.ts`: brandGreen `rgb(57,169,0)`, brandBlue `rgb(0,50,77)` — alineado SENA.

Componentes: `AuthScaffold`, `FormField`, `AppButton`, `BrandTitle`.

### Tests y CI

- Script: `typecheck` only (`tsc --noEmit`)
- **Sin** tests automatizados
- **Sin** entrada en `.github/workflows/ci.yml`

### Gaps documentación

- `mobile/MiAyudaTIC-Mobile/README.md` dice backend en "otro repositorio" — **incorrecto** (mismo monorepo `server/`).
- Assets referenciados (`assets/images/*.png`, logos) — solo 4 SVG en `assets/icons/` verificados en árbol.

---

## Verificado — App LEGACY: `mobile_flutter/MBO_ULT`

### Stack

| Item | Valor |
|------|-------|
| Package | `mesa_servicio_ctpi` (`pubspec.yaml`) |
| SDK | Dart >=3.4.3 |
| State | provider ^6.1.2 |
| HTTP | http + dio |
| Entry | `lib/main.dart` → WelcomeScreen |

### Pantallas implementadas (más completo que Expo)

`lib/screens/`: welcome, login, register, home_funcionario, home_tecnico, form_request, informe_request, profile.

`lib/controllers/`: register, request, solution, profile.

`lib/models/`: usuario, solicitud, solucion, ambiente, tipocaso, storage, foto.

### Backend — CRÍTICO

**URL hardcodeada** en controllers (ej. login, request):

```
https://backendnodeproyectomesaservicio.onrender.com/api
```

**No es** `miayudatics-v1-0.onrender.com` del monorepo actual.

### Otros hallazgos legacy

- `.git` anidado en `mobile_flutter/MBO_ULT/`
- README genérico Flutter template
- **Cero** referencias en `docs/` o `ARCHITECTURE.md`
- Sin manejo explícito de rol líder
- Rutas en `main_route.dart` parcialmente comentadas; navegación vía `MaterialPageRoute`

---

## Tabla de divergencias

| Aspecto | Expo (oficial) | Flutter (legacy) |
|---------|----------------|------------------|
| Backend URL | `miayudatics-v1-0.onrender.com` | `backendnodeproyectomesaservicio.onrender.com` |
| Scope | Auth only | Solicitudes + soluciones |
| Auth | Bearer + SecureStore | Bearer + SharedPreferences |
| En monorepo docs | Parcial (mobile-integration API) | No documentado |
| Workspace pnpm | No | No |
| Estado | Activo / scaffold v1 | Congelado / referencia UX |

---

## Inferido

- Flutter sirve como **referencia de flujos** a portar a Expo (funcionario crea ticket, técnico resuelve).
- Expo es la dirección estratégica por alineación con backend actual y `docs/mobile-integration.md`.

---

## Riesgos / Deuda

1. Mobile oficial sin módulos de negocio (solicitud, socket, notificaciones).
2. Dos codebases mobile confunden onboarding.
3. Flutter apunta a backend obsoleto — **no ejecutar contra prod actual sin cambio URL**.
4. Sin CI mobile build (EAS/APK).
5. No consume `@miayuda/contracts`.
6. Assets faltantes en Expo pueden romper builds visuales.

---

## Preguntas abiertas

- ¿Roadmap de features Expo: paridad con web por rol?
- ¿Se archiva `mobile_flutter/` fuera del repo?
- ¿EAS project ID y credenciales store?

---

## Matriz de confianza

| Componente | Confianza |
|------------|-----------|
| Expo stack/rutas auth | verified |
| Expo backend URL | verified |
| Flutter flujos | verified |
| Flutter backend URL | verified |
| Estrategia producto mobile | inferred (decisión usuario: Expo oficial) |
