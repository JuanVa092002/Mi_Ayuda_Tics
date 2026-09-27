# Design System — MiAyudaTIC

---

## Verificado

### Brand colors

| Token | Hex | Uso |
|-------|-----|-----|
| primary / azul-sena | `#04324d` | Headers, nav, títulos |
| accent / verde-sena | `#39a900` | CTAs, éxito, botones primarios |
| background | `#F1F5F9` / `#EEF0F5` | Fondo app |
| surface | `#FFFFFF` | Cards, paneles |

**Web:** `client/tailwind.config.js`, `client/src/index.css`  
**Mobile:** `mobile/.../src/shared/theme/colors.ts` — `rgb(57,169,0)`, `rgb(0,50,77)`

### Typography

| Familia | Uso |
|---------|-----|
| Public Sans | Primary UI (web) |
| Plus Jakarta Sans | Accent headings (web) |
| System default | Mobile RN |

**Web:** Google Fonts en `client/index.html`.

### Iconography

- **Web:** Material Symbols Outlined (activo).
- **Mobile:** Texto + SVG assets en `assets/icons/`.

### Component patterns (web)

| Patrón | Clases / ubicación |
|--------|-------------------|
| Premium tables | `.premium-table`, `.premium-card` (`index.css`) |
| Forms | `.input-error`, `.field-error`, react-hook-form |
| Badges estado | `.badge-base` + Tailwind |
| Buttons loading | `.btn-loading`, `.spinner` |

### Mobile UI kit

`src/shared/ui/`: `AuthScaffold`, `FormField`, `AppButton`, `FormPanel`, `BrandTitle`.

### Reference mockup

`client/src/assets/mockups/stitch_academic_ticket_system_redesign/institutional_enterprise/DESIGN.md` — tokens Material-style extendidos.

### No usar (instalado pero inactivo)

- Font Awesome (web package.json)
- Bootstrap / MUI / shadcn

---

## Inferido

- Mobile adoptará mismos tokens al expandir más allá de auth screens.

---

## Riesgos

- Drift `#1B2A4A` en reglas cursor antiguas vs `#04324d` real.
- `logoSena.png` posiblemente faltante.

---

## Preguntas abiertas

- ¿Design system package compartido web+mobile?

---

## Matriz de confianza

| Token | Nivel |
|-------|-------|
| Colors web | verified |
| Colors mobile | verified |
| Full DS mobile | partial |
