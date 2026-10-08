# Mobile Redesign Roadmap — Roadmap visual

Plan por fases para implementar el rediseño sin romper producto ni plataforma.

---

## Resumen ejecutivo

| Fase | Nombre | Objetivo | Duración est. |
|------|--------|----------|---------------|
| **R0** | Foundation | Tokens, fonts, componentes base | 1 sprint |
| **R1** | Auth premium | Welcome + auth flow visual | 1 sprint |
| **R2** | App shell | Tabs, headers, navegación nativa | 1 sprint |
| **R3** | Product surfaces | Homes, listas, detalle | 1–2 sprints |
| **R4** | States & polish | Empty, error, motion, haptics | 0.5 sprint |
| **R5** | Scaffolding+ | Notifications, profile UI | 0.5 sprint |

**Total estimado:** 4–5 sprints de diseño+implementación mobile.

---

## R0 — Foundation

### Entregables

- [ ] `src/shared/theme/` completo (colors, typography, spacing, radius, shadows, motion)
- [ ] Inter cargada en root `_layout.tsx`
- [ ] `Button` component con todas las variantes
- [ ] `TextInput` con estados
- [ ] `Text` wrapper con variants
- [ ] Storybook o pantalla dev de componentes (opcional)

### Criterio de done

- Cero hex hardcoded en componentes nuevos
- `pnpm typecheck` pasa
- Componentes usables en una pantalla de prueba

---

## R1 — Auth premium

### Pantallas

- [ ] `/` welcome (onboarding)
- [ ] `login`
- [ ] `register`
- [ ] `forgot-password`
- [ ] `reset-password`
- [ ] `pending-approval`, `session-expired`, `lider-not-supported`

### Componentes

- [ ] `AuthLayout` reemplaza `AuthScaffold` + `FormPanel`
- [ ] `BrandTitle` actualizado
- [ ] `AuthFlowPanel` actualizado

### Eliminar

- [ ] `FormPanel.tsx` (deprecar)
- [ ] Referencias a `main_top.png` en auth

### Criterio de done

- Flujo auth completo visualmente alineado al mockup
- Smoke manual auth PASS

---

## R2 — App shell

### Entregables

- [ ] `BottomTabBar` + route group `(tabs)` o integración en role groups
- [ ] `AppShell` evoluciona `RoleHomeShell`
- [ ] `ScreenHeader` evoluciona `ScreenScaffold`
- [ ] Profile screen scaffolding
- [ ] Notifications screen scaffolding

### Criterio de done

- Usuario autenticado ve bottom nav
- Navegación entre tabs sin perder estado de sesión
- Logout accesible desde Profile

---

## R3 — Product surfaces

### Funcionario

- [ ] `home` con stats cards + recientes
- [ ] `historial` con search + filter chips
- [ ] `nueva-solicitud` con form premium
- [ ] `solicitud/[id]` detalle premium

### Técnico

- [ ] `home` con tabs + search
- [ ] `caso/[id]` detalle
- [ ] `caso/[id]/resolver` form

### Componentes

- [ ] `SolicitudListItem` / `CasoListItem` refresh
- [ ] `StatusBadge` / `StatusTimeline` refresh
- [ ] `FilterChips`
- [ ] `SectionHeader`

### Criterio de done

- Paridad funcional con app actual
- UI alineada a screen specs
- Smoke manual Fase 1+2A re-ejecutado

---

## R4 — States & polish

- [ ] `EmptyState` / `ErrorState` en todas las listas
- [ ] Skeleton loaders
- [ ] `Banner` para feedback inline
- [ ] Press feedback + haptics
- [ ] `Reduce Motion` support
- [ ] Reanimated evaluación e integración

### Criterio de done

- Ninguna lista sin empty state
- Ningún error de red sin retry UI

---

## R5 — Scaffolding+

- [ ] Notifications UI completa (datos mock → API cuando exista)
- [ ] Profile UI completa
- [ ] Editar perfil placeholder
- [ ] Assets optimizados (logo SENA desde `design/figma/onboarding/assets/`)

---

## Dependencias entre fases

```
R0 Foundation
 └── R1 Auth
      └── R2 App Shell
           └── R3 Product
                └── R4 Polish
                     └── R5 Scaffolding+
```

R1 puede empezar cuando Button + TextInput + tokens estén listos.
R3 no empieza sin R2 (tabs afectan homes).

---

## Fuera de roadmap (explícito)

| Item | Razón |
|------|-------|
| Dark mode | No requerido v1 |
| OTP email verification UI | No en flujo backend actual |
| Google OAuth | No en producto |
| iOS native changes | Expo RN only |
| Web frontend | Scope excluido |
| Backend changes | Scope excluido |
| Onboarding carousel multi-slide | Welcome single screen basta |
| Tablet layout | Phone only v1 |

---

## Hitos de validación

| Hito | Cuándo | Quién valida |
|------|--------|--------------|
| Design review R0 | Fin R0 | Design engineer |
| Auth walkthrough | Fin R1 | Product |
| Tab nav usability | Fin R2 | Mobile engineer |
| Full smoke UI | Fin R3 | QA manual |
| Premium sign-off | Fin R4 | Product + Design |

---

## Referencia visual continua

- Figma: [Chefio UI Kit](https://www.figma.com/design/Gi6VjjQY1j40IVAVQMfhdf/)
- PDF: `Chefio - Recipe App UI Kit.pdf`
- Onboarding medidas: `../../design/figma/onboarding/`
