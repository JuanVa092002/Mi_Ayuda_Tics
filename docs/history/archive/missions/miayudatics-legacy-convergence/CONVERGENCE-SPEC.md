# Especificación de Convergencia UX/UI Multirol (CONVERGENCE-SPEC)

## 1. Principios Rectores y Reglas Mandatorias

Siguiendo los principios de FAANG, Stripe, Linear y Apple HIG, este documento establece las reglas canónicas e inviolables de diseño y de interacción para toda la aplicación web `MiAyudaTICS`.

---

## 2. Reglas de Componentes

### 2.1. Botones y Elementos Accionables
- **Regla 1:** Toda acción ejecutable (guardar, actualizar, cancelar, filtrar, aprobar) DEBE utilizar el componente canónico `Button` (`client/src/shared/ui/Button.tsx`).
- **Regla 2:** Prohibido el uso de botones con apariencia de texto plano (`text-[10px] text-slate-600`) para acciones operativas (como "Reasignar" o "Cancelar").
- **Regla 3:** Los estados informativos y estatus NUNCA deben ser botones; deben ser exclusivamente `StatusBadge`.
- **Regla 4:** Los enlaces (`<a>` o `<Link>`) se reservan exclusivamente para navegación de ruta; nunca para mutar estado ni disparar peticiones API.
- **Regla 5:** Todo botón ejecutable debe tener un verbo claro ("Guardar cambios", "Asignar técnico", "Reintentar").
- **Regla 6:** Todo botón debe satisfacer un área táctil mínima accesible (`min-h-[36px]` para `sm`, `min-h-[40px]` para `md`, `min-h-[44px]` para `lg`) con estados `:focus-visible` diferenciados.

### 2.2. Modales, Drawers y Diálogos
- **Regla 1 (SlideOverDrawer):** Obligatorio para cualquier formulario contextual, edición de entidad o proceso asistido que requiera entrada de datos (radicación de caso, reasignación con motivo, bitácora técnica).
- **Regla 2 (Modal / ConfirmDialog):** Reservado estrictamente para confirmaciones destructivas breves o decisiones atómicas binarias (ej: confirmación irrevocable de eliminación).
- **Regla 3 (Página Completa):** Reservado para flujos extensos o vistas que requieran aislamiento total de contexto.
- **Regla 4:** Todo diálogo debe soportar cierre con tecla `Escape`, tener foco atrapado y backdrop con desenfoque suave (`backdrop-blur-xs`).

### 2.3. Tablas, Listas y Workspaces
- **Regla 1:** En las consolas principales de trabajo diario (`/adminSolicitud`, `/funcionario`, `/casos-por-resolver`), la arquitectura es obligatoriamente `SplitWorkspace` (`QueueList` + `DetailPane`).
- **Regla 2:** En vistas históricas o secundarias (`/seguimiento`, `/adminTecnicos`, `/mis-casos`), las tablas deben tener columnas compactas y prioritarias, evitando el scroll horizontal descontrolado mediante tipografía condensada y acciones agrupadas.
- **Regla 3:** Las filas de una tabla o cola deben ser interactivas y mostrar retroalimentación de selección clara (`is-selected`, `border-l-2`).

### 2.4. Tokens de Superficie y Canvas
- **Canvas global:** Fondo homogéneo en toda la app: `var(--bg)` (`#f0f4f6`).
- **Superficies:** 
  - Nivel 0 (tarjetas principales): `var(--surface-0)` (`#ffffff`) con bordes `var(--border-c)` (`#dde5e9`).
  - Nivel 1 (fondos sutiles, cabeceras de paneles): `var(--surface-1)` (`#f7f9fa`).
  - Nivel Seleccionado: `var(--surface-sel)` (`#e8f3ed`).
- **Bordes:** Esquinas redondeadas controladas mediante tokens: `rounded-xl` (10-12px) y `rounded-2xl` (14-16px). Se prohíben radios arbitrarios disonantes.

### 2.5. Tipografía y Spacing
- **Familia:** `Inter`, tipografía de grado de sistema con renderizado optimizado (`-webkit-font-smoothing: antialiased`).
- **Escala:**
  - Títulos de página / workspace: `text-xl` a `text-2xl` font-black.
  - Títulos de sección / panel: `text-sm` a `text-base` font-bold.
  - Etiquetas y metadatos: `text-[10px]` a `text-[11px]` font-semibold uppercase tracking-wider.
  - Cuerpo y lecturas: `text-xs` a `text-sm` font-medium.
- **Spacing:** Múltiplos consistentes de 4px (`p-2`, `p-3`, `p-4`, `p-6`, `gap-2`, `gap-4`, `gap-6`). Prohibidos márgenes mágicos o padding desalineado entre páginas hermanas.

---

## 3. Modelo Mental Distintivo por Rol

A pesar de converger sobre las mismas primitivas y tokens visuales, cada rol preserva su modelo mental exclusivo:

1. **Líder TIC:** Centro de Decisión y Despacho.
   - Enfoque: balance de carga, velocidad de asignación en 1 toque, métricas operativas en vivo, triage visual.
2. **Funcionario:** Centro de Acompañamiento y Cercanía Institucional.
   - Enfoque: transparencia, tranquilidad, estatus en tiempo real, lenguaje comprensible, línea de vida clara.
3. **Técnico:** Consola de Resolución Operativa.
   - Enfoque: alta densidad de datos, enfoque en el caso actual de trabajo, ejecución rápida de bitácora y soluciones con teclado y clics directos.
