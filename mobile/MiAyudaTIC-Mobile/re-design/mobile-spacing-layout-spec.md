# Mobile Spacing & Layout Spec

Sistema de espaciado y layout para consistencia entre pantallas.

---

## Escala de spacing (base 4px)

| Token | px | Uso típico |
|-------|-----|------------|
| `space.1` | 4 | Gap mínimo interno |
| `space.2` | 8 | Padding icono, gap badge |
| `space.3` | 12 | Gap entre elementos relacionados |
| `space.4` | 16 | Padding card interno |
| `space.5` | 20 | **Padding horizontal pantalla** |
| `space.6` | 24 | Gap entre secciones |
| `space.8` | 32 | Separación bloques mayores |
| `space.10` | 40 | Espacio antes de CTA fijo |
| `space.12` | 48 | Header auth vertical |
| `space.16` | 64 | Separación hero → contenido |

---

## Layout de pantalla

### Márgenes horizontales

| Contexto | Padding horizontal |
|----------|-------------------|
| Pantalla default | `space.5` (20px) |
| Auth forms | `space.6` (24px) |
| Contenido en card | `space.4` (16px) |
| Botones full-width | `space.5`–`space.6` (contenedor) |

Ancho útil botón full-width en 375px con padding 24: **327px** (coincide con Figma Onboarding).

### Safe areas

| Edge | Comportamiento |
|------|----------------|
| Top | `SafeAreaView` + optional header |
| Bottom | Tab bar (56px) + safe area inset |
| Sides | Siempre respetar inset horizontal en landscape |

---

## Dimensiones fijas del kit

| Elemento | Valor | Fuente |
|----------|-------|--------|
| Botón altura | 56px | Figma Primary/Default |
| Botón radius | 32px (pill) | Figma |
| Input altura | 56px | Figma Text Input |
| Input radius | 32px | Figma |
| Tab bar altura | 56px + safe area | Estándar iOS/Android |
| Card radius | 16–24px | Adaptado Chefio |
| Logo SENA (welcome) | 178×163 | Figma Onboarding |
| Touch target mínimo | 44×44 | Apple HIG |

---

## Patrones de layout

### A — Auth centrado (welcome, login, recovery)

```
┌─────────────────────────────┐
│         space.12            │
│      [Brand wordmark]       │
│         space.8             │
│      [Logo SENA opt]        │
│         space.8             │
│      heading.h1 center      │
│         space.2             │
│      body.p2 center         │
│         flex spacer         │
│   [Button secondary]        │  ← Login en welcome
│         space.6 (25px)      │
│   [Button primary]          │  ← Sign Up / Submit
│         space.10            │
└─────────────────────────────┘
```

### B — App shell con tabs

```
┌─────────────────────────────┐
│ Header (role + title)       │  padding space.5
├─────────────────────────────┤
│                             │
│ ScrollView content          │  padding space.5
│                             │
├─────────────────────────────┤
│ Tab bar                     │  56px + inset
└─────────────────────────────┘
```

### C — Lista con search

```
┌─────────────────────────────┐
│ SearchField                 │  margin bottom space.4
│ Filter chips (horizontal)   │  margin bottom space.4
│ ┌─────────────────────────┐ │
│ │ Card / ListItem         │ │  gap space.3 entre items
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### D — Detalle con timeline

```
┌─────────────────────────────┐
│ Back + title (ScreenHeader) │
├─────────────────────────────┤
│ StatusBadge + metadata      │
│ space.6                     │
│ body.p2 description         │
│ space.8                     │
│ SectionHeader "Timeline"    │
│ StatusTimeline              │
│ space.8                     │
│ [CTA fijo si aplica]        │
└─────────────────────────────┘
```

---

## Grid y alineación

- **Una columna** siempre en mobile; no layouts multi-columna.
- Contenido centrado en auth; alineado a la izquierda en producto.
- CTAs full-width alineados al mismo margen que inputs.
- Cards ocupan 100% del ancho útil menos padding.

---

## Espaciado vertical de referencia (Onboarding Figma)

| Entre | Gap |
|-------|-----|
| Wordmark → logo | 32px |
| Título → descripción | 7px |
| Descripción → botón Login | 51px |
| Login → Sign Up | 25px |
| Sign Up → área inferior | 101px |

Usar como referencia de ritmo, no como valores rígidos en todas las pantallas.

---

## Contrato layout (TypeScript)

```ts
export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24,
  8: 32, 10: 40, 12: 48, 16: 64,
} as const;

export const layout = {
  screenPaddingX: 20,
  authPaddingX: 24,
  buttonWidth: 327,       // en 375 viewport
  buttonHeight: 56,
  inputHeight: 56,
  tabBarHeight: 56,
  maxContentWidth: 327,   // forms
} as const;
```

---

## Responsive

- Diseño base: **375pt** ancho.
- En pantallas más anchas: contenido centrado con `maxWidth` 480 en tablets (futuro); por ahora solo phone.
- Usar `useSafeAreaInsets()` para padding dinámico, no valores fijos de home indicator.
