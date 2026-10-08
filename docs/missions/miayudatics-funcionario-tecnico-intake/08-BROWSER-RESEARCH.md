# 08-BROWSER-RESEARCH.md — Evidencia de Observación en Runtime y Viewports

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `BROWSER_VERIFIED` / `CODE_VERIFIED`

---

## 1. Observación de Viewports y Rendimiento

| Viewport | Ruta Observada | Comportamiento en Navegador | Evaluación |
|---|---|---|:---:|
| **1440 × 900 (Desktop Estándar)** | `/funcionario` | Master-detail en 4:8 columnas; expediente visible sin scroll lateral. | `EXCELENTE` |
| **1440 × 900 (Desktop Estándar)** | `/casos-por-resolver` | Bento Grid Var B al tope; tabla con paginador y filtros claros. | `EXCELENTE` |
| **1280 × 800 (Laptop Compacta)** | `/funcionario` | Grid se adapta a 5:7 columnas; Stepper 2x2 armónico. | `ÓPTIMO` |
| **1024 × 768 (Tablet Landscape)** | `/casos-por-resolver` | Tarjetas de caso reducen padding sin overflow. | `ÓPTIMO` |
| **390 × 844 (Mobile Phone)** | `/funcionario` | Pasa a vista de 1 columna; selección de caso navega al expediente. | `ADAPTADO` |
| **390 × 844 (Mobile Phone)** | `/casos-por-resolver` | Tabla colapsa a tarjetas táctiles individuales; botón de acción fijo. | `ADAPTADO` |
| **Zoom 200% (Accesibilidad)** | Ambas rutas | Textos escalan sin truncamiento ni superposición destructiva. | `CUMPLE A11Y` |

---

## 2. Errores de Consola y Red Observados
- **Errores de Red:** Cero solicitudes fallidas durante navegación normal (HTTP 200/201 en endpoints de catálogos y colas).
- **Consola:** Advertencias estándar de React Router v6 sobre futuras flags v7 (`v7_startTransition`, `v7_relativeSplatPath`), sin impacto en runtime.
- **Teclado:** Navegación por `Tab` e interacción con `Escape` para cerrar drawers y modales verificado.
