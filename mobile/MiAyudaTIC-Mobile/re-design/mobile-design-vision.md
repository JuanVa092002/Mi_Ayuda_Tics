# Mobile Design Vision — Dirección de producto y diseño

## North star

MiAyudaTIC mobile debe sentirse como una **app institucional premium**: ordenada, confiable, rápida de entender y nativa. No como una web embebida ni como un portal enterprise antiguo.

El usuario debe percibir en los primeros 3 segundos: *“esto es serio, es del CTPI, y me va a ayudar sin fricción”*.

---

## Fase 1 — Descubrimiento y alineación

### Fuentes analizadas

1. **Figma Chefio UI Kit** (`Gi6VjjQY1j40IVAVQMfhdf`) — paradigma visual world-class
2. **PDF adaptado** (`Chefio - Recipe App UI Kit.pdf`) — 25 pantallas traducidas a MiAyudaTICS
3. **Código mobile actual** — Expo Router, 2 role groups, UI kit mínimo en `src/shared/ui/`
4. **Extracción Onboarding** — `design/figma/onboarding/` con medidas y tokens reales

### Estado actual de la app (baseline)

| Área | Hoy | Problema |
|------|-----|----------|
| Auth | `AuthScaffold` + `FormPanel` gris curvo | No coincide con mockup; sensación “formulario web” |
| Botones | `borderRadius: 8`, system font | No premium; no pill institucional |
| Home | `RoleHomeShell` sin bottom nav | Falta patrón de app nativa moderna |
| Tokens | Solo `colors.ts` (7 valores) | Sin escala tipográfica, spacing ni semántica |
| Tipografía | System default | Inter no cargada |
| Perfil / notificaciones | No existen | PDF las prevé; app no |
| Listas | Cards funcionales básicas | Sin ritmo visual Chefio |

### Lo que el mockup hace bien (conservar)

| Patrón | Por qué funciona | Traducción institucional |
|--------|------------------|--------------------------|
| Fondo blanco + mucho aire | Legibilidad, premium | Default en todas las pantallas |
| Botones pill full-width | CTA claro, táctil | Login, crear solicitud, acciones primarias |
| Jerarquía Inter Bold/Medium | Escaneo rápido | Títulos institucionales + copy de soporte |
| Inputs con estados (empty/focus/error) | Confianza en formularios | Auth, nueva solicitud, resolver caso |
| Cards con imagen + metadata | Listas escaneables | Solicitudes y casos |
| Bottom navigation | App nativa real | Home, acción rol, alertas, perfil |
| Search + chips de filtro | Descubrimiento rápido | Buscar casos/solicitudes por estado |
| Una acción principal por pantalla | Sin parálisis | Mantener en todo el rediseño |
| Timeline / detalle estructurado | Claridad operativa | Detalle solicitud/caso |
| Motion sutil en transiciones | Pulido nativo | Stack push, tab switch, sheet |

### Lo que se adapta (no copiar literal)

| Del mockup Chefio | Adaptación MiAyudaTIC |
|-------------------|----------------------|
| Verde Chefio `#1FCC79` | Verde institucional `#39A900` |
| Azul genérico del kit | Azul institucional `#04324D` |
| “Recipes”, “followers”, “likes” | Solicitudes, casos, estados, técnico asignado |
| Upload recipe (4 pasos) | Nueva solicitud (campos de negocio actuales) |
| Categorías Food/Drink | Estados, prioridad, tipo de incidencia |
| Tab “Scan” | Acción contextual por rol (nueva solicitud / casos) |
| Sign Up genérico | Registro con rol funcionario/técnico |
| OTP email verification | Solo si el backend lo requiere; hoy no está en flujo |
| Google “Or continue with” | **Eliminar** del scope visual (no en producto actual) |
| Profile con recipes grid | Perfil institucional: datos sesión, rol, logout |
| Notificaciones sociales | Notificaciones operativas (cambio estado, asignación) |

### Lo que se elimina

| Elemento | Razón |
|----------|-------|
| `FormPanel` gris con `borderRadius: 60` | Rompe identidad premium; reemplazar por layout blanco |
| Header images decorativas (`main_top.png`) en auth | Sustituir por wordmark + logo SENA del mockup |
| Saturación de color de marca en fondos | Marca solo en acentos, CTAs y wordmark |
| Sombras pesadas (`elevation: 2` en botones) | Sombras mínimas solo en cards flotantes |
| UI “enterprise” densa | Más aire, menos bordes, menos ruido |
| Copiar layout web | Mobile-first real con patrones nativos |

---

## Dirección visual institucional

### Personalidad

- **Confiable** — colores institucionales usados con disciplina
- **Clara** — una acción principal, jerarquía tipográfica fuerte
- **Moderna** — pill buttons, cards suaves, bottom nav
- **Institucional** — SENA visible, copy del CTPI, sin gamificación
- **Nativa** — safe areas, gestos, feedback táctil, estados de sistema

### Layout paradigm

```
┌─────────────────────────────┐
│ Safe area (OS status bar)   │
├─────────────────────────────┤
│ Header contextual           │  ← título + acción secundaria opcional
│ (mucho padding vertical)    │
├─────────────────────────────┤
│                             │
│   Contenido principal       │  ← scroll, cards, listas
│   (fondo blanco / surface)  │
│                             │
├─────────────────────────────┤
│ CTA fijo opcional           │  ← solo si la pantalla lo requiere
├─────────────────────────────┤
│ Bottom tab bar (logged in)  │
└─────────────────────────────┘
```

### Auth paradigm (sin FormPanel)

Pantallas de auth usan **fondo blanco completo**, wordmark centrado arriba, formulario en el centro con inputs del kit Chefio, CTA pill abajo. Sin panel gris.

---

## Principios de producto visual

1. **Mobile-only** — cada decisión optimizada para pulgar y una mano.
2. **Institucional sin ser pesado** — marca en acentos, no en fondos completos.
3. **Operación primero** — el usuario viene a reportar o resolver, no a explorar.
4. **Progresión clara** — auth → home rol → acción → detalle → cierre.
5. **Estados honestos** — loading, vacío y error siempre diseñados, nunca genéricos.

---

## Métricas de éxito del rediseño

| Señal | Indicador |
|-------|-----------|
| Comprensión inmediata | Usuario identifica su rol y siguiente acción en <5s en home |
| Confianza | Copy institucional + UI limpia, sin elementos “app de recetas” |
| Consistencia | Mismos botones, inputs y cards en auth y producto |
| Native feel | Bottom nav, safe areas, transiciones suaves |
| Implementabilidad | Tokens en código, componentes reutilizables, sin valores mágicos |

---

## Relación con documentos hijos

- Tokens concretos → [mobile-design-system.md](./mobile-design-system.md)
- Principios UX → [mobile-ux-principles.md](./mobile-ux-principles.md)
- Pantallas → [mobile-screen-specs.md](./mobile-screen-specs.md)
- Implementación → [mobile-implementation-notes.md](./mobile-implementation-notes.md)
