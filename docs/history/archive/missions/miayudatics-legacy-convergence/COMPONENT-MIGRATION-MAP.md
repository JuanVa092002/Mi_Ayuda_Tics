# Mapa de Migración y Convergencia de Componentes

## 1. Mapeo Sistemático: De Legacy a Canónico

| Componente / Patrón Legacy | Componente Canónico | Rutas Afectadas | Cambios Necesarios | Test Requerido | Plan de Rollback |
|---|---|---|---|---|---|
| `PrimaryButton.tsx` (duplicado no usado) | `Button` (`variant="primary"`) | `client/src/shared/ui/` | Exportar `Button` y mantener alias de compatibilidad en `PrimaryButton.tsx` redirigiendo a `Button` | `client/src/tests/` unit suite | Revertir archivo `PrimaryButton.tsx` |
| `SecondaryButton.tsx` (duplicado no usado) | `Button` (`variant="secondary"`) | `client/src/shared/ui/` | Mantener alias de compatibilidad redirigiendo a `Button` | `client/src/tests/` unit suite | Revertir archivo `SecondaryButton.tsx` |
| `LeaderKpiCard.tsx` (duplicado) | `KpiCard` (`shared/ui/KpiCard.tsx`) | `/seguimiento` (`SeguimientoSolicitud.tsx`) | Migrar a `KpiCard` (`tone="navy"`, `"green"`, `"muted"`), usando los tokens CSS `--brand-subtle`, `--accent-subtle` | `SeguimientoSolicitud.test.tsx` / vitest | Revertir imports en `SeguimientoSolicitud.tsx` |
| `LeaderStatusPill.tsx` (duplicado) | `StatusBadge` (`shared/ui/StatusBadge.tsx`) | `/seguimiento` (`SeguimientoSolicitud.tsx`) | Sustituir píldoras ad-hoc por el dot-system accesible de `StatusBadge` | Vitest snapshot/render tests | Revertir imports en `SeguimientoSolicitud.tsx` |
| Botones inline tipo texto en `/seguimiento` | `Button` (`variant="tertiary"`, `variant="secondary"`, `variant="destructive"`) | `/seguimiento` (`SeguimientoSolicitud.tsx`) | Reemplazar `<button className="text-[10px] font-bold uppercase text-slate-600">` por botones estructurados con min-height accesible | Vitest click handlers | Revertir bloques JSX de acciones |
| Modal tipo prompt en `/seguimiento` | `SlideOverDrawer` (`shared/ui/SlideOverDrawer.tsx`) | `/seguimiento` (`SeguimientoSolicitud.tsx`) | Convertir el diálogo flotante básico en un `SlideOverDrawer` accesible con escape key, backdrop y focus trap | Vitest modal interaction | Revertir drawer JSX |
| Botones ad-hoc en `/adminTecnicos` y `/tecnicosActivos` | `Button` (`variant="success"`, `variant="secondary"`, `variant="destructive"`) | `/adminTecnicos`, `/tecnicosActivos`, `/tecnicosInactivos` | Reemplazar botones nativos con estilos Tailwind por `Button` | Vitest render | Revertir botones en `AdminTecnicos.tsx` |
| Formularios en `/adminAmbientes` y `/adminCasos` | `Button` (`variant="primary"`, `variant="secondary"`) | `/adminAmbientes`, `/adminCasos` | Normalizar botones de creación y edición a la primitiva `Button` | Vitest form submit | Revertir form actions |
| Doble layout anidado `AdminTecnicosLayout` | `LeaderLayout` + `NavTecnicos` unificado | `/adminTecnicos`, `/tecnicosActivos`, `/tecnicosInactivos` | Armonizar `NavTecnicos` como CommandBar/Subnavigation limpia dentro de `LeaderLayout` sin duplicación de márgenes | Test de navegación | Revertir layouts |

---

## 2. Secuencia de Ejecución por Dominios

1. **Grupo A: Foundation & Shared UI Primitives**
   - Asegurar que `shared/ui/index.ts`, `PrimaryButton`, `SecondaryButton`, `KpiCard` y `StatusBadge` sean plenamente interoperables y libres de duplicidad.
2. **Grupo B: Líder TIC Superficies Secundarias (`/seguimiento`, `/adminTecnicos`, `/adminAmbientes`, `/adminCasos`, `/adminEstadisticas`)**
   - Eliminar botones tipo texto en `/seguimiento`.
   - Migrar diálogo de cancelación/reasignación a `SlideOverDrawer`.
   - Normalizar botones y tablas a los tokens compartidos.
3. **Grupo C: Funcionario y Técnico Superficies Secundarias (`/mis-casos`, `/casos-resueltos`, `/perfil`)**
   - Verificar armonización tipográfica, espaciado de tarjetas y botones de acción.
4. **Grupo D: Protección estricta con TDD y validación visual**
   - Ejecutar vitest y verificar rutas clave en Browser subagent.
