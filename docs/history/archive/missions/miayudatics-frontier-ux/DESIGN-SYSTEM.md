# Design System & Visual Contract

## 1. Tokens y Variables Semánticas
El diseño se rige por un sistema de variables CSS semánticas integradas en `client/src/index.css`:

```css
:root {
  --verde-sena: #39A900;
  --azul-sena: #00324D;
  --surface-0: #FFFFFF;
  --surface-subtle: #F8FAFC;
  --surface-selected: #F0FDF4;
  --border-c: #E2E8F0;
  --border-subtle: #F1F5F9;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --sh-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --sh-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --sh-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
```

## 2. Primitivas de UI Compartidas
1. **`AppShell`:** Contenedor de aplicación unificado, con navegación accesible, control de sesión y branding institucional SENA CTPI.
2. **`WorkCanvas`:** Contenedor de ancho limitado con espaciado responsive para todas las superficies operativas.
3. **`FeedbackBanner`:** Notificación operativa en bloque (distinta de un toast volátil), que explica:
   - Título y variante visual (éxito, información, alerta).
   - Qué ocurrió y qué caso fue afectado.
   - Quién quedó involucrado.
   - Cuál es el paso siguiente recomendado.
4. **`SemanticIcon`:** Sistema centralizado de iconos SVG vectoriales sin dependencias de fuentes externas, con atributo `aria-hidden="true"` para lectores de pantalla.
5. **`StatusBadge`:** Etiquetas de estado uniformes con codificación de color accesible (texto de alto contraste y borde sutil).
6. **`SlideOverDrawer`:** Panel lateral de inspección contextual que previene la pérdida de contexto del usuario, accesible vía teclado con `Escape` y trampa de foco.
7. **`AdaptiveSkeletonList`:** Indicador de carga estructural de contenido que coincide en tamaño y forma con las tarjetas de datos reales.
