# Mobile UX Principles — Principios obligatorios

Reglas que **no se negocian** en el rediseño. Si una implementación las viola, no se considera premium.

---

## 1. Mobile-first real

- Diseñar para viewport 375×812 como referencia; escalar con constraints, no con zoom web.
- Áreas táctiles mínimas **44×44 pt**.
- Contenido crítico visible sin scroll horizontal.
- Teclado nunca oculta el CTA principal sin `KeyboardAvoidingView`.

## 2. Native feel

- Usar `SafeAreaView` / `react-native-safe-area-context` en todos los shells.
- Bottom tab bar para usuario autenticado (funcionario y técnico).
- Transiciones de stack estándar Expo Router; no animaciones web.
- Pull-to-refresh en listas de datos.
- Status bar del sistema; no mockups iOS pintados.

## 3. Premium con aire

- Padding horizontal base **20–24px**.
- Separación vertical generosa entre secciones (**24–32px**).
- Fondo default `#FFFFFF`; surfaces secundarias `#F8FAFB` como máximo.
- Máximo **1–2** niveles de elevación visual por pantalla.

## 4. Marca institucional con disciplina

- Azul `#04324D` → estructura, navegación, CTAs secundarios, wordmark parcial.
- Verde `#39A900` → acción primaria, éxito, acentos de marca.
- Nunca fondo completo azul o verde en pantallas de contenido.
- Logo SENA como ancla institucional, no como wallpaper.

## 5. Una acción principal por pantalla

| Pantalla | Acción principal |
|----------|------------------|
| Welcome | Login |
| Login | Iniciar sesión |
| Register | Crear cuenta |
| Forgot password | Enviar enlace |
| Funcionario home | Nueva solicitud |
| Técnico home | Ver caso prioritario / lista |
| Detalle | Acción contextual (seguir, resolver) |
| Formularios | Enviar |

Acciones secundarias van en texto link o icono header, nunca compiten visualmente con el CTA.

## 6. Jerarquía tipográfica clara

- **Un solo H1** por pantalla (o equivalente visual).
- Body nunca compite con el título en peso o tamaño.
- Labels de formulario siempre más pequeños que el input value.
- Ver [mobile-typography-spec.md](./mobile-typography-spec.md).

## 7. Motion sutil y útil

- Duración estándar **200–300ms** para micro-interacciones.
- Spring solo en gestos (sheet, swipe); no en cada tap.
- Loading siempre visible en operaciones >300ms.
- Ver [mobile-motion-spec.md](./mobile-motion-spec.md).

## 8. Accesibilidad y legibilidad

- Contraste texto/fondo ≥ **4.5:1** (WCAG AA).
- `accessibilityRole` y `accessibilityLabel` en botones e inputs.
- No depender solo del color para estados (añadir icono o texto).
- Tamaño mínimo body **15px** en mobile.

## 9. Consistencia total

- Mismo componente `Button` en auth y producto.
- Mismo `TextInput` en login y nueva solicitud.
- Mismos estados vacío/error en todas las listas.
- Tokens centralizados; cero hex sueltos en pantallas.

## 10. Confianza, orden y claridad

- Copy en español institucional, directo, sin jerga de recetas del mockup.
- Errores explican qué pasó y qué hacer.
- Estados de ticket/caso siempre visibles con `StatusBadge`.
- Sin dark patterns, sin CTAs engañosos.

---

## Anti-patrones prohibidos

| Anti-patrón | Por qué |
|-------------|---------|
| Panel gris curvo en auth | Rompe premium; legacy actual |
| Botones rectangulares 8px radius | No alineado con mockup |
| Múltiples CTAs del mismo peso visual | Confunde al usuario |
| Listas sin empty state | Sensación de app rota |
| Spinner fullscreen sin contexto | Ansiedad; usar skeleton o inline |
| Copiar strings del PDF Chefio | “Recipe”, “followers”, etc. |
| Saturar pantalla con verde/azul | Pierde institucional premium |

---

## Checklist rápido por pantalla nueva

- [ ] ¿Fondo claro con aire?
- [ ] ¿Una sola acción principal?
- [ ] ¿H1 + body con escala correcta?
- [ ] ¿Safe areas respetadas?
- [ ] ¿Estados loading/empty/error definidos?
- [ ] ¿Tokens, no valores hardcoded?
- [ ] ¿Copy institucional MiAyudaTIC?
