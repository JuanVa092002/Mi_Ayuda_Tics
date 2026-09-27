# MiAyudaTICS — Dirección de Diseño y Sistema Común (Fase 2)

**Fecha:** 2026-09-27  
**Líderes de Diseño:** Staff Product Designer, UI Systems Designer, Accessibility Specialist & Product Quality Director  
**Objetivo:** Establecer la constitución visual, técnica y de interacción para todos los roles de MiAyudaTICS.

---

## 1. Idea Visual y Principios Rectores

### 1.1 La Idea Visual: *Claridad Institucional y Operación Serena*
MiAyudaTICS es una herramienta operativa del SENA (Centro de Teleinformática y Producción Industrial - CTPI). Debe sentirse como software de infraestructura crítica:
- **Sobrio y elegante:** Sin degradados decorativos ni efectos visuales innecesarios.
- **Rápido de escanear:** Jerarquía tipográfica evidente que guía la mirada hacia la siguiente acción prioritaria.
- **Predecible y confiable:** Los tres roles (Líder TIC, Funcionario, Técnico) comparten el mismo marco espacial, comportamiento de botones, estados de carga y navegación.

### 1.2 Principios de Diseño
1. **Claridad antes que decoración:** Todo elemento gráfico debe responder a una necesidad funcional de orientación, estado o retroalimentación.
2. **Consistencia antes que novedad:** Un solo botón primario por vista, un solo estilo de tarjeta, una sola escala tipográfica y un solo formato de tabla.
3. **Flujo natural del documento:** Prohibido el uso de `vh`, `h-screen` o alturas fijas para contener listas o formularios dinámicos.
4. **Retroalimentación explícita:** Cada acción asíncrona debe comunicar su progreso (`loading`), confirmación (`success`), contingencia (`error`) o ausencia de datos (`empty`).
5. **Accesibilidad sin excusas:** Contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para títulos e íconos), navegación 100% operable por teclado y resistencia al zoom del 200%.

---

## 2. Sistema de Tokens

### 2.1 Paleta Cromática Institucional SENA

| Token | Hex | Nombre Semántico | Uso |
|---|---|---|---|
| `azul-sena` / `primary` | `#04324d` | Azul Institucional SENA | Cabeceras, títulos, sidebar activo, botones principales |
| `verde-sena` / `accent` | `#39a900` | Verde Institucional SENA | Indicadores de éxito, acentos de estado, pills positivas |
| `on-surface` | `#0f172a` | Texto Primario (Slate 900) | Lectura de alta legibilidad en tarjetas y tablas |
| `on-surface-variant` | `#64748b` | Texto Secundario (Slate 500)| Subtítulos, metadatos, timestamps y etiquetas |
| `background` | `#f4f7f8` | Fondo de Aplicación | Base calmada y neutral para reducir la fatiga visual |
| `surface` | `#ffffff` | Superficie de Trabajo | Tarjetas, tablas, modales y barras de navegación |
| `border-subtle` | `#f1f5f9` | Borde Sutil (Slate 100) | Separadores internos de tarjetas y filas |
| `border-normal` | `#e2e8f0` | Borde Normal (Slate 200) | Contornos de inputs y botones secundarios |

**Prohibición estricta:** No usar `#1B2A4A`, azules no institucionales ni gradientes llamativos en la interfaz web.

### 2.2 Escala de Espaciado (8-Step System)

El espaciado se calcula estrictamente en base a múltiplos de 4 y 8:
- `4px` (`gap-1`, `p-1`): Micro-espacios entre íconos y textos pequeños.
- `8px` (`gap-2`, `p-2`): Espacio interno de botones compactos y chips.
- `12px` (`gap-3`, `p-3`): Padding vertical en inputs y filas de menú.
- `16px` (`gap-4`, `p-4`): Padding estándar en tarjetas compactas y modales.
- `24px` (`gap-6`, `p-6`): Espaciado entre grupos de campos y cabeceras de tabla.
- `32px` (`gap-8`, `p-8`): Espaciado entre secciones principales en desktop.
- `48px` (`gap-12`, `p-12`): Separación de bloques jerárquicos mayores.
- `64px` (`gap-16`, `p-16`): Margen superior o inferior de páginas vacías.

### 2.3 Tipografía

- **Familia Primaria:** `Public Sans`, sans-serif (para toda la interfaz operativa, tablas y formularios).
- **Familia de Énfasis:** `Plus Jakarta Sans`, sans-serif (para títulos de sección y números de KPI).
- **Escala:**
  - `Display / KPI`: `text-3xl` (30px) a `text-4xl` (36px), font-black.
  - `H1 / Page Title`: `text-xl` (20px) a `text-2xl` (24px), font-black, tracking-tight.
  - `H2 / Section Title`: `text-base` (16px) a `text-lg` (18px), font-bold.
  - `Body / Table Text`: `text-xs` (12px) a `text-sm` (14px), font-medium o font-semibold.
  - `Overline / Tracking`: `text-[10px]` o `text-[11px]`, font-bold, uppercase, tracking-[0.16em].

### 2.4 Estados de Componentes

Todo componente interactivo debe contar con definición visual para:
- `idle`: Estado de reposo claro.
- `hover`: Sutil cambio de fondo (`bg-slate-50` o `hover:bg-azul-sena/90`).
- `focus-visible`: Anillo de foco accesible (`ring-2 ring-azul-sena/20` o `outline-none ring-2 ring-azul-sena`).
- `active`: Retracción háptica sutil (`active:scale-[0.99]`).
- `disabled`: Opacidad al 50%, cursor no permitido, sin eventos de clic.
- `loading`: Spinner inline accesible (`role="status"`), preservando la anchura del botón.

---

## 3. Catálogo de Componentes Compartidos

1. **`AppShell`**: Shell unificado multirol con sidebar colapsable, drawer móvil, cabecera fija, notificaciones y menú de perfil.
2. **`RoleNavigation`**: Menú de navegación vertical dinámico según el rol (`lider`, `funcionario`, `tecnico`).
3. **`PageHeader`**: Cabecera de contenido con overline institucional, título `h1`, descripción y contenedor de acciones.
4. **`SearchField`**: Barra de búsqueda con icono, foco controlado y botón de borrado rápido.
5. **`PaginationFooter`**: Paginación accesible que muestra "X a Y de Z registros" y botones anterior/siguiente.
6. **`StatusBadge`**: Insignia de estado que no depende únicamente del color (incluye texto descriptivo y contraste WCAG).
7. **`EmptyState`**: Pantalla vacía con iconografía institucional, título, mensaje orientativo y acción primaria sugerida.
8. **`ErrorState`**: Componente de error recuperable con mensaje claro y botón de reintento.
9. **`KpiCard`**: Tarjeta de métrica operativa con valor numérico, etiqueta y tono semántico.
10. **`PrimaryButton` & `SecondaryButton`**: Botones estandarizados con soporte de loading y focus ring.

---

## 4. Motion & Interacción
- Animaciones puramente funcionales: apertura de modales (`fade-in zoom-in 150ms`), transición de menú móvil (`translate-x 200ms`), y cambio de estado en badges.
- Respeta estrictamente `@media (prefers-reduced-motion: reduce)`.

---

## 5. Criterios de Rechazo (Quality Gate)
Se rechazará cualquier componente o pantalla que:
- Incorpore `h-screen`, `vh` o `max-h-[calc(100vh-...)]` en contenedores de datos.
- Reintroduzca barras de navegación separadas (`NavApp` o `NavTecnico` aislado).
- Use colores fuera de la paleta institucional SENA.
- Omita el botón de recarga o reintento ante un fallo de red.
- Falle en zoom al 200% o navegación por tabulador.
