# Mobile Design System — Overview y contratos

Sistema de diseño unificado para MiAyudaTIC mobile. Todos los valores deben vivir en `src/shared/theme/` y consumirse vía componentes en `src/shared/ui/`.

---

## Arquitectura de tokens

```
src/shared/theme/
├── colors.ts          → paleta + semantic colors
├── typography.ts      → escala Inter + presets
├── spacing.ts         → escala 4px base
├── radius.ts          → border radii
├── shadows.ts         → elevación mínima
├── motion.ts          → duraciones y easings
└── index.ts           → re-exports
```

---

## Contratos de design tokens

### Contrato: `ColorToken`

```ts
type ColorToken =
  | 'brand.blue'
  | 'brand.green'
  | 'text.primary'
  | 'text.secondary'
  | 'text.inverse'
  | 'text.link'
  | 'surface.default'
  | 'surface.muted'
  | 'surface.card'
  | 'border.default'
  | 'border.focus'
  | 'state.success'
  | 'state.warning'
  | 'state.error'
  | 'state.info'
  | 'overlay.scrim';
```

**Regla:** Las pantallas consumen `semantic.*`, nunca hex directo.

### Contrato: `TypographyPreset`

```ts
type TypographyPreset =
  | 'display.brand'      // MI AYUDA TICS wordmark
  | 'heading.h1'
  | 'heading.h2'
  | 'heading.h3'
  | 'body.p1'
  | 'body.p2'
  | 'body.caption'
  | 'button.label'
  | 'label.field'
  | 'badge';
```

### Contrato: `SpacingScale`

Base **4px**. Tokens: `space.1` (4) … `space.16` (64). Ver [mobile-spacing-layout-spec.md](./mobile-spacing-layout-spec.md).

### Contrato: `RadiusScale`

| Token | Valor | Uso |
|-------|-------|-----|
| `radius.sm` | 8 | Chips, badges internos |
| `radius.md` | 16 | Cards pequeñas |
| `radius.lg` | 24 | Cards estándar |
| `radius.pill` | 32 | Botones, inputs |
| `radius.full` | 9999 | Avatares circulares |

---

## Contratos de componentes (resumen)

Detalle completo en [mobile-component-spec.md](./mobile-component-spec.md).

### Button

```ts
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'medium' | 'small';
type ButtonState = 'default' | 'pressed' | 'disabled' | 'loading';
```

| Variant | Background | Text | Uso |
|---------|------------|------|-----|
| `primary` | `brand.green` | white | CTA principal |
| `secondary` | `brand.blue` | white | CTA secundario fuerte (Login en welcome) |
| `outline` | transparent | `brand.blue` | Acciones alternativas |
| `ghost` | transparent | `brand.blue` | Links en toolbar |
| `destructive` | `state.error` | white | Eliminar, cancelar crítico |

### TextInput

```ts
type InputState = 'empty' | 'focus' | 'filled' | 'success' | 'warning' | 'error' | 'disabled';
```

Altura **56px**, radius `pill`, icono leading opcional, trailing para password toggle.

### Card

```ts
type CardVariant = 'elevated' | 'outlined' | 'flat';
```

Default: `elevated` con sombra mínima, radius `lg`, padding `space.4`.

### StatusBadge

Mapeo de estados de negocio → color semántico. Ver component spec.

### Navigation

```ts
type TabId = 'home' | 'create' | 'notifications' | 'profile';
```

Tabs visibles según rol; tab `create` cambia label/icono por rol.

---

## Mapeo legacy → nuevo

| Actual (`colors.ts`) | Nuevo token |
|----------------------|-------------|
| `brandGreen` | `brand.green` `#39A900` |
| `brandBlue` | `brand.blue` `#04324D` |
| `textDark` | `text.primary` `#2E3E5C` |
| `panelGray` | **Eliminar** — usar `surface.default` |
| `inputWhite` | `surface.card` / input bg `#FFFFFF` |
| `error` | `state.error` |

| Actual componente | Acción |
|-------------------|--------|
| `AppButton` | Reemplazar por `Button` con variants |
| `AuthScaffold` + `FormPanel` | Reemplazar por `AuthLayout` blanco |
| `FormField` | Reemplazar por `TextInput` con estados |
| `RoleHomeShell` | Evolucionar a `AppShell` + bottom tabs |

---

## Referencias cruzadas

| Tema | Documento |
|------|-----------|
| Colores | [mobile-color-spec.md](./mobile-color-spec.md) |
| Tipografía | [mobile-typography-spec.md](./mobile-typography-spec.md) |
| Layout | [mobile-spacing-layout-spec.md](./mobile-spacing-layout-spec.md) |
| Componentes | [mobile-component-spec.md](./mobile-component-spec.md) |
| Motion | [mobile-motion-spec.md](./mobile-motion-spec.md) |
| Pantallas | [mobile-screen-specs.md](./mobile-screen-specs.md) |

---

## Fuente Figma

- File key: `Gi6VjjQY1j40IVAVQMfhdf`
- Style Guide page: `Style Guide & Component` (`103:157`)
- Onboarding extraído: `../../design/figma/onboarding/`

El verde Chefio original (`#1FCC79`) **no se usa**. Siempre institucional `#39A900`.
