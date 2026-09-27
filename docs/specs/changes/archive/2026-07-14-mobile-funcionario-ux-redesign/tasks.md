# Tasks: mobile-funcionario-ux-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1100–1400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (nav scaffold) → PR 2 (shared UI) → PR 3 (home+stats) → PR 4 (nueva-solicitud) → PR 5 (historial+detail+polish) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Navigation scaffold (tabs layout + new screen files) | PR 1 → feature/mobile-funcionario-ux-redesign | `pnpm --filter mobile typecheck` | Manual: tap 3 tabs, verify auth guard fires | Delete `(tabs)/` dir, restore `_layout.tsx` |
| 2 | Skeleton loaders + shared UI (QueryBoundary, SkeletonCard/ListItem/Stats, SuccessCard, FilterChips, OverflowMenu) | PR 2 → PR 1 branch | `pnpm --filter mobile test` | Manual: pull-to-refresh home, check skeletons | Revert each new component file |
| 3 | Home redesign (RoleHomeShell → SafeAreaView, greeting, stats row, quick action, recent list) | PR 3 → PR 2 branch | `pnpm --filter mobile typecheck` | Manual: open home, verify stats + recent list | Restore old home.tsx + RoleHomeShell |
| 4 | Nueva Solicitud polish (tab nav, Alert → SuccessCard, form preserve) | PR 4 → PR 3 branch | `pnpm --filter mobile typecheck` | Manual: submit form, verify success card + form reset | Restore old nueva-solicitud.tsx |
| 5 | Historial (FilterChips + search + debounce), Detail (native back), radius tokens, haptic | PR 5 → PR 4 branch | `pnpm --filter mobile typecheck && test` | Manual: filter chips, back gesture, haptic | Restore old files + radius values |

---

## Implementation Order

### Phase 1: Navigation Scaffold

- [ ] 1.1 Create `app/(funcionario)/(tabs)/_layout.tsx` — expo-router Tabs with 3 tab routes (home, nueva-solicitud, historial); use Feather icons (`home`, `plus-circle`, `clock`); active color `semanticColors.brand.green`, inactive `semanticColors.text.tertiary`; no `headerShown` (tabs own chrome)
- [ ] 1.2 Create `app/(funcionario)/(tabs)/(home)/home.tsx` — copy current home.tsx logic (stats, recent list, pull-to-refresh) but strip `RoleHomeShell` wrapper; use `SafeAreaView` + `ScrollView`; keep queries and router.push to tab-relative paths
- [ ] 1.3 Create `app/(funcionario)/(tabs)/(home)/solicitud/[id].tsx` — move existing `solicitud/[id].tsx` into this path; strip `ScreenScaffold`; use Stack `screenOptions` for native back (PR 1 only — detail screens land in PR 5)
- [ ] 1.4 Create `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` — copy current `nueva-solicitud.tsx`; strip `ScreenScaffold`; keep form + Alert (Alert→SuccessCard in PR 4)
- [ ] 1.5 Create `app/(funcionario)/(tabs)/(historial)/index.tsx` — copy current `historial.tsx`; strip `ScreenScaffold`; keep search + FlatList (FilterChips in PR 5)
- [ ] 1.6 Create `app/(funcionario)/(tabs)/(historial)/solicitud/[id].tsx` — symlink/copy of home detail (PR 1 stub only)
- [ ] 1.7 Modify `app/(funcionario)/_layout.tsx` — wrap `<Stack>` with `canAccessFuncionarioStack` guard (unchanged); add `headerRight: OverflowMenu` placeholder; `headerShown: false`; child structure becomes tabs via `app/(funcionario)/(tabs)/_layout.tsx` auto-discovery
- [ ] 1.8 Create `src/shared/ui/OverflowMenu.tsx` — header overflow menu (three-dot icon); options: "Mi Perfil" (stub), "Cerrar Sesión" (calls `logout()` + `router.replace('/')`)

### Phase 2: Shared UI Components

- [ ] 2.1 Create `src/shared/ui/SkeletonCard.tsx` — animated skeleton with `width: 100%`, `height: 120`, `backgroundColor: surface.muted`, `borderRadius: radius.md`; shimmer via `useAnimatedStyle` from `react-native-reanimated`
- [ ] 2.2 Create `src/shared/ui/SkeletonListItem.tsx` — skeleton for list items: avatar circle (44x44), two text lines (width 60%, 40%), borderRadius `radius.sm`
- [ ] 2.3 Create `src/shared/ui/SkeletonStats.tsx` — row of 3 skeleton cards matching `StatCard` dimensions; height 72, each flex 1
- [ ] 2.4 Modify `src/shared/ui/QueryBoundary.tsx` — add `skeleton?: boolean` and `skeletonVariant?: 'card' | 'listItem' | 'stats'` props; when `isLoading && skeleton`, render `SkeletonCard`/`SkeletonListItem`/`SkeletonStats` instead of `ActivityIndicator`
- [ ] 2.5 Create `src/shared/ui/SuccessCard.tsx` — inline success card: check icon (Feather `check-circle`, 40px, color `semanticColors.state.success`), h2 title "Solicitud registrada", body text, two action buttons ("Ver historial" → outline, "Volver al inicio" → ghost)
- [ ] 2.6 Create `src/shared/ui/FilterChips.tsx` — `HorizontalScrollView` of `Pressable` chips; selected: `borderColor: semanticColors.brand.green`, `color: semanticColors.brand.green`; inactive: `borderColor: semanticColors.border.default`, `color: semanticColors.text.secondary`; accepts `options: string[]`, `selected: string`, `onSelect: (v: string) => void`

### Phase 3: Home Screen Redesign

- [ ] 3.1 Delete `src/shared/ui/RoleHomeShell.tsx` — no longer referenced by any Funcionario screen; verify tecnico does NOT import it before deleting
- [ ] 3.2 Modify `app/(funcionario)/(tabs)/(home)/home.tsx` — add time-based greeting: `Buenos días/tardes/noches, {firstName}` using device clock (05:00–11:59 / 12:00–18:59 / 19:00–04:59); add formatted date below greeting
- [ ] 3.3 Modify home.tsx — replace hardcoded `borderRadius: 14` on `StatCard` with `radius.sm = 8` from theme
- [ ] 3.4 Modify home.tsx — add `SkeletonStats` skeleton variant to stats `QueryBoundary` (pass `skeleton={true} skeletonVariant="stats"`)
- [ ] 3.5 Modify home.tsx — replace `AppButton` with `Button` (primary variant, fullWidth) for "Nueva solicitud" CTA; ensure `useHaptic` is called on press (Expo Haptics API — no new dependency)
- [ ] 3.6 Modify home.tsx — recent list `QueryBoundary` pass `skeleton={true} skeletonVariant="listItem"`
- [ ] 3.7 Modify `src/shared/ui/SolicitudListItem.tsx` — add `useSharedValue` + `withTiming(scale, 150ms)` press animation (scale 0.98 on press, 1.0 on release); add `useHaptic()` impact on release

### Phase 4: Nueva Solicitud Polish

- [ ] 4.1 Modify `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` — replace `Alert.alert` success with `<SuccessCard>` component; "Ver historial" navigates via `router.replace('/(funcionario)/(historial)')`; "Volver al inicio" uses `router.back()`
- [ ] 4.2 Modify `SolicitudForm` — add `formValuesAtom` ( Jotai atom) to persist form state on navigate-away; restore values on screen focus via `useEffect` + `useFocusEffect`
- [ ] 4.3 Modify `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` — add inline `ActivityIndicator` inside submit `Button` while `submitting` is true (button already disabled)

### Phase 5: Historial and Detail

- [ ] 5.1 Modify `app/(funcionario)/(tabs)/(historial)/index.tsx` — replace static filter buttons with `<FilterChips>` component; options: ['Todas', 'Pendiente', 'En proceso', 'Resueltas']; filter by `status` field of each item
- [ ] 5.2 Modify `app/(funcionario)/(tabs)/(historial)/index.tsx` — add 300ms debounce to `SearchField.onChangeText` using `setTimeout` / cleanup
- [ ] 5.3 Modify `app/(funcionario)/(tabs)/(historial)/index.tsx` — recent list `QueryBoundary` pass `skeleton={true} skeletonVariant="listItem"`
- [ ] 5.4 Modify `app/(funcionario)/(tabs)/(home)/solicitud/[id].tsx` and `historial/solicitud/[id].tsx` — replace `ScreenScaffold` usage with native Stack `screenOptions` (`headerShown: true`, `headerBackVisible: true`, `headerTitle: 'Detalle de solicitud'`); keep all content and `StatusBadge`, `StatusTimeline`, `Image` rendering intact
- [ ] 5.5 Modify `src/shared/ui/SelectField.tsx` — wrap modal with `BackdropModal` adding `backdropFilter: 'blur(8)'` effect (use `Platform.select` for iOS/Android compat); add section headers support if `options` includes grouped data
- [ ] 5.6 Modify `src/shared/theme/radius.ts` — add comment: `// Stats card: was 14, unified to sm=8 per 8pt grid`

### Phase 6: Token Alignment and Polish

- [ ] 6.1 Modify `app/(funcionario)/(tabs)/(home)/home.tsx` — replace hardcoded `colors.white` with `semanticColors.surface.card`; replace hardcoded `colors.brandBlue` with `semanticColors.brand.blue`; replace hardcoded `colors.textDark` with `semanticColors.text.primary`
- [ ] 6.2 Modify `app/(funcionario)/(tabs)/(home)/home.tsx` — replace hardcoded `borderRadius: 16` in sectionCard with `radius.md`; replace `borderRadius: 14` in statCard with `radius.sm`
- [ ] 6.3 Modify `src/shared/ui/Button.tsx` — add `import { trigger } from 'expo-haptics'` and call `trigger('impactLight')` inside primary variant `onPress`; guard with `try/catch` so it never crashes
- [ ] 6.4 Modify `src/shared/ui/StatusBadge.tsx` — add `accessibilityLabel={'Estado: ' + getStatusLabel(status)}` and `accessibilityRole="text"` to meet WCAG requirements
- [ ] 6.5 Modify `src/shared/ui/ScreenScaffold.tsx` — add `@deprecated` JSDoc comment pointing to native Stack `screenOptions`; do NOT delete (future tecnico migration)
- [ ] 6.6 Verify all 3 detail screen paths: `/(funcionario)/(tabs)/(home)/solicitud/[id]`, `/(funcionario)/(tabs)/(historial)/solicitud/[id]` and the legacy `/(funcionario)/solicitud/[id]` (redirect or remove legacy)
- [ ] 6.7 Add badge count to Historial tab icon when unread > 0 (using `tabBarBadge` on the Historial route in tabs layout)

---

## Work Unit Commits

### Commit 1: Navigation scaffold
**Files**: `app/(funcionario)/_layout.tsx` (modify), `app/(funcionario)/(tabs)/_layout.tsx` (create), `app/(funcionario)/(tabs)/(home)/home.tsx` (create), `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` (create), `app/(funcionario)/(tabs)/(historial)/index.tsx` (create), `app/(funcionario)/(tabs)/(home)/solicitud/[id].tsx` (create), `app/(funcionario)/(tabs)/(historial)/solicitud/[id].tsx` (create), `src/shared/ui/OverflowMenu.tsx` (create)

### Commit 2: Skeleton loaders and shared UI components
**Files**: `src/shared/ui/QueryBoundary.tsx` (modify), `src/shared/ui/SkeletonCard.tsx` (create), `src/shared/ui/SkeletonListItem.tsx` (create), `src/shared/ui/SkeletonStats.tsx` (create), `src/shared/ui/SuccessCard.tsx` (create), `src/shared/ui/FilterChips.tsx` (create)

### Commit 3: Home redesign — RoleHomeShell removal + new layout
**Files**: `src/shared/ui/RoleHomeShell.tsx` (delete), `app/(funcionario)/(tabs)/(home)/home.tsx` (modify), `src/shared/ui/SolicitudListItem.tsx` (modify)

### Commit 4: Nueva Solicitud polish — SuccessCard + form persistence
**Files**: `app/(funcionario)/(tabs)/(nueva-solicitud)/index.tsx` (modify), `src/features/solicitudes/components/SolicitudForm.tsx` (modify — add atom persistence)

### Commit 5: Historial + Detail + Token alignment + Haptics
**Files**: `app/(funcionario)/(tabs)/(historial)/index.tsx` (modify), `app/(funcionario)/(tabs)/(home)/solicitud/[id].tsx` (modify), `app/(funcionario)/(tabs)/(historial)/solicitud/[id].tsx` (modify), `src/shared/ui/SelectField.tsx` (modify), `src/shared/ui/Button.tsx` (modify), `src/shared/ui/StatusBadge.tsx` (modify), `src/shared/ui/ScreenScaffold.tsx` (modify — add @deprecated), `src/shared/theme/radius.ts` (modify — add comment)

---

## Compatibility Notes

- **Auth flow** (`app/(auth)/`) — completely untouched. Login/register/pending-approval all work unchanged.
- **Tecnico role** (`app/(tecnico)/`) — untouched. Tecnico uses its own `Stack` layout in `app/(tecnico)/_layout.tsx`, not the Funcionario tab navigator.
- **Root `_layout.tsx`** — no changes. `Stack` accepts `(funcionario)` group as-is; tabs auto-discovered inside.
- **Legacy screens** — `app/(funcionario)/home.tsx`, `app/(funcionario)/historial.tsx`, `app/(funcionario)/nueva-solicitud.tsx` become unreachable after tabs are live (same path is now served by `(tabs)/` sub-screens). Old files should be deleted in PR 1 (they're replaced, not kept as fallbacks).
- **RoleHomeShell** — verify `grep -r "RoleHomeShell" app/(tecnico)` returns nothing before deleting in PR 3.
- **ScreenScaffold** — mark `@deprecated` but keep in repo. Tecnico still uses it in its current stack layout; deletion is out of scope.
- **Session token** — no changes to auth context or storage. Session persistence was already working.

---

## Open Questions (flag for decision before apply)

1. Should `ScreenScaffold` be fully removed or kept as `@deprecated`? (Design says mark `@deprecated` — confirmed above)
2. Does `expo-haptics` ship with Expo 56 SDK, or is it a separate install? Verify `npx expo install expo-haptics` before PR 3.
3. Should "Cancelar" action on detail use `Alert.alert` or bottom sheet? (Defaulting to `Alert.alert` per design unless changed)
4. Should filter chips on historial persist filter state in URL query params? (Defaulting to local state unless specified)
