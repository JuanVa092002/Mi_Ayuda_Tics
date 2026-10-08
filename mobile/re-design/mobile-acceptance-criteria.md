# Mobile Acceptance Criteria — Criterios de “premium done”

Lista de verificación para considerar el rediseño mobile completo y premium.

---

## 1. Sistema visual

- [ ] **Tokens centralizados** — cero hex/rgb sueltos en `app/` o `features/`
- [ ] **Inter cargada** — Bold, Medium, Regular disponibles; no system font en UI
- [ ] **Colores institucionales** — solo `#04324D` y `#39A900` como marca
- [ ] **Sin verde Chefio** — `#1FCC79` no aparece en codebase
- [ ] **Sin panel gris** — `FormPanel` / `panelGray` eliminados
- [ ] **Contraste AA** — texto principal ≥4.5:1 sobre fondos

---

## 2. Componentes

- [ ] **Button** — 5 variantes, 3 tamaños, estados loading/disabled/pressed
- [ ] **TextInput** — 7 estados visuales según spec
- [ ] **Card** — elevated/outlined/flat
- [ ] **StatusBadge** — todos los estados de negocio mapeados
- [ ] **EmptyState** — en historial, homes, búsqueda, notificaciones
- [ ] **ErrorState** — en todas las queries con retry
- [ ] **BottomTabBar** — 4 tabs, activo/inactivo, safe area

---

## 3. Auth flow

- [ ] Welcome alineado a Figma Onboarding (wordmark, logo, copy, 2 CTAs pill)
- [ ] Login sin header image legacy
- [ ] Register con password rules visuales
- [ ] Forgot/reset con `AuthFlowPanel` en success/error
- [ ] Flujo deep link reset password intacto
- [ ] Guards y session logic sin regresión

---

## 4. Producto funcionario

- [ ] Home con stats + recientes + navegación a historial
- [ ] Historial con search + filtros
- [ ] Nueva solicitud con CTA fijo y inputs premium
- [ ] Detalle con timeline y badge de estado
- [ ] Pull-to-refresh en listas

---

## 5. Producto técnico

- [ ] Home con tabs por resolver / mis casos
- [ ] Search funcional
- [ ] Detalle caso con CTA resolver
- [ ] Form resolver con validación visual

---

## 6. Navegación

- [ ] Bottom tabs visible post-login
- [ ] Tab "Crear" contextual por rol
- [ ] Profile accesible con logout
- [ ] Notifications scaffolding presente
- [ ] Back navigation consistente en stack screens

---

## 7. UX principles compliance

- [ ] Una acción principal por pantalla
- [ ] Fondo claro default
- [ ] Whitespace generoso (padding ≥20px horizontal)
- [ ] Touch targets ≥44pt
- [ ] Keyboard no tapa CTA en forms
- [ ] Copy en español institucional (sin "recipe", "followers")

---

## 8. Motion & feedback

- [ ] Press opacity en botones y cards
- [ ] Focus transition en inputs
- [ ] Pull-to-refresh nativo
- [ ] Skeleton o inline loading (no fullscreen opaco)
- [ ] Haptics en submit success/error (donde disponible)
- [ ] Reduce Motion respetado

---

## 9. Accesibilidad

- [ ] `accessibilityRole` en botones
- [ ] `accessibilityLabel` en inputs sin label visible
- [ ] Estados no dependen solo de color
- [ ] Font scaling del OS no rompe layout crítico

---

## 10. Técnico

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm test` PASS (sin regresión)
- [ ] Smoke API PASS
- [ ] Smoke UI manual firmado (checklist phase handoff actualizado)
- [ ] Sin cambios en `client/` (web)
- [ ] Sin cambios en API contracts

---

## Definición de “premium”

La UI es premium cuando un usuario nuevo del CTPI:

1. Entiende qué es la app en **≤5 segundos** en welcome.
2. Completa login sin confusión visual.
3. Identifica su rol y siguiente acción en home.
4. Percibe la app como **institucional, moderna y confiable** — no como web embebida ni app genérica.
5. Nunca ve un estado vacío o error sin diseño.

---

## Sign-off

| Rol | Nombre | Fecha | OK |
|-----|--------|-------|-----|
| Product | | | |
| Design | | | |
| Mobile Eng | | | |
| QA | | | |

---

## Regresiones bloqueantes

Cualquiera de estos invalida el sign-off:

- Auth flow roto (login, reset, guards)
- Role routing incorrecto
- Data fetching roto en listas/detalle
- Crash en formularios con foto
- Deep link reset password roto
