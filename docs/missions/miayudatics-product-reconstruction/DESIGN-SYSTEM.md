# Sistema de Diseño y Tokens Semánticos (DESIGN-SYSTEM.md)

## 1. Fundamentos Visuales
- **Canvas Principal:** `--bg: #f0f4f6` (Fondo calmado, sobrio y silencioso).
- **Superficies:**
  - `--surface-0: #ffffff` (Tarjetas, modales, drawers e inspectores).
  - `--surface-1: #f7f9fa` (Fondos sutiles, cabeceras de tabla, áreas de agrupación).
  - `--surface-sel: #e8f3ed` (Selección de cola con acento verde SENA).
- **Bordes:**
  - `--border-c: #dde5e9` (Borde sutil contenido).
  - `--border-strong-c: #c4d2d9` (Borde para elementos destacados).
- **Tipografía:**
  - Inter con ritmo vertical controlado.
  - JetBrains Mono para códigos de caso (`#CASO-1234`).
- **Paleta de Identidad SENA:**
  - Azul Institucional: `#04324d` (Comandos primarios, títulos institucionales).
  - Verde SENA: `#2f9600` (Acentos de éxito, avance y disponibilidad técnica).

## 2. Componentes Canónicos Compartidos
1. `AppShell`: Contenedor maestro con barra superior unificada, logo institucional, perfil de usuario, notificaciones y navegación por rol adaptada.
2. `WorkCanvas`: Espacio de trabajo con contención de ancho y márgenes responsivos consistentes.
3. `SplitWorkspace`: Layout de dos columnas para flujos operacionales (Cola a la izquierda, Inspector de detalle a la derecha).
4. `StatusBadge`: Indicador semántico de estado con paleta controlada (Success, Warning, Info, Danger).
5. `Button`: Botones con affordance táctil claro, variantes (`primary`, `secondary`, `success`, `destructive`) y estados disabled/loading.
6. `SlideOverDrawer`: Panel lateral para tareas de creación o justificación sin perder el contexto de la pantalla principal.
