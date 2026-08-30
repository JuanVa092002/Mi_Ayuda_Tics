# Proposal: mobile-funcionario-ux-redesign

## 1. Change Name

`mobile-funcionario-ux-redesign`

## 2. Executive Summary

The Funcionario (employee) mobile UX suffers from flat stack navigation that forces text-based "← Volver" back buttons on every screen, an overloaded RoleHomeShell that mixes session info with navigation, and visual inconsistencies in spacing, radius, and typography. This redesign introduces bottom tab navigation for the three primary screens (Home, Nueva Solicitud, Historial), a unified spacing/radius token system, skeleton loading states, and native app bar patterns. The result: navigation clarity in under 1 second, one-thumb action reachability, and a visual system that feels production-native rather than prototype.

## 3. Goals

- **Navigation clarity <1s**: Users identify their current location and available destinations within 1 second of opening the app
- **One-thumb reachability**: All primary actions (new solicitud, view history) reachable without repositioning thumb
- **Loading state professionalism**: Skeleton loaders replace spinners for all data-fetching states
- **Visual consistency**: Unified spacing (8pt grid), radius (12px cards, 8px inputs, 16px modals), and typography scale
- **Native feel**: Platform-idiomatic back gestures, app bar patterns, and haptic feedback on key actions

## 4. Non-Goals

- Authentication flow redesign (auth is out of scope for this change)
- Tecnico (technician) role UX changes
- API contract or data model changes
- Animation/transitions overhaul
- Dark mode implementation

## 5. User Stories

| # | As a... | I want to... | So that... |
|---|---------|--------------|------------|
| 1 | Funcionario | See my dashboard with stats and recent solicitudes immediately on open | I know my status at a glance without navigating |
| 2 | Funcionario | Tap "Nueva Solicitud" with one thumb from home | I can report incidents quickly while holding phone in one hand |
| 3 | Funcionario | Swipe back or tap a tab to navigate | Navigation feels native and requires zero cognitive load |
| 4 | Funcionario | See skeleton loaders while data fetches | I know the app is working, not frozen |
| 5 | Funcionario | View my full historial with search | I can find past solicitudes without scrolling indefinitely |

## 6. Proposed Navigation Architecture

**Recommendation: Bottom Tab Navigation (expo-router Tabs)**

| Tab | Screen | Frequency |
|-----|--------|-----------|
| Home | `(funcionario)/home` | High |
| Nueva Solicitud | `(funcionario)/nueva-solicitud` | High |
| Historial | `(funcionario)/historial` | Medium |
| Profile/Settings | Header overflow menu | Low |

**Justification**: With 2 high-frequency screens (home, nueva-solicitud), bottom tabs eliminate the back-button dance on every interaction. The detail screen (`solicitud/[id]`) remains in the stack — it's low frequency and accessed via list taps. Profile/logout moves to a header overflow menu (three-dot) to reduce tab bar clutter.

**Stack structure**:
```
Tabs (bottom)
├── HomeStack
│   └── home → solicitud/[id]
├── NuevaSolicitudStack
│   └── nueva-solicitud
└── HistorialStack
    └── historial → solicitud/[id]
```

## 7. Proposed Home Redesign

**At-a-glance layout** (top to bottom):
1. **Compact app bar**: Role badge + logo (no text back button), overflow menu for logout/profile
2. **Greeting row**: "Buenos días, {firstName}" + date
3. **Stats trio**: Total / Pendientes / Resueltas — horizontal cards, tap to filter
4. **Quick action**: Full-width "Nueva Solicitud" button (green, high prominence)
5. **Recent solicitudes**: Last 5 items, "Ver todo" link to Historial tab

**Session info**: Moved to Profile screen (header overflow → "Mi Perfil") rather than occupying home real estate.

**Tradeoff decision**: Stats stay on home (high value, low scroll cost). Full historial is one tab tap away.

## 8. Visual Improvements Scope

| Token | Current | Proposed |
|-------|---------|----------|
| Spacing base | Ad-hoc (20, 16, 12, 8) | 8pt grid: 4, 8, 12, 16, 24, 32 |
| Card radius | 14–16px inconsistent | 12px uniform |
| Input radius | 10px | 8px |
| Modal/Sheet radius | 16px | 16px top, 16px bottom |
| Typography scale | 24/22/17/14/13/12/11 | Refine: 24/20/17/14/12 (remove orphans) |
| Back button | "← Volver" text | Native chevron + swipe gesture |
| Surface bg | `#F4F6F9` hardcoded | Semantic: `surface.muted` |

## 9. Component Improvements

| Component | Current | Proposed |
|-----------|---------|----------|
| `QueryBoundary` | Spinner fallback | Skeleton loaders (3-variant: card, list-item, stats) |
| `SelectField` | Modal with basic scroll | Bottom sheet with sticky selected state, section headers |
| `SolicitudListItem` | Basic press opacity | Enhanced: scale(0.98) press, left border accent on active |
| `StatusBadge` | Missing accessibility label | `accessibilityLabel={getStatusLabel(status)}` + minimum touch target 44x44 |
| `AppButton` | No haptic | `useHaptic()` impact on press for primary actions |

## 10. Scope Boundaries

### Touches
- `mobile/MiAyudaTIC-Mobile/app/(funcionario)/` — all 4 screens
- `mobile/MiAyudaTIC-Mobile/app/(funcionario)/_layout.tsx` — tab navigator
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/RoleHomeShell.tsx` — refactor/replace
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/ScreenScaffold.tsx` — app bar patterns
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/QueryBoundary.tsx` — skeleton loading
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/SelectField.tsx` — bottom sheet polish
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/SolicitudListItem.tsx` — press states
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/StatusBadge.tsx` — accessibility
- `mobile/MiAyudaTIC-Mobile/src/shared/ui/Loaders.tsx` — skeleton primitives
- `mobile/MiAyudaTIC-Mobile/src/shared/theme/` — spacing/radius tokens

### Does NOT Touch
- `app/(auth)/` — authentication flow
- `app/(tecnico)/` — technician role
- `server/` — API contracts
- `packages/contracts/` — data models

## 11. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Bottom tabs break auth guard redirects | High | Test guard logic with new tab structure; ensure canAccessFuncionarioStack still fires on tab index |
| Skeleton loaders cause layout shift | Medium | Define fixed-height skeletons per variant; test on small screens (iPhone SE) |
| RoleHomeShell removal breaks other roles | High | Verify tecnico role does NOT use RoleHomeShell before removal; keep as shared component if needed |
| Navigation state loss on background/foreground | Medium | Use expo-router's proper linking config; test deep link resume behavior |
| Spacing refactor cascades to unrelated screens | Low | Apply new tokens only in components touched by this change; don't migrate entire codebase |

## 12. Success Metrics

**Qualitative criteria** (measured by observation/usability session):
- [ ] User opens app, identifies "Home" tab within 500ms
- [ ] User creates new solicitud in ≤3 taps from home
- [ ] User navigates to historial and taps a solicitud without searching for back button
- [ ] User perceives skeleton loaders, not spinners, when data is slow
- [ ] User can perform one-handed operation (create solicitud) without repositioning phone

**Visual checkmarks**:
- [ ] All cards use 12px radius
- [ ] All inputs use 8px radius
- [ ] No "← Volver" text buttons remain in functonario flow
- [ ] Consistent 8pt spacing throughout touched screens
