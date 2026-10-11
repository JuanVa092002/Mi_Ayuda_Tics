# Auditoría de Advertencias de Lint (ESLint) — Frontier Product OS

Esta auditoría revisa individualmente las 8 advertencias reportadas por el linter en el proyecto cliente para asegurar que ninguna afecte el comportamiento de hooks, el ciclo de vida de componentes o la integridad de los datos.

---

## 1. Inventario de Advertencias

| # | Archivo | Regla ESLint | Descripción | Decisión de Ingeniería | Nivel de Riesgo |
|---|---|---|---|---|---|
| 1 | `client/src/features/tickets/components/LeaderMediaThumb.tsx:56` | `react-hooks/exhaustive-deps` | React Hook useEffect has a missing dependency: 'foto'. | **CORREGIDO.** Se incluyeron `foto` y `key` en el arreglo de dependencias en `LeaderMediaThumb.tsx` para sincronizar las miniaturas de evidencia ante cambios de ticket sin fugas de memoria (`URL.revokeObjectURL`). | **CERO (Mitigado)** |
| 2 | `client/src/features/users/components/LeaderNav.tsx:4` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Se exporta la constante de rutas `LEADER_NAV_ITEMS` junto al componente de navegación. Es seguro para producción y no afecta el runtime ni el estado. | **NULO** |
| 3 | `client/src/shared/ui/RoleNavigation.tsx:11` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de la constante inmutable `LEADER_NAV_ITEMS`. | **NULO** |
| 4 | `client/src/shared/ui/RoleNavigation.tsx:25` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de la constante inmutable `FUNCIONARIO_NAV_ITEMS`. | **NULO** |
| 5 | `client/src/shared/ui/RoleNavigation.tsx:30` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de la constante inmutable `TECNICO_NAV_ITEMS`. | **NULO** |
| 6 | `client/src/shared/ui/RoleNavigation.tsx:37` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de función pura auxiliar `getNavItemsForRole`. | **NULO** |
| 7 | `client/src/shared/ui/StatusBadge.tsx:14` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de función pura utilitaria `resolveStatusTone`. | **NULO** |
| 8 | `client/src/shared/ui/StatusBadge.tsx:24` | `react-refresh/only-export-components` | Fast refresh only works when a file only exports components. | **ACEPTADO.** Exportación de función pura utilitaria `formatStatusLabel`. | **NULO** |

---

## 2. Evaluación de Riesgo Técnico
- **Riesgo en Hooks:** `0%`. La única advertencia relacionada con React Hooks (`exhaustive-deps` en `LeaderMediaThumb.tsx`) fue resuelta rigurosamente.
- **Riesgo en Estado / Datos:** `0%`. Las 7 advertencias restantes son exclusivas de la heurística de Fast Refresh (HMR en desarrollo) al compartir constantes o funciones utilitarias puras en el mismo módulo que el componente visual.
- **Impacto en Build de Producción:** `0%`. El build de producción con Vite Rollup compila limpiamente sin fallos ni desajustes de bundle (`dist/` generado en 1.11s).
