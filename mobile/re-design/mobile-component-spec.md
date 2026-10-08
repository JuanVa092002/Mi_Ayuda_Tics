# Mobile Component Spec — Catálogo y contratos

Contratos reutilizables para `src/shared/ui/`. Cada componente define variantes, estados y props.

---

## 1. BrandTitle

Wordmark **MI AYUDA TICS** con colores institucionales.

```ts
interface BrandTitleProps {
  size?: 'large' | 'default';  // large: 22px, default: 18px
  align?: 'center' | 'left';
}
```

| Segmento | Color |
|----------|-------|
| MI | `brand.blue` |
| AYUDA | `brand.green` |
| TICS | `brand.blue` |

**Reemplaza:** `BrandTitle.tsx` actual.

---

## 2. Button

```ts
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'medium' | 'small';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  onPress: () => void;
}
```

### Variantes

| Variant | BG | Text | Border | Altura |
|---------|-----|------|--------|--------|
| `primary` | `brand.green` | white | none | 56 |
| `secondary` | `brand.blue` | white | none | 56 |
| `outline` | transparent | `brand.blue` | 1.5px `brand.blue` | 56 |
| `ghost` | transparent | `brand.blue` | none | auto |
| `destructive` | `state.error` | white | none | 56 |

| Size | Altura | Font |
|------|--------|------|
| `default` | 56 | 15 Bold |
| `medium` | 48 | 15 Bold |
| `small` | 40 | 14 Bold |

### Estados

| State | Visual |
|-------|--------|
| `default` | opacity 1 |
| `pressed` | opacity 0.85 |
| `disabled` | opacity 0.5 |
| `loading` | `ActivityIndicator` white, disabled |

Radius: `radius.pill` (32). Padding horizontal: 32.

**Reemplaza:** `AppButton.tsx`.

---

## 3. TextInput

Basado en Figma `Text Input` con estados de validación.

```ts
interface TextInputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  label?: string;
  state?: 'empty' | 'focus' | 'filled' | 'success' | 'warning' | 'error' | 'disabled';
  errorMessage?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;  // password toggle, clear
  editable?: boolean;
}
```

### Anatomía

| Parte | Spec |
|-------|------|
| Container | h 56, radius 32, bg white |
| Border default | 1px `border.default` |
| Border focus | 2px `border.focus` |
| Border error | 2px `state.error` |
| Padding horizontal | 16 |
| Icon slot | 24×24, margin 12 |
| Placeholder | `text.secondary`, body.p2 |
| Value | `text.primary`, body.p2 |

### Estados visuales

| State | Border | Icon trailing |
|-------|--------|---------------|
| `empty` | default | — |
| `focus` | focus green | cursor |
| `filled` | default | — |
| `success` | success | checkmark verde |
| `warning` | warning | alert amber |
| `error` | error | error icon + message debajo |

**Reemplaza:** `FormField.tsx` + `form-styles.ts`.

---

## 4. SelectField / SearchField

Extienden `TextInput` visual con comportamiento específico.

### SelectField

- Mismo container que TextInput.
- Trailing: chevron down.
- Abre picker nativo o bottom sheet (v1: picker).

### SearchField

- Leading: icono search 24px.
- Trailing (cuando filled): clear button.
- Radius pill, altura 56.

---

## 5. Card

```ts
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
  children: ReactNode;
}
```

| Variant | BG | Border | Shadow |
|---------|-----|--------|--------|
| `elevated` | white | none | `shadow.sm` |
| `outlined` | white | 1px `border.default` | none |
| `flat` | `surface.muted` | none | none |

Radius: `radius.lg` (16–24). Padding: `space.4`.

---

## 6. SolicitudListItem / CasoListItem

Card presionable para listas.

```ts
interface ListItemProps {
  title: string;
  subtitle?: string;
  status: TicketStatus;
  timestamp?: string;
  onPress: () => void;
}
```

### Layout

```
┌────────────────────────────────────┐
│ [StatusBadge]          timestamp   │
│ title (h3)                         │
│ subtitle (caption)                 │
└────────────────────────────────────┘
```

Gap interno: `space.3`. Margin bottom entre items: `space.3`.

---

## 7. StatusBadge

```ts
interface StatusBadgeProps {
  status: 'pendiente' | 'en_progreso' | 'resuelto' | 'rechazado' | 'aprobacion_pendiente';
  size?: 'default' | 'small';
}
```

Pill con padding horizontal 10, vertical 4. Typography: `badge` preset uppercase.

---

## 8. StatusTimeline

Vertical timeline para detalle. Ya existe; actualizar estilos a tokens nuevos.

- Línea: 2px `border.default`
- Dot activo: `brand.green`
- Dot pasado: `brand.blue`
- Dot futuro: `border.default`

---

## 9. SectionHeader

```ts
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Título: `heading.h2`. Action: `ghost` button o text link `brand.blue`.

---

## 10. EmptyState

```ts
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Centrado vertical en área de lista. Ilustración opcional monocromática institucional.

**Ejemplos copy:**

| Contexto | Title |
|----------|-------|
| Sin solicitudes | "Aún no tienes solicitudes" |
| Sin casos | "No hay casos por resolver" |
| Búsqueda vacía | "Sin resultados" |

---

## 11. ErrorState

```ts
interface ErrorStateProps {
  title?: string;  // default: "Algo salió mal"
  message?: string;
  onRetry?: () => void;
}
```

Banner `state.error.bg` o pantalla centrada con botón retry `outline`.

---

## 12. Banner (inline)

```ts
interface BannerProps {
  tone: 'success' | 'warning' | 'error' | 'info';
  message: string;
  dismissible?: boolean;
}
```

Altura auto, padding `space.4`, radius `radius.md`. Sin bloquear interacción.

---

## 13. Loaders

| Componente | Uso |
|------------|-----|
| `InlineLoader` | Dentro de botón (ya en Button) |
| `ScreenLoader` | Primera carga de pantalla — skeleton preferido |
| `RefreshControl` | Pull-to-refresh en listas |
| `SkeletonCard` | Placeholder de list item (3 líneas) |

**Eliminar** fullscreen spinner sin contexto salvo bootstrap inicial.

---

## 14. AuthLayout

Reemplaza `AuthScaffold` + `FormPanel`.

```ts
interface AuthLayoutProps {
  children: ReactNode;
  showBrand?: boolean;
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
}
```

- Fondo `surface.default` blanco.
- SafeArea top + bottom.
- KeyboardAvoidingView + ScrollView.
- Sin panel gris.

---

## 15. AppShell / RoleHomeShell

```ts
interface AppShellProps {
  title: string;
  subtitle?: string;
  roleLabel: string;
  children: ReactNode;
  showTabBar?: boolean;
}
```

Evolución de `RoleHomeShell`:
- Eliminar "session card" prominente → mover a tab Profile.
- Header más limpio: badge rol + título + logo SENA pequeño.
- Body con fondo `surface.muted` opcional.

---

## 16. ScreenHeader

Para pantallas internas (detalle, formularios).

```ts
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}
```

**Reemplaza** parcialmente `ScreenScaffold.tsx`.

---

## 17. BottomTabBar

```ts
type TabId = 'home' | 'create' | 'notifications' | 'profile';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;  // SF Symbol style o custom SVG
  route: string;
}
```

### Tabs por rol

| Tab | Funcionario | Técnico |
|-----|-------------|---------|
| home | Inicio | Inicio |
| create | Nueva solicitud | Casos |
| notifications | Alertas | Alertas |
| profile | Perfil | Perfil |

- Altura 56 + safe area.
- Activo: `brand.blue` icon + label.
- Inactivo: `text.tertiary`.
- BG: `surface.default` con borde top `border.default`.

---

## 18. PasswordRuleChecklist

Mantener lógica actual; actualizar estilos:
- Check icon verde `state.success` cuando cumple.
- Texto `body.caption`.
- Container sin borde, gap `space.2`.

---

## 19. AuthFlowPanel

Pantallas de resultado (éxito, error, pending). Actualizar a cards blancas centradas con icono institucional.

```ts
interface AuthFlowPanelProps {
  tone: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  primaryAction?: { label: string; onPress: () => void };
}
```

---

## 20. FilterChips

Horizontal scroll de chips para filtros en listas.

```ts
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}
```

Selected: bg `brand.blue`, text white. Unselected: bg `surface.muted`, text `text.primary`. Radius `radius.pill`, height 36.

---

## Matriz de reemplazo

| Actual | Nuevo | Prioridad |
|--------|-------|-----------|
| `AppButton` | `Button` | P0 |
| `AuthScaffold` + `FormPanel` | `AuthLayout` | P0 |
| `FormField` | `TextInput` | P0 |
| `BrandTitle` | `BrandTitle` (update) | P0 |
| `RoleHomeShell` | `AppShell` | P1 |
| `ScreenScaffold` | `ScreenHeader` + layout | P1 |
| `EmptyState` / `ErrorState` | update tokens | P1 |
| — | `BottomTabBar` | P1 |
| — | `FilterChips` | P2 |
| — | `Banner` | P2 |
