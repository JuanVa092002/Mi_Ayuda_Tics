# DESIGN_SYSTEM.md — MiAyudaTIC

**Status:** Active  
**Last Updated:** 2026-10-11  
**Audience:** engineering, design  
**Domain:** engineering  

---

> Visual and interaction standards for web + mobile. **Code wins on conflict** — verify tokens in `client/tailwind.config.js` and `mobile/.../theme/colors.ts`.

---

## Brand colors

| Token | Hex | Uso |
|-------|-----|-----|
| primary / azul-sena | `#04324d` | Headers, nav, títulos |
| accent / verde-sena | `#39a900` | CTAs, éxito, botones primarios |
| background | `#F1F5F9` / `#EEF0F5` | Fondo app |
| surface | `#FFFFFF` | Cards, paneles |

**Web:** [`client/tailwind.config.js`](../client/tailwind.config.js), [`client/src/index.css`](../client/src/index.css)  
**Mobile:** [`mobile/MiAyudaTIC-Mobile/src/shared/theme/colors.ts`](../mobile/MiAyudaTIC-Mobile/src/shared/theme/colors.ts)

**Rule:** Never use `#1B2A4A` or ad-hoc blues — institutional tokens only.

---

## Typography

| Familia | Uso |
|---------|-----|
| Public Sans | Primary UI (web) |
| Plus Jakarta Sans | Accent headings (web) |
| System default | Mobile React Native |

**Web:** Google Fonts in [`client/index.html`](../client/index.html).

---

## Iconography

- **Web:** Material Symbols Outlined (active).
- **Mobile:** Text + SVG in [`mobile/MiAyudaTIC-Mobile/assets/icons/`](../mobile/MiAyudaTIC-Mobile/assets/icons/).

**Do not use:** Font Awesome (installed but inactive), Bootstrap, MUI, shadcn.

---

## Component patterns (web)

| Patrón | Clases / ubicación |
|--------|-------------------|
| Premium tables | `.premium-table`, `.premium-card` (`index.css`) |
| Forms | `.input-error`, `.field-error`, react-hook-form |
| Badges estado | `.badge-base` + Tailwind |
| Buttons loading | `.btn-loading`, `.spinner` |

---

## Mobile UI kit

[`mobile/MiAyudaTIC-Mobile/src/shared/ui/`](../mobile/MiAyudaTIC-Mobile/src/shared/ui/):

- `AuthScaffold`, `FormField`, `AppButton`, `FormPanel`, `BrandTitle`

New screens must reuse these primitives before inventing one-off styles.

---

## Premium bar (all surfaces)

| Rule | Web | Mobile |
|------|-----|--------|
| Loading | Every async action | Skeleton lists where applicable |
| Empty | Actionable copy | Same |
| Errors | Inline field errors; toast for global network | Alert + retry |
| Hierarchy | One primary CTA per screen | One green primary CTA |
| Language | Spanish (Colombia), institutional tone | Same |

Detail: [`quality-bar.md`](quality-bar.md) § Premium UX.

---

## Reference mockup

[`client/src/assets/mockups/stitch_academic_ticket_system_redesign/institutional_enterprise/DESIGN.md`](../client/src/assets/mockups/stitch_academic_ticket_system_redesign/institutional_enterprise/DESIGN.md) — extended Material-style tokens.

---

## State badges (tickets)

Align with [`contracts.md`](contracts.md) states: `solicitado`, `asignado`, `pendiente`, `finalizado`. Use consistent color mapping across web tables and mobile lists.

---

## Open questions

- Shared design-system package for web + mobile? **Default: no** until Stage 2 — duplicate tokens in both theme files, keep in sync manually.

---

## References

- Product premium definition: [`product.md`](product.md)
- Design Engineer role: [`agents.md`](agents.md)
- Skill: [`.cursor/skills/design-system/SKILL.md`](../.cursor/skills/design-system/SKILL.md)
