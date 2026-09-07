## Handoff — UX/UI premium para funcionario mobile

**Date:** 2026-09-06  
**Role:** Design Engineer + Mobile Engineer  
**Workstream ID:** funcionario-native-premium

### Goal

Elevar las vistas de funcionario a una experiencia móvil nativa coherente, clara y rápida para registrar y seguir solicitudes.

### Why this matters

Reduce la fricción del JTBD principal: reportar un problema con evidencia y confiar en su seguimiento; apoya la métrica de adopción de reportes móviles del piloto.

### Relevant context

Files/docs read:

- [x] `docs/product.md`
- [x] `docs/contracts.md`
- [x] `docs/architecture.md`
- [x] `docs/design-system.md`
- [x] `docs/quality-bar.md`
- [x] `context/current-mobile-agent-context.md`
- [x] Guías Apple HIG, Material 3, Android core quality, Expo y Reanimated indicadas por producto.

### Constraints

- **In scope:** `mobile/MiAyudaTIC-Mobile`, vistas funcionario y primitivas UI visibles en esos flujos.
- **Out of scope:** API, contratos backend, auth/RBAC, técnico, líder, dependencias y Flutter legado.
- **HITL touched:** no.

### Files touched

| Path | Change summary |
|---|---|
| `app/(funcionario)/(tabs)/(home)/index.tsx` | Inicio con jerarquía clara, una CTA, actividad y métricas escaneables. |
| `app/(funcionario)/(tabs)/(historial)/index.tsx` | Cabecera, contador y filtros legibles en scroll horizontal. |
| `app/(funcionario)/(tabs)/(cuenta)/index.tsx` | Superficies, rol y filas de cuenta consistentes. |
| `app/(funcionario)/(tabs)/_layout.tsx` | Tipografía, feedback y accesibilidad de tabs. |
| `src/features/solicitudes/components/SolicitudForm.tsx` | CTA de envío persistente, respetuosa de teclado y safe area. |
| `src/features/solicitudes/screens/SolicitudDetailScreen.tsx` | Detalle organizado por progreso, contexto, descripción y evidencia. |
| `src/shared/contracts/solicitud.*` | Etiquetas usuario: Enviada / En atención / Requiere información / Resuelta. |
| `src/shared/theme/typography.ts` | Escala tipográfica con jerarquía móvil más clara. |
| `src/shared/ui/FilterChips.tsx` | Filtros accesibles de 44 dp sin comprimir texto. |
| `src/shared/ui/SolicitudListItem.tsx` | Feedback táctil solo al abrir un caso y pista de accesibilidad. |

### Decisions made

| Decision | Rationale | Reversible? |
|---|---|---|
| Una CTA verde por pantalla | Mantiene la siguiente acción evidente y conserva el sistema SENA. | Sí |
| Filtros horizontales, no segmentos comprimidos | Respeta targets de 44+ dp y evita cortar etiquetas. | Sí |
| CTA fijo en formulario | Mantiene la acción principal disponible sin cubrir campos ni teclado. | Sí |
| Sin Reanimated/Gesture Handler nuevos | Hay un incidente abierto de Worklets; el feedback actual anima únicamente opacidad/transform nativos. | Sí |

### Risks

| Risk | Severity | Mitigation |
|---|---|---|
| El AVD local no arranca por una skin inexistente (`Galaxy_S26_Ultra`). | P1 | Corregir/crear AVD válido y ejecutar smoke manual en emulador y A30s. |
| P1A (retorno de cámara) y P1C (Back Android) siguen abiertos en el contexto canónico. | P1 | Validar los flujos manualmente antes de release; no se cambiaron guards ni navegación de retorno. |
| Tema oscuro completo aún no está implementado a nivel de app. | P2 | Tratarlo como workstream de sistema de diseño, no como parche de estas pantallas. |

### Open questions

1. ¿Debe el equipo crear un AVD Pixel oficial para el smoke Android, en lugar de mantener la skin Samsung descargada?
2. ¿Se aprueba una fase separada para tema oscuro y Dynamic Type auditado en todas las rutas móviles?

### Next owner

| Role | Task |
|---|---|
| Mobile Engineer | Smoke en Android: crear solicitud, cámara/galería, teclado, back y detalle con evidencia. |
| Design Engineer | Revisión visual sobre capturas 360×800 y 412×915; contrastes y truncamiento. |
| QA pre-merge | Revisar diff móvil (>200 LOC) y emitir Go/No-Go. |

### Acceptance criteria

- [x] Inicio, historial, detalle, formulario y cuenta usan el mismo lenguaje visual institucional.
- [x] Una solicitud conserva estado, código y evidencia en una jerarquía escaneable.
- [x] Acciones táctiles principales tienen 44 dp o más y labels de accesibilidad.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [ ] Smoke manual Android pendiente de AVD funcional.

**Verification commands run:**

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm typecheck # PASS
pnpm test      # PASS — 31 files, 197 tests
git diff --check -- <scope> # PASS
```

### Reviewer sign-off

| Reviewer role | Name | Date | Approved |
|---|---|---|---|
| QA pre-merge | Pending | — | [ ] |
