# Mobile Screen Specs — Pantalla por pantalla

Especificación UX/visual por ruta. La lógica de negocio y navegación existente se mantiene; cambia el shell visual.

**Leyenda:** 🟢 Conservar patrón mockup · 🟡 Adaptar · 🔴 Eliminar del actual · 🆕 Nuevo

---

## Auth & onboarding

### `/` — Welcome / App Gate (`index.tsx`)

| Campo | Spec |
|-------|------|
| Layout | Patrón A (auth centrado) |
| Fondo | `surface.default` blanco |
| Brand | `BrandTitle` + logo SENA 178×163 🟢 |
| Título | "Gestiona el soporte técnico del CTPI" — `heading.h1` 🟢 |
| Body | "Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real." — `body.p2` 🟢 |
| CTA secundario | **Login** — `Button secondary` (azul) 🟢 |
| CTA primario | **Registrarse** — `Button primary` (verde) 🟡 Sign Up → Registrarse |
| Eliminar | Bootstrap UI genérica actual 🔴 |

**Navegación:** Login → `/(auth)/login` · Registrarse → `/(auth)/register`

**Referencia Figma:** node `11993:576` · PDF p.1

---

### `/(auth)/login` — Login

| Campo | Spec |
|-------|------|
| Layout | `AuthLayout` blanco 🟡 |
| Título | "¡Bienvenido de nuevo!" — `heading.h1` 🟡 |
| Subtítulo | "Ingresa a tu cuenta institucional" — `body.p2` 🟡 |
| Campos | Email + contraseña — `TextInput` 🟢 |
| Password | Toggle show/hide trailing icon 🟢 |
| Link | "¿Olvidaste tu contraseña?" — `text.link` 🟢 |
| CTA | "Iniciar sesión" — `Button primary` verde 🟡 |
| Footer | "¿No tienes cuenta? Regístrate" 🟢 |
| Eliminar | `AuthScaffold` header image 🔴 |
| Eliminar | Google OAuth UI 🔴 |
| Eliminar | `FormPanel` gris 🔴 |

**Referencia:** Figma `160:22` · PDF p.2

---

### `/(auth)/register` — Registro

| Campo | Spec |
|-------|------|
| Layout | `AuthLayout` |
| Título | "Crear cuenta" |
| Campos | Nombre, email, contraseña, rol (funcionario/técnico) |
| Rol | Segmented control o select — no picker crudo |
| Foto | Avatar opcional circular — mantener lógica `expo-image-picker` |
| Validación | `PasswordRuleChecklist` debajo de password 🟢 |
| CTA | "Registrarse" — `Button primary` |
| Footer | Link a login |

**Referencia:** PDF p.3

---

### `/(auth)/forgot-password` — Recuperar contraseña

| Campo | Spec |
|-------|------|
| Título | "Recuperar contraseña" 🟢 |
| Subtítulo | "Ingresa tu correo institucional" 🟡 |
| Campo | Email — `TextInput` |
| CTA | "Enviar enlace" — `Button primary` |
| Success | `AuthFlowPanel` tone success: "Revisa tu correo" 🟢 |

**Referencia:** Figma `192:113` · PDF p.5

---

### `/(auth)/reset-password/[token]` — Restablecer contraseña

| Campo | Spec |
|-------|------|
| Título | "Nueva contraseña" 🟡 |
| Campos | Password + confirmar |
| Validación | `PasswordRuleChecklist` |
| CTA | "Guardar" — `Button primary` |
| Invalid token | `AuthFlowPanel` error |
| Success | `AuthFlowPanel` success → redirect login |

**Referencia:** PDF p.7

---

### `/(auth)/pending-approval` — Aprobación pendiente

| Campo | Spec |
|-------|------|
| Layout | Centrado, `AuthFlowPanel` info |
| Título | "Cuenta en revisión" |
| Mensaje | Explicar que un administrador debe aprobar la cuenta técnico |
| CTA | "Cerrar sesión" — `Button outline` |

---

### `/(auth)/session-expired` · `lider-not-supported`

Mismo patrón `AuthFlowPanel` con tone `warning` o `error`. Copy institucional actual se mantiene.

---

## Funcionario

### `/(funcionario)/home` — Dashboard

| Campo | Spec |
|-------|------|
| Shell | `AppShell` + bottom tabs 🆕 |
| Header | Badge FUNCIONARIO + "Tu soporte técnico" + logo SENA pequeño 🟡 |
| Stats | 3 mini-cards horizontales: Total / Pendientes / Resueltas 🟡 |
| Sección | `SectionHeader` "Recientes" + "Ver todo" 🟢 |
| Lista | Max 3 `SolicitudListItem` 🟢 |
| CTA flotante | Opcional FAB verde "Nueva solicitud" O tab create 🟡 |
| Eliminar | Session card prominente → mover a Profile 🔴 |

**Referencia:** PDF p.8–11 (home + categories → adaptar a stats + recientes)

---

### `/(funcionario)/nueva-solicitud` — Crear solicitud

| Campo | Spec |
|-------|------|
| Header | `ScreenHeader` con back |
| Form | Campos actuales de `SolicitudForm` con `TextInput` / `SelectField` 🟡 |
| Foto | Picker con preview card 🟡 |
| CTA fijo bottom | "Enviar solicitud" — `Button primary` 🟢 |
| Success | Navigate a detalle o banner success 🟡 |

**Referencia:** PDF p.12–14 (upload flow → simplificar a formulario institucional)

---

### `/(funcionario)/historial` — Historial

| Campo | Spec |
|-------|------|
| Header | "Mis solicitudes" |
| Search | `SearchField` 🟢 |
| Filters | `FilterChips`: Todas / Pendiente / En progreso / Resuelta 🟡 |
| Lista | `SolicitudListItem` con pull-to-refresh 🟢 |
| Empty | `EmptyState` con CTA "Crear solicitud" |

---

### `/(funcionario)/solicitud/[id]` — Detalle solicitud

| Campo | Spec |
|-------|------|
| Header | Back + ID/título |
| Status | `StatusBadge` prominente |
| Meta | Fecha, categoría — `body.caption` |
| Descripción | `body.p1` |
| Timeline | `StatusTimeline` 🟢 |
| Evidencia | Imágenes en grid si existen 🟡 |

**Referencia:** PDF p.23–25 (recipe detail → case detail)

---

## Técnico

### `/(tecnico)/home` — Casos

| Campo | Spec |
|-------|------|
| Shell | `AppShell` + tabs |
| Header | Badge TÉCNICO + "Casos asignados" |
| Tabs internos | "Por resolver" / "Mis casos" — segmented control 🟢 |
| Search | `SearchField` 🟢 |
| Lista | `CasoListItem` |
| Empty | `EmptyState` contextual |

---

### `/(tecnico)/caso/[id]` — Detalle caso

Igual estructura que detalle solicitud + CTA "Resolver caso" si aplica.

---

### `/(tecnico)/caso/[id]/resolver` — Resolver

| Campo | Spec |
|-------|------|
| Header | "Resolver caso" |
| Form | `ResolverCasoForm` con nuevos inputs |
| CTA | "Marcar como resuelto" — `Button primary` |

---

## Pantallas nuevas (scaffolding UI)

### 🆕 `/(tabs)/notifications` — Alertas

| Campo | Spec |
|-------|------|
| Header | "Notificaciones" |
| Lista | Cards con: icono, título, descripción, timestamp |
| Tipos | Cambio de estado, asignación, resolución |
| Empty | "No tienes notificaciones" |
| **Backend** | Scaffolding UI; integración API en fase posterior |

**Referencia:** PDF p.20

---

### 🆕 `/(tabs)/profile` — Perfil

| Campo | Spec |
|-------|------|
| Header | Avatar + nombre + email |
| Meta | Rol, institución CTPI |
| Acciones | Cerrar sesión — `Button outline destructive` |
| Futuro | Editar perfil (placeholder deshabilitado) |

**Referencia:** PDF p.21–22 (adaptar de profile social)

---

## Bottom tab bar (autenticado)

| Tab | Icono sugerido | Ruta funcionario | Ruta técnico |
|-----|-----------------|------------------|--------------|
| Inicio | home | `/(funcionario)/home` | `/(tecnico)/home` |
| Crear | plus.circle | `/(funcionario)/nueva-solicitud` | `/(tecnico)/home?tab=activos` |
| Alertas | bell | `/notifications` | `/notifications` |
| Perfil | person | `/profile` | `/profile` |

---

## Estados transversales

### Loading

| Pantalla | Patrón |
|----------|--------|
| Lista | 3× skeleton |
| Detalle | Skeleton header + 4 líneas |
| Form submit | Button loading |

### Empty

Siempre con ilustración ligera + copy + CTA contextual.

### Error

`ErrorState` con retry en listas; `Banner` error en forms.

### Success

`Banner` success o navegación a pantalla de confirmación.

---

## Qué NO cambia por pantalla

- Rutas Expo Router existentes (se añaden tabs/notifications/profile)
- Hooks de data (`useQuery`, mutations)
- Schemas Zod y validación
- Guards y `auth-context`
- Deep links reset password

---

## Matriz PDF → Pantalla real

| PDF # | Mockup | Pantalla MiAyudaTIC |
|-------|--------|-------------------|
| 1 | Onboarding | `/` welcome |
| 2 | Login | `/(auth)/login` |
| 3 | Sign Up | `/(auth)/register` |
| 4–6 | Email OTP | **Fuera de scope** (no en flujo actual) |
| 5 | Password recovery | `/(auth)/forgot-password` |
| 7 | Reset password | `/(auth)/reset-password` |
| 8–11 | Home + search + filters | Role homes + historial |
| 12–14 | Upload recipe | `nueva-solicitud` |
| 15–19 | Categories/lists | historial + filtros |
| 20 | Notifications | **Nueva** notifications |
| 21–22 | Profile | **Nueva** profile |
| 23–25 | Detail | solicitud/caso detalle |
