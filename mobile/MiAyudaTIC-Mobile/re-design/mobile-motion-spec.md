# Mobile Motion & Interaction Spec

Motion sutil, útil y nativo. Sin animaciones decorativas que retrasen la operación.

---

## Principios

1. **Funcional** — la animación confirma una acción, no adorna.
2. **Rápida** — la mayoría <300ms.
3. **Consistente** — mismas curvas para el mismo tipo de transición.
4. **Respetuosa** — honrar `Reduce Motion` del sistema.

---

## Duraciones

| Token | ms | Uso |
|-------|-----|-----|
| `duration.instant` | 100 | Opacity press feedback |
| `duration.fast` | 200 | Tab switch, chip select |
| `duration.normal` | 300 | Screen transition, sheet |
| `duration.slow` | 400 | Modal entrance (raro) |

---

## Easings

| Token | Curva | Uso |
|-------|-------|-----|
| `easing.standard` | ease-out | Entradas |
| `easing.decelerate` | cubic-bezier(0, 0, 0.2, 1) | Elementos que llegan a reposo |
| `easing.spring` | spring(damping: 20, stiffness: 300) | Bottom sheet, swipe dismiss |

**Dependencia sugerida:** `react-native-reanimated` + `react-native-gesture-handler` (evaluar en implementación).

---

## Interacciones por componente

### Button

| Evento | Motion |
|--------|--------|
| Press in | opacity → 0.85, `duration.instant` |
| Press out | opacity → 1 |
| Loading | crossfade label → spinner, 150ms |

### TextInput

| Evento | Motion |
|--------|--------|
| Focus | border color transition 200ms |
| Error appear | shake horizontal 4px × 2, 300ms (solo si motion enabled) |
| Success | checkmark scale 0→1, 200ms |

### Card / ListItem

| Evento | Motion |
|--------|--------|
| Press in | scale 0.98, opacity 0.95 |
| Press out | scale 1 |

### Tab bar

| Evento | Motion |
|--------|--------|
| Tab change | icon color fade 200ms; sin bounce |
| Badge appear | scale 0→1 spring suave |

---

## Transiciones de navegación

| Tipo | Comportamiento |
|------|----------------|
| Stack push (detalle) | Slide from right — default Expo Router |
| Stack pop | Slide to right |
| Modal / sheet | Slide from bottom, 300ms |
| Tab switch | Sin animación de slide; fade content opcional |
| Auth → Home | Replace con fade 300ms post-login |

No customizar transiciones de stack salvo modales.

---

## Listas

| Patrón | Motion |
|--------|--------|
| Pull-to-refresh | Native `RefreshControl` |
| Infinite scroll | Spinner footer inline |
| Item enter | Fade-in stagger 50ms entre items (opcional, listas cortas) |
| Empty → con datos | Crossfade empty state → lista, 200ms |

---

## Formularios

| Patrón | Motion |
|--------|--------|
| Keyboard open | `KeyboardAvoidingView` padding — sin animación custom |
| Step form (nueva solicitud) | Horizontal slide entre pasos si multi-step en futuro |
| Submit success | Navigate a success screen con fade |

---

## Feedback de sistema

| Acción | Feedback |
|--------|------------|
| Submit exitoso | Haptic `notificationSuccess` (iOS) / vibrate corto (Android) |
| Error validación | Haptic `notificationError` |
| Tap en tab | Haptic `selection` (ligero) |
| Pull refresh complete | Sin haptic |

**Dependencia:** `expo-haptics`.

---

## Loading patterns

| Escenario | Patrón |
|-----------|--------|
| Primera carga lista | 3× `SkeletonCard` |
| Refresh | Pull indicator nativo |
| Submit form | Button loading state |
| Bootstrap app | Logo centrado + spinner pequeño (splash) |

Evitar `FullScreenLoader` opaco salvo en `index.tsx` bootstrap.

---

## Reduce Motion

```ts
import { AccessibilityInfo } from 'react-native';

// Si reduceMotionEnabled:
// - Sin shake en errores
// - Sin stagger en listas
// - Sin scale en cards
// - Mantener opacity y color transitions (menos intrusivas)
```

---

## Contrato motion (TypeScript)

```ts
export const motion = {
  duration: { instant: 100, fast: 200, normal: 300, slow: 400 },
  pressOpacity: 0.85,
  cardPressScale: 0.98,
} as const;
```

---

## Fuera de scope v1

- Lottie illustrations
- Parallax en scroll
- Animaciones de onboarding carousel
- Shared element transitions
