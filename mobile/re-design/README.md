# MiAyudaTIC Mobile — Rediseño institucional premium

Documentación base del rediseño visual y UX para la app mobile nativa. **Solo mobile.** No modifica web, backend ni lógica de negocio.

## Qué es esto

Un sistema de diseño y especificaciones operativas que traduce el paradigma visual del mockup Chefio (adaptado a MiAyudaTICS) a una app institucional premium, confiable y nativa para el CTPI.

## Fuentes de verdad

| Fuente | Ubicación | Uso |
|--------|-----------|-----|
| Mockup Figma | [Chefio UI Kit](https://www.figma.com/design/Gi6VjjQY1j40IVAVQMfhdf/) | Paradigma visual, componentes, spacing |
| PDF adaptado | `Chefio - Recipe App UI Kit.pdf` | Flujos pantalla por pantalla |
| Extracción Onboarding | `../../design/figma/onboarding/` | Tokens y medidas pixel-perfect |
| App actual | `../src/`, `../app/` | Inventario real, rutas, deuda UI |
| Arquitectura | `../mobile-context-architecture.md` | Invariantes que no se rompen |

## Índice de documentos

| Documento | Contenido |
|-----------|-----------|
| [mobile-design-vision.md](./mobile-design-vision.md) | Dirección de producto/diseño, Fase 1 descubrimiento |
| [mobile-ux-principles.md](./mobile-ux-principles.md) | Principios UX obligatorios |
| [mobile-design-system.md](./mobile-design-system.md) | Overview del sistema + contratos |
| [mobile-typography-spec.md](./mobile-typography-spec.md) | Escala tipográfica Inter |
| [mobile-color-spec.md](./mobile-color-spec.md) | Paleta institucional + semántica |
| [mobile-spacing-layout-spec.md](./mobile-spacing-layout-spec.md) | Grid, spacing, layout patterns |
| [mobile-component-spec.md](./mobile-component-spec.md) | Catálogo de componentes y variantes |
| [mobile-motion-spec.md](./mobile-motion-spec.md) | Animación e interacción |
| [mobile-screen-specs.md](./mobile-screen-specs.md) | Spec pantalla por pantalla |
| [mobile-roadmap.md](./mobile-roadmap.md) | Roadmap visual por fases |
| [mobile-acceptance-criteria.md](./mobile-acceptance-criteria.md) | Criterios de “premium done” |
| [mobile-implementation-notes.md](./mobile-implementation-notes.md) | Notas para ingeniería mobile |

## Alcance

### Se rediseña

- Shells visuales (auth, home, listas, detalle, estados vacío/error)
- Tokens, tipografía, color, spacing
- Componentes UI compartidos en `src/shared/ui/`
- Navegación visual (incluye bottom tab bar institucional)
- Pantallas nuevas de scaffolding: perfil, notificaciones (UI only)

### No se toca

- Web frontend (`client/`)
- Backend / API / contratos de datos
- Guards, auth-context, schemas de negocio
- Lógica de roles, aprobación técnico, flujos de solicitud/caso
- iOS nativo fuera de Expo/RN

## Colores institucionales (obligatorios)

| Nombre | Hex |
|--------|-----|
| Azul institucional | `#04324D` |
| Verde institucional | `#39A900` |

## Criterio de lectura

Un ingeniero o diseñador nuevo debe poder leer estos documentos en orden (README → vision → design-system → specs) y saber **qué construir**, **cómo debe verse** y **qué reglas no romper**.

## Orden de implementación sugerido

1. Tokens + Inter fonts (`theme/`)
2. Componentes base (Button, Input, Card, Badge)
3. Auth + welcome (splash/onboarding, login, recovery)
4. Role shells + bottom nav
5. Listas y detalle
6. Estados vacío/error/éxito
7. Perfil y notificaciones (scaffolding)

Ver [mobile-roadmap.md](./mobile-roadmap.md) para el desglose por fases.
