# Mobile Implementation Notes — Para ingeniería mobile

Notas operativas para implementar el rediseño sin improvisar.

---

## Stack actual (no cambiar)

| Tech | Versión | Nota |
|------|---------|------|
| Expo SDK | ~56 | Mantener |
| Expo Router | ~56 | File-based routing |
| TanStack Query | ^5 | Data layer |
| react-hook-form + zod | actual | Forms |
| StyleSheet | RN default | No introducir NativeWind sin decisión |

---

## Dependencias a añadir

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm add @expo-google-fonts/inter
npx expo install expo-font expo-haptics

# Evaluar en R4:
npx expo install react-native-reanimated react-native-gesture-handler
```

---

## Estructura de archivos propuesta

```
src/shared/
├── theme/
│   ├── colors.ts          # semantic colors
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── motion.ts
│   └── index.ts
├── ui/
│   ├── Button.tsx
│   ├── Text.tsx             # wrapper con variant prop
│   ├── TextInput.tsx
│   ├── AuthLayout.tsx       # reemplaza AuthScaffold
│   ├── AppShell.tsx
│   ├── ScreenHeader.tsx
│   ├── BottomTabBar.tsx
│   ├── BrandTitle.tsx       # update
│   ├── Card.tsx
│   ├── Banner.tsx
│   ├── FilterChips.tsx
│   ├── SkeletonCard.tsx
│   └── ... (mantener QueryBoundary, etc.)
```

---

## Orden de migración seguro

### Paso 1 — Theme sin romper nada

1. Crear `theme/` nuevo junto al `colors.ts` actual.
2. Hacer que `colors.ts` re-exporte desde semantic colors (adapter).
3. Cargar fonts en `app/_layout.tsx` con splash hasta loaded.

### Paso 2 — Componentes nuevos en paralelo

1. Crear `Button.tsx` nuevo; no borrar `AppButton` aún.
2. Migrar pantalla por pantalla: `login` primero.
3. Cuando todas las pantallas usen `Button`, eliminar `AppButton`.

### Paso 3 — Auth layout

1. Crear `AuthLayout`.
2. Migrar login → register → forgot → reset.
3. Migrar `index.tsx` welcome.
4. Deprecar `AuthScaffold` + `FormPanel`.

### Paso 4 — Tabs

Opción recomendada: **route group anidado**

```
app/
├── (funcionario)/
│   ├── _layout.tsx    # Stack + TabBar wrapper
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── nueva-solicitud.tsx  # o redirect
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── historial.tsx            # stack push
│   └── solicitud/[id].tsx
```

Alternativa más simple: TabBar custom dentro de `RoleHomeShell` sin cambiar rutas (menos idiomático).

### Paso 5 — Product screens

Migrar visuals manteniendo hooks y queries intactos.

---

## Font loading pattern

```tsx
// app/_layout.tsx
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;
  // ... providers
}
```

---

## Text component pattern

```tsx
// Evitar fontFamily suelta en cada pantalla
<Text variant="h1" color="primary">Título</Text>
<Text variant="p2" color="secondary">Descripción</Text>
```

---

## Button migration

```tsx
// Antes
<AppButton label="Login" variant="blue" />

// Después
<Button label="Iniciar sesión" variant="primary" fullWidth />
```

Mapeo: `green` → `primary`, `blue` → `secondary`.

---

## Colores — normalización

```ts
// Actual brandBlue rgb(0,50,77) = #00324D
// Spec institucional = #04324D
// Usar #04324D en theme nuevo; verificar contraste visual en dispositivo
```

---

## Assets

| Asset | Origen | Destino |
|-------|--------|---------|
| Logo SENA | `design/figma/onboarding/assets/logo-sena.png` | `assets/icons/logo-sena.png` |
| Wordmark | Componente `BrandTitle` (texto) | — |
| `main_top.png` | Legacy | **Eliminar** post R1 |
| `login_bottom.png` | Legacy | **Eliminar** post R1 |

---

## Invariantes (de `mobile-context-architecture.md`)

**No romper:**

- `AuthProvider` / `auth-context.tsx`
- `guards.ts` / `getRouteForAccess`
- `navigateForAccess` post-login
- Deep link `+native-intent.tsx` → reset-password
- Secure store para JWT
- Role groups `(funcionario)` / `(tecnico)`
- API client y env vars

---

## Testing

| Tipo | Acción |
|------|--------|
| Unit | Tests existentes deben pasar |
| Visual | Smoke manual por fase (ver acceptance criteria) |
| Component | Opcional: RN Testing Library para Button/TextInput |
| E2E | No existe; no bloquear redesign por esto |

---

## Performance

- `expo-image` para logos (ya en uso)
- Evitar `ScrollView` anidados en listas largas → `FlatList`
- Skeleton en lugar de spinners fullscreen
- Reanimated solo si se justifica; press opacity con `Pressable` style basta en R0–R3

---

## Convenciones de PR

1. Un PR por fase o sub-fase (R0, R1-auth, R2-tabs, etc.)
2. Incluir screenshots before/after
3. No mezclar cambios de lógica con redesign visual
4. Actualizar `mobile-acceptance-criteria.md` checklist en cada PR

---

## Preguntas resueltas (no reabrir sin product)

| Pregunta | Decisión |
|----------|----------|
| ¿Google OAuth? | No |
| ¿OTP verification? | No (v1) |
| ¿Dark mode? | No (v1) |
| ¿NativeWind? | No; StyleSheet + tokens |
| ¿Cambiar rutas API? | No |
| ¿Tab bar en auth? | No; solo post-login |

---

## Contacto con docs

| Necesidad | Documento |
|-----------|-----------|
| Por qué | `mobile-design-vision.md` |
| Qué reglas | `mobile-ux-principles.md` |
| Tokens | `mobile-design-system.md` + color/typography/spacing |
| Componentes | `mobile-component-spec.md` |
| Pantallas | `mobile-screen-specs.md` |
| Cuándo | `mobile-roadmap.md` |
| Done? | `mobile-acceptance-criteria.md` |
