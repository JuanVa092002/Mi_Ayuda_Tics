# Adaptabilidad Responsive y Jerarquía de Densidad (RESPONSIVE.md)

## 1. Breakpoints Soportados
- **Mobile (`390×844`)**: Diseño a 1 columna vertical. Orden: Contexto → Caso Activo / Decisión → Acción Primaria → Evidencia / Bandeja.
- **Tablet (`768×1024` / `1024×768`)**: Grillas colapsables de 2 columnas; modales centrados con margen seguro.
- **Desktop (`1280×800` / `1440×900`)**: Distribución multi-columna optimizada:
  - Técnico: 4 columnas (cola) + 8 columnas (espacio de trabajo activo).
  - Líder TIC: 5 columnas (cola de tickets) + 7 columnas (objeto seleccionado + grid de técnicos).
  - Funcionario: Lienzo editorial protagonista con stepper de 4 etapas horizontales.

## 2. Prevención de Desbordamiento Horizontal
- Uso de `truncate`, `line-clamp-1` y `line-clamp-2` con `min-w-0` en contenedores flex.
- Controles de búsqueda con ancho flexible y `shrink-0`.
