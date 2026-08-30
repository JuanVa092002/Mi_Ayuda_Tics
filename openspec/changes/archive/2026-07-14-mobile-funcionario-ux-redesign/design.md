# Design: mobile-funcionario-ux-redesign

## 1. Technical Approach

Replace the single Stack navigator in `(funcionario)/_layout.tsx` with a two-level structure: a root Stack (for auth guards and native headers) containing a **Tab** navigator with three tab-specific Stack children. This preserves native iOS/Android back gestures and back-button behavior while enabling one-thumb tab navigation. The auth guard (`canAccessFuncionarioStack`) remains on the root Stack.

## 2. Architecture Decisions

### Decision: Tab Navigator Type

**Choice**: `expo-router` file-based Tabs via `app/(funcionario)/(tabs)/_layout.tsx`
**Alternatives**: `@react-navigation/bottom-tabs` (extra dep), custom Pressable tab bar
**Rationale**: expo-router Tabs integrates natively with the existing Stack-based file routing, requires no additional dependency, and supports native screen options inheritance.

### Decision: Back Navigation

**Choice**: Native Stack `screenOptions` with `headerBackTitle: ''` and `headerBackVisible: true`
**Alternatives**: Custom "← Volver" Pressable (existing `ScreenScaffold`)
**Rationale**: Native back chevron + swipe gesture work on both platforms without extra code. Eliminates the custom `onBack` prop chain.

### Decision: Session/Profile Access

**Choice**: Header right overflow menu on the root Funcionario Stack
**Alternatives**: Fourth "Perfil" tab, inline session card on Home (current)
**Rationale**: Three tabs map to the three high-frequency flows. Profile/logout is low-frequency — overflow menu is standard platform idiom (iOS Settings, Android overflow).

### Decision: Success State on Nueva Solicitud

**Choice**: Inline success card replacing `Alert.alert`
**Alternatives**: Bottom sheet modal
**Rationale**: Inline card keeps the user in flow context. Bottom sheet is reserved for `SelectField` modals. Both avoid `Alert.alert` which blocks gesture navigation.

## 3. Navigation Design

```
(funcionario)/_layout.tsx        ← Stack (auth guard + native header)
└── (tabs)/_layout.tsx           ← Tabs (3 tab routes)
    ├── (home)/home.tsx           ← Stack (home + nested detail)
    │   └── solicitud/[id].tsx
    ├── (nueva-solicitud)/index.tsx  ← single screen
    └── (historial)/index.tsx    ← Stack (historial + nested detail)
        └── solicitud/[id].tsx
```

**Tab Bar Spec** (Feather icons):
| Tab | Icon (active) | Icon (inactive) | Label |
|-----|---------------|-----------------|-------|
| Home | `home` | `home` | "Inicio" |
| Nueva Solicitud | `plus-circle` | `plus-circle` | "Nueva" |
| Historial | `clock` | `clock` | "Historial" |

Colors: `semanticColors.brand.green` (active), `semanticColors.text.tertiary` (inactive)
Background: `semanticColors.surface.default`, top border `semanticColors.border.default`

**Header Spec**:
- Root Stack: `headerShown: true`, `headerBackVisible: false`, custom `headerRight` for overflow menu
- Tab Stacks: `headerShown: false` (tabs own the chrome)
- Detail screens: `headerShown: true` with `headerBackVisible: true` (native back)

## 4. Home Screen Layout (top → bottom)

```
<SafeAreaView edges={['top']}>
  <ScrollView contentContainerStyle={styles.scroll}>
    {/* Greeting */}
    <Text style={typography.h2}>Buenos días, {firstName}</Text>
    <Text style={typography.caption}>{formattedDate}</Text>

    {/* Stats Row */}
    <View style={styles.statsRow}>
      <StatCard label="Total"       value={stats.total}    skeleton={loading} />
      <StatCard label="Pendientes"  value={stats.pending}  skeleton={loading} />
      <StatCard label="Resueltas"   value={stats.resolved} skeleton={loading} />
    </View>

    {/* Quick Action */}
    <Button
      label="Nueva Solicitud"
      variant="primary"
      fullWidth
      onPress={() => router.push('/(funcionario)/(nueva-solicitud)')}
    />

    {/* Recent */}
    <SectionHeader
      title="Recientes"
      actionLabel="Ver todo"
      onAction={() => router.push('/(funcionario)/(historial)')}
    />
    <View style={styles.recentCard}>
      <FlatList
        data={recentItems}
        renderItem={({ item }) => <SolicitudListItem item={item} onPress={...} />}
        scrollEnabled={false}
      />
    </View>
  </ScrollView>
</SafeAreaView>
```

**Pull-to-refresh**: Wraps ScrollView with `RefreshControl` — refetches both `useSolicitudStats` and `useMisSolicitudes` in parallel.

## 5. Nueva Solicitud Screen

- Header: "Nueva Solicitud" title via parent Stack `options`
- Body: `<SolicitudForm>` wrapped in `ScrollView`
- Success: Replaces `Alert.alert` with an inline `SuccessCard` component:
  ```tsx
  <View style={styles.successCard}>
    <Feather name="check-circle" size={40} color={semanticColors.state.success} />
    <Text style={typography.h3}>Solicitud registrada</Text>
    <Text style={typography.body}>Tu incidente fue reportado correctamente.</Text>
    <Button label="Ver historial" variant="outline" onPress={() => router.replace('/(funcionario)/(historial)')} />
    <Button label="Volver al inicio" variant="ghost" onPress={() => router.back()} />
  </View>
  ```
- Submit button: Fixed at bottom inside `ScrollView` content (not `position: absolute`) to avoid keyboard issues.

## 6. Historial Screen

```
<ScreenScaffold title="Historial" subtitle="...">
  <SearchField ... />           ← sticky via FlatList ListHeaderComponent
  <FilterChips                  ← horizontal ScrollView of chips
    options={['Todas', 'Pendiente', 'En proceso', 'Resueltas']}
    selected={activeFilter}
    onSelect={setActiveFilter}
  />
  <FlatList
    data={filteredItems}
    ListEmptyComponent={<EmptyState ... />}
    refreshControl={...}
    renderItem={...}
  />
</ScreenScaffold>
```

**Filter Chips**: `HorizontalScrollView` with `Pressable` chips using `semanticColors.brand.green` border + text when selected, `semanticColors.border.default` when inactive.

## 7. Solicitud Detail Screen

- Native back button (via Stack `screenOptions`)
- `StatusBadge` at top, prominent (`fontSize: 13`, larger padding)
- Card sections: Case code header, timeline, detail rows, description, photo, solution
- Overflow menu (header right): "Cancelar solicitud" (only if status === 'solicitado')
- Cancel action: Confirmation `Alert.alert` → `useCancelSolicitud` mutation → router.back()

## 8. Component Design

| Component | Current | Proposed |
|-----------|---------|----------|
| `RoleHomeShell` | Custom shell with session card + logout | Delete. Home screen uses `SafeAreaView` + ScrollView. Session moves to header overflow menu. |
| `ScreenScaffold` | Custom "← Volver" button | Replace with native Stack `screenOptions`. Keep component but strip `onBack` — native back handles it. |
| `QueryBoundary` | `ActivityIndicator` fallback | Add `skeleton` prop. When `skeleton={true}` and `isLoading`, render `SkeletonCard` / `SkeletonListItem` / `SkeletonStats` variants. |
| `SolicitudListItem` | `opacity: 0.85` on press | Use `useSharedValue` + `withTiming(scale, 150ms)`. Press → scale(0.98), release → scale(1). Haptic impact on release. |
| `SelectField` | Basic Modal with ScrollView | Add `backdropFilter: 'blur(8)'` via `BackdropModal` wrapper. Add section headers support. Keep ScrollView. |
| `AppButton` | Legacy wrapper | Mark deprecated. Direct consumers migrate to `Button`. |
| `Button` | Already consolidated | No changes. Add `useHaptic()` impact on primary variant press. |

## 9. Token Alignment Table

### Spacing
| Current | Unified |
|---------|---------|
| 20 (screen padding) | `spacing[5]` = 20 |
| 16 (card padding) | `spacing[4]` = 16 |
| 14, 12, 10, 8 | `spacing[3-1]` = 12, 8, 4 |
| 32, 40 | `spacing[6-8]` = 24, 32 |

No new tokens added. Current `spacing.ts` values align with 8pt grid.

### Radius
| Current | Unified |
|---------|---------|
| 14 (stats card) | `radius.sm` = 8 |
| 16 (cards) | `radius.md` = 16 |
| 10 (inputs) | `radius.sm` = 8 |
| 16 (modal sheet) | `radius.md` = 16 |
| 32 (buttons) | `radius.pill` = 32 |
| 9999 (badges) | `radius.full` = 9999 |

**Change**: Stats card radius: 14 → 8 (`radius.sm`). All cards: 16 (`radius.md`). Inputs: 10 → 8 (`radius.sm`).

### Colors
| Usage | Current | Semantic |
|-------|---------|----------|
| Background | `#F4F6F9` hardcoded | `semanticColors.surface.muted` |
| Card | `colors.white` | `semanticColors.surface.card` |
| Primary text | `colors.textDark` | `semanticColors.text.primary` |
| Active tab / CTA | `colors.brandGreen` | `semanticColors.brand.green` |
| Inactive tab | `#6B7C93` | `semanticColors.text.tertiary` |

## 10. File Changes Map

### Create
| File | Purpose |
|------|---------|
| `app/(funcionario)/(tabs)/_layout.tsx` | Tab navigator with 3 tab routes |
| `app/(funcionario)/(tabs)/(home)/home.tsx` | Home tab screen |
| `app/(funcionario)/(tabs)/(home)/solicitud/[id].tsx` | Home stack detail |
| `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` | Nueva solicitud tab screen |
| `app/(funcionario)/(tabs)/(historial)/index.tsx` | Historial tab screen |
| `app/(funcionario)/(tabs)/(historial)/solicitud/[id].tsx` | Historial stack detail |
| `src/shared/ui/SkeletonCard.tsx` | Skeleton variant for cards |
| `src/shared/ui/SkeletonListItem.tsx` | Skeleton variant for list items |
| `src/shared/ui/SkeletonStats.tsx` | Skeleton variant for stats row |
| `src/shared/ui/SuccessCard.tsx` | Inline success state card |
| `src/shared/ui/FilterChips.tsx` | Horizontal filter chip row |
| `src/shared/ui/OverflowMenu.tsx` | Header overflow menu (profile/logout) |

### Modify
| File | Change Summary |
|------|----------------|
| `app/(funcionario)/_layout.tsx` | Add auth guard + root Stack with tabs; `headerShown: false` + `headerRight: OverflowMenu` |
| `app/_layout.tsx` | No changes needed — Stack accepts any child group |
| `src/shared/ui/QueryBoundary.tsx` | Add `skeleton`, `skeletonVariant` props; render skeleton components when loading + skeleton=true |
| `src/shared/ui/SolicitudListItem.tsx` | Add press scale animation + haptic feedback |
| `src/shared/ui/SelectField.tsx` | Wrap modal backdrop with blur effect |
| `src/shared/ui/Button.tsx` | Add `useHaptic()` impact on primary button press |
| `src/shared/theme/radius.ts` | Stats card radius: 14 → 8. Add comment documenting scale |
| `src/shared/theme/colors.ts` | No changes — already uses semantic aliases |
| `src/shared/theme/spacing.ts` | No changes — already 8pt grid aligned |

### Delete
| File | Reason |
|------|--------|
| `src/shared/ui/RoleHomeShell.tsx` | Replaced by native tabs + SafeAreaView in home screen |
| `src/shared/ui/ScreenScaffold.tsx` | Replaced by native Stack screenOptions. Keep for tecnico migration later. Mark `@deprecated` not delete. |

## 11. Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `SkeletonCard`, `FilterChips`, `OverflowMenu` render logic | `render(<Component />)` + assertions |
| Integration | Tab navigation flow: home → detail | `renderRoute('/(funcionario)/(tabs)/(home)/home')` + fire press |
| Integration | Nueva Solicitud → success card → navigate | Test form submit path |
| E2E | Full flow: open app → new solicitud → view in historial | Expo E2E with `device.reloadReactNative()` between tests |

## 12. Threat Matrix

**N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.**

## 13. Migration / Rollback

- **Feature flag**: Not required — this is a pure UI refactor with no API or data model changes.
- **Rollback**: Revert `app/(funcionario)/_layout.tsx` to Stack-only + restore `RoleHomeShell` + `ScreenScaffold` usage. All other changes (skeleton components, token updates) are additive or scope-contained.
- **Phasing**: If risks materialize, Phase 1 = tabs only. Phase 2 = skeleton + token alignment. Phase 3 = component animations + haptics.

## 14. Open Questions

- [ ] Should `ScreenScaffold` be fully removed or kept as `@deprecated` for the tecnico migration later?
- [ ] Does `useHaptic()` require a new dependency or does Expo export it natively?
- [ ] Should the "Cancelar" action on detail screen use a bottom sheet confirmation instead of `Alert.alert`?
- [ ] Should filter chips on historial persist filter state in URL query params?
