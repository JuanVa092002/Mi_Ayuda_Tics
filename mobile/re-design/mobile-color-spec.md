# Mobile Color Spec

Paleta institucional obligatoria + sistema semántico para estados y superficies.

---

## Colores de marca (inmutables)

| Token | Hex | RGB | Uso permitido |
|-------|-----|-----|---------------|
| `brand.blue` | `#04324D` | 4, 50, 77 | Wordmark MI/TICS, botón Login (welcome), CTAs secundarios, iconos activos tab, links |
| `brand.green` | `#39A900` | 57, 169, 0 | Wordmark AYUDA, CTA primario, éxito, badge rol, logo SENA en contexto |

**Prohibido:** usar `#1FCC79` (verde Chefio original del kit base).

---

## Neutros y texto

| Token | Hex | Uso |
|-------|-----|-----|
| `surface.default` | `#FFFFFF` | Fondo principal de pantalla |
| `surface.muted` | `#F8FAFB` | Fondo alternativo sutil (pull area, tab bar bg) |
| `surface.card` | `#FFFFFF` | Cards sobre fondo muted |
| `text.primary` | `#2E3E5C` | Títulos, body, contenido principal |
| `text.secondary` | `#636E95` | Metadata, placeholders, hints |
| `text.tertiary` | `#97A0C3` | Labels deshabilitados, timestamps lejanos |
| `text.inverse` | `#FFFFFF` | Texto sobre brand.blue / brand.green |
| `text.link` | `#04324D` | Links inline, "Forgot password?" |
| `border.default` | `#E8ECF4` | Bordes de cards e inputs |
| `border.focus` | `#39A900` | Ring de focus en inputs |
| `overlay.scrim` | `rgba(4, 50, 77, 0.4)` | Modales, sheets |

---

## Estados semánticos

| Token | Hex | Uso |
|-------|-----|-----|
| `state.success` | `#39A900` | Validación OK, ticket resuelto |
| `state.success.bg` | `#E8F5E0` | Fondo banner éxito |
| `state.warning` | `#F5A623` | Pendiente atención, SLA próximo |
| `state.warning.bg` | `#FFF8E6` | Fondo banner warning |
| `state.error` | `#D32F2F` | Errores, validación fallida |
| `state.error.bg` | `#FDECEA` | Fondo banner error |
| `state.info` | `#04324D` | Información neutral institucional |
| `state.info.bg` | `#E8EEF2` | Fondo banner info |

---

## Mapeo estados de negocio → color

| Estado ticket/caso | Badge bg | Badge text |
|--------------------|----------|------------|
| Pendiente | `state.warning.bg` | `#B8860B` |
| En progreso | `state.info.bg` | `brand.blue` |
| Resuelto | `state.success.bg` | `brand.green` |
| Rechazado / error | `state.error.bg` | `state.error` |
| Aprobación pendiente (técnico) | `state.warning.bg` | `#B8860B` |

---

## Reglas de aplicación

### DO

- Fondo blanco default en el 90% de pantallas.
- Marca en CTAs, wordmark, badges y acentos de navegación.
- Cards blancas sobre `surface.muted` para separación sutil.
- Verde para **una** acción primaria por vista.

### DON'T

- Pantalla completa azul o verde.
- Gradients de marca.
- Múltiples CTAs verdes en la misma vista.
- Texto verde `brand.green` en body pequeño (contraste).
- Gris `panelGray` legacy (`#DED9D9`) — eliminado del sistema.

---

## Contrato semantic colors (TypeScript)

```ts
export const semanticColors = {
  brand: {
    blue: '#04324D',
    green: '#39A900',
  },
  text: {
    primary: '#2E3E5C',
    secondary: '#636E95',
    tertiary: '#97A0C3',
    inverse: '#FFFFFF',
    link: '#04324D',
  },
  surface: {
    default: '#FFFFFF',
    muted: '#F8FAFB',
    card: '#FFFFFF',
  },
  border: {
    default: '#E8ECF4',
    focus: '#39A900',
  },
  state: {
    success: '#39A900',
    successBg: '#E8F5E0',
    warning: '#F5A623',
    warningBg: '#FFF8E6',
    error: '#D32F2F',
    errorBg: '#FDECEA',
    info: '#04324D',
    infoBg: '#E8EEF2',
  },
} as const;
```

---

## Migración desde `colors.ts` actual

```ts
// Antes
brandBlue: 'rgb(0, 50, 77)'     // ≈ #00324D — normalizar a #04324D
brandGreen: 'rgb(57, 169, 0)'  // = #39A900 ✓
textDark: 'rgb(53, 74, 106)'   // ≈ #354A6A — migrar a #2E3E5C (Figma Main Text)
```

La diferencia `#00324D` vs `#04324D` es mínima pero **normalizar a `#04324D`** como fuente institucional acordada.

---

## Dark mode

**Fuera de scope v1.** El sistema se diseña light-only. No implementar hasta decisión de producto explícita.
