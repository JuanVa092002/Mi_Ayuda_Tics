# Mobile Typography Spec

Fuente única del design system: **Inter**. Cargar vía `@expo-google-fonts/inter`.

---

## Familias y pesos

| Peso | Token | Uso |
|------|-------|-----|
| 400 Regular | `Inter_400Regular` | Texto de soporte, hints |
| 500 Medium | `Inter_500Medium` | Body, labels secundarios |
| 700 Bold | `Inter_700Bold` | Títulos, CTAs, wordmark |

**No usar** SF Pro Text salvo que el sistema lo renderice en status bar nativo.

---

## Escala tipográfica (del Style Guide Figma)

### Headers — Inter Bold (700)

| Token | Size | Line height | Letter spacing | Uso |
|-------|------|-------------|----------------|-----|
| `heading.h1` | 22 | 32 | 0.5 | Título de pantalla, valor propuesta |
| `heading.h2` | 17 | 27 | 0.5 | Subtítulos de sección |
| `heading.h3` | 15 | 25 | 0.5 | Títulos de card, labels fuertes |

### Body — Inter Medium (500)

| Token | Size | Line height | Letter spacing | Uso |
|-------|------|-------------|----------------|-----|
| `body.p1` | 17 | 27 | 0.5 | Párrafos destacados |
| `body.p2` | 15 | 25 | 0.5 | Body default, descripciones |
| `body.caption` | 12 | 15 | 0.5 | Timestamps, metadata, hints |

### Especializados

| Token | Font | Size | Line height | Letter spacing | Uso |
|-------|------|------|-------------|----------------|-----|
| `display.brand` | Bold 700 | 22 | 32 | 0.5 | Wordmark MI AYUDA TICS |
| `button.label` | Bold 700 | 15 | auto (~18) | 0.105 | Labels de botones pill |
| `label.field` | Medium 500 | 12 | 16 | 0.3 | Labels sobre inputs |
| `badge` | Bold 700 | 11 | 14 | 1.0 | Role badge, status uppercase |

---

## Wordmark institucional

Tres nodos de texto (no un solo string) para control de color:

| Parte | Color | Token color |
|-------|-------|-------------|
| MI | `#04324D` | `brand.blue` |
| AYUDA | `#39A900` | `brand.green` |
| TICS | `#04324D` | `brand.blue` |

Preset: `display.brand` aplicado a cada segmento con color override.

---

## Jerarquía por contexto de pantalla

### Auth (login, register, recovery)

```
heading.h1     → "Welcome Back!" / "Password recovery"
body.p2        → subtítulo instructivo
label.field    → labels de campo (opcional si placeholder basta)
body.p2        → input value
body.p2 + link → "Forgot password?" / "Sign Up"
button.label   → CTA
```

### Home rol

```
badge          → "FUNCIONARIO" / "TÉCNICO"
heading.h1     → título del dashboard
body.p2        → subtítulo contextual
heading.h2     → sección "Recientes" / "Por resolver"
body.caption   → timestamps, metadata en cards
```

### Detalle solicitud/caso

```
heading.h2     → ID o título del ticket
body.p2        → descripción
heading.h3     → secciones "Timeline", "Evidencia"
body.caption   → fechas en timeline
```

---

## Reglas de uso

1. **Inter 700** solo para títulos, CTAs y énfasis fuerte — no en párrafos largos.
2. **Inter 500** para todo body legible.
3. **Inter 400** solo para texto terciario o deshabilitado.
4. Máximo **2 tamaños** de fuente visibles simultáneamente en un bloque.
5. `textAlign: center` en auth welcome; `left` en listas y detalle.
6. No escalar con `fontScale` bloqueado; respetar ajustes de accesibilidad del OS.

---

## Implementación Expo

```bash
npx expo install @expo-google-fonts/inter expo-font
```

```ts
// theme/typography.ts
export const typography = {
  h1: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 32, letterSpacing: 0.5 },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 17, lineHeight: 27, letterSpacing: 0.5 },
  h3: { fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 25, letterSpacing: 0.5 },
  p1: { fontFamily: 'Inter_500Medium', fontSize: 17, lineHeight: 27, letterSpacing: 0.5 },
  p2: { fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 25, letterSpacing: 0.5 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 15, letterSpacing: 0.5 },
  button: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.105 },
} as const;
```

Componente sugerido: `<Text variant="h1" color="primary">`.

---

## Contraste mínimo

| Combinación | Ratio | OK |
|-------------|-------|-----|
| `text.primary` on `surface.default` | ~8.5:1 | ✓ |
| `text.inverse` on `brand.blue` | ~11:1 | ✓ |
| `text.inverse` on `brand.green` | ~3.8:1 | ⚠ Usar solo en botones grandes |
| `text.secondary` on `surface.default` | ~4.6:1 | ✓ |

Para texto verde sobre blanco usar solo elementos grandes (wordmark "AYUDA"), no body pequeño.
