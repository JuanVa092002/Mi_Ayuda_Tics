# Inventario de Componentes y Superficies Legacy

## 1. Metodología de Clasificación

Cada componente y superficie del frontend (`client/src/`) se clasifica en una de las siguientes categorías:

- **CANONICAL:** Primitiva de diseño estándar aprobada, alineada con los tokens del design system y con accesibilidad completa.
- **SHARED:** Componente compartido legítimo utilizado transversalmente sin patrones obsoletos.
- **ROLE_SPECIFIC:** Vista o componente especializado con el modelo mental exclusivo del rol (`Líder TIC`, `Funcionario`, `Técnico`).
- **LEGACY:** Implementación antigua con estilos inline, clases obsoletas, tablas con scroll horizontal o markup heterogéneo.
- **DUPLICATE:** Componente redundante que replica la funcionalidad de uno canónico.
- **DEAD:** Código muerto o sin consumidores en el árbol de rutas activo.

---

## 2. Matriz de Inventario y Clasificación

| Elemento | Ubicación | Estado | Consumo / Uso | Sustituto Canónico | Riesgo | Acción |
|---|---|---|---|---|---|---|
| `PrimaryButton.tsx` | `shared/ui/PrimaryButton.tsx` | DUPLICATE / DEAD | Exportado en `shared/ui/index.ts`, 0 consumidores en páginas | `Button` (`variant="primary"`) | Muy bajo | Reemplazar por alias de `Button` o mantener delegación transparente sin breaking changes |
| `SecondaryButton.tsx` | `shared/ui/SecondaryButton.tsx` | DUPLICATE / DEAD | Exportado en `shared/ui/index.ts`, 0 consumidores en páginas | `Button` (`variant="secondary"`) | Muy bajo | Reemplazar por alias de `Button` o delegación transparente |
| `LeaderKpiCard.tsx` | `shared/ui/LeaderKpiCard.tsx` | DUPLICATE / LEGACY | Usado en `SeguimientoSolicitud.tsx` | `KpiCard` (`shared/ui/KpiCard.tsx`) | Bajo | Migrar consumidores a `KpiCard` con tokens CSS globales y retirar duplicación |
| `LeaderStatusPill.tsx` | `shared/ui/LeaderStatusPill.tsx` | DUPLICATE / LEGACY | Usado en `SeguimientoSolicitud.tsx` | `StatusBadge` (`shared/ui/StatusBadge.tsx`) | Bajo | Migrar consumidores a `StatusBadge` con dot-system canónico |
| `Loaders.tsx` | `shared/ui/Loaders.tsx` | LEGACY | Usado en `AdminEstadisticas.tsx` | `AdaptiveSkeleton` o spinner canónico | Muy bajo | Converger hacia skeletons / estados de carga unificados |
| `AppLayout.tsx` | `app/layouts/AppLayout.tsx` | DEAD / LEGACY | 0 consumidores en rutas activas; usa `NavApp` legacy | `AppShell` | Medio | Desincorporar o marcar obsoleto; verificar que ninguna ruta lo use |
| `AdminLayout.tsx` | `app/layouts/AdminLayout.tsx` | DEAD / LEGACY | 0 consumidores en rutas activas; usa `NavAdmin` | `LeaderLayout` / `AppShell` | Medio | Retirar consumidores residuales |
| `TecnicoLayout.tsx` | `app/layouts/TecnicoLayout.tsx` | DEAD / LEGACY | 0 consumidores en rutas activas; usa `NavTecnico` | `AppShell` | Medio | Desincorporar; vistas técnicas usan `AppShell` directamente |
| `AdminSolicitudLayout.tsx` | `app/layouts/AdminSolicitudLayout.tsx` | DEAD / LEGACY | 0 consumidores | `LeaderLayout` / `AppShell` | Bajo | Eliminar o desincorporar |
| `AdminTecnicosLayout.tsx` | `app/layouts/AdminTecnicosLayout.tsx` | LEGACY | Usado en `AdminTecnicos`, `TecnicosActivos`, `TecnicosInactivos` | `AppShell` con subnavegación `NavTecnicos` integrada | Medio | Converger hacia `LeaderLayout` con `CommandBar` o subtabs armonizadas sin layouts anidados |
| `NavApp.tsx` | `shared/ui/NavApp.tsx` | LEGACY | Consumido únicamente por `AppLayout.tsx` | `AppShell` (`shared/ui/AppShell.tsx`) | Medio | Retirar al eliminar `AppLayout` |
| `NavAdmin.tsx` | `features/users/components/NavAdmin.tsx` | LEGACY / DEAD | Solo consumido por `AdminLayout.tsx` | `RoleNavigation` (`shared/ui/RoleNavigation.tsx`) | Bajo | Desincorporar |
| `NavTecnico.tsx` | `features/tickets/components/NavTecnico.tsx` | LEGACY / DEAD | Solo consumido por `TecnicoLayout.tsx` | `RoleNavigation` (`shared/ui/RoleNavigation.tsx`) | Bajo | Desincorporar |
| `NavSolicitud.tsx` | `features/users/components/NavSolicitud.tsx` | LEGACY / DEAD | Solo consumido por `AdminSolicitudLayout.tsx` | `RoleNavigation` (`shared/ui/RoleNavigation.tsx`) | Bajo | Desincorporar |
| Botones inline tipo texto en `SeguimientoSolicitud` | `pages/admin/solicitud/SeguimientoSolicitud.tsx:270-282` | LEGACY | Botones "Ver historial", "Reasignar", "Cancelar" con clases texto inline | `Button` con variantes semánticas | Alto | Converger a botones interactivos accesibles `Button` `size="sm"` |
| Modal tipo prompt en `SeguimientoSolicitud` | `pages/admin/solicitud/SeguimientoSolicitud.tsx:318-340` | LEGACY | Diálogo modal inline con textarea sin accesibilidad | `SlideOverDrawer` o `ConfirmDialog` canónico | Medio | Migrar a `SlideOverDrawer` con control de foco y escape |
| Tabla ancha operativa en `SeguimientoSolicitud` | `pages/admin/solicitud/SeguimientoSolicitud.tsx:198-299` | LEGACY | Tabla con 9 columnas y scroll horizontal | `SplitWorkspace` (`QueueList` + `DetailPane`) o tabla simplificada | Alto | Convertir a arquitectura master-detail cohesiva con Líder TIC |
| Botones tipo submit sin primitiva en `AdminAmbientes` | `pages/admin/AdminAmbientes.tsx:134-150` | LEGACY | Botones con Tailwind ad-hoc (`shadow-lg shadow-primary-container/20`) | `Button` canónico | Medio | Migrar a `Button` `variant="primary"` / `variant="secondary"` |
| Botones tipo submit sin primitiva en `AdminCasos` | `pages/admin/AdminCasos.tsx` | LEGACY | Botones con Tailwind ad-hoc y colores dispersos | `Button` canónico | Medio | Migrar a `Button` canónico |
| Select nativo sin estilos en `AdminEstadisticas` | `pages/admin/AdminEstadisticas.tsx:112-124` | LEGACY | Select nativo sin tokens | `CustomSelect` o select tokenizado | Bajo | Aplicar clases y tokens canónicos |
| Paginadores ad-hoc en `AdminTecnicos`, `AdminAmbientes`, `AdminCasos` | Páginas de admin | LEGACY | Paginadores manuales con clases `pagination-btn` repetidas | `PaginationFooter` canónico | Medio | Sustituir por `PaginationFooter` |

---

## 3. Diagnóstico de Fricciones Visuales y de Interacción

1. **Inconsistencia de botones:**
   - Páginas nuevas (`AdminSolicitud`, `Funcionario`, `CasosPorResolverTabla`) usan `Button` con variantes precisas (`primary`, `secondary`, `tertiary`, `destructive`, `success`) y focus-visible.
   - Páginas secundarias (`SeguimientoSolicitud`, `AdminTecnicos`, `AdminAmbientes`, `AdminCasos`) usan `<button>` inline con estilos manuales, algunos imitando texto plano ("Reasignar", "Cancelar"), lo que vulnera el principio FAANG/Apple HIG de affordance táctil y teclado.

2. **Doble sistema de Layouts:**
   - Rutas principales usan `AppShell` / `LeaderLayout`.
   - Vistas de gestión de técnicos usan `AdminTecnicosLayout` dentro de `LeaderLayout` (doble nivel de navegación), generando padding excesivo y pérdida de contexto institucional.
   - Existen archivos legacy como `AdminLayout`, `TecnicoLayout`, `AdminSolicitudLayout` y `AppLayout` que no están conectados al router o mantienen patrones pre-convergencia.

3. **Duplicación de primitivas de KPI y Estado:**
   - Coexisten `LeaderKpiCard` vs `KpiCard`.
   - Coexisten `LeaderStatusPill` vs `StatusBadge`.
   - Convergeremos hacia `KpiCard` y `StatusBadge` para tener una única fuente de verdad tipográfica, tonal y de accesibilidad.
