# Dirección visual MiAyudaTICS (adaptada del kit, no copiada)

## Dirección

Sala de control del CTPI. Canvas `#e9eff2`, trabajo en superficie blanca, tinta `#102c3b`. Verde `#39a900` solo en resolución y selección. El kit aporta proporción lista/detalle (473/1209) y cuerpo a 14 px. La identidad sigue siendo SENA.

## Tokens

Definidos en `client/src/index.css` y `client/tailwind.config.js`: canvas, surface, surface-subtle `#f5f8f9`, surface-selected, border-subtle, border-strong `#b8cbd3`, ink, ink-muted, brand-deep, brand-green, warning, danger.

## Tipografía

Familia existente: Public Sans, con Plus Jakarta Sans de respaldo. Título de espacio 28 px / 700. Metadata 13 px / 500, sin tracking amplio ni mayúsculas en frases. Botones 14 px / 600, altura mínima 40 px.

## Roles

| Rol | Título de espacio | Riel |
|---|---|---|
| Líder TIC | Despacho de solicitudes | Azul profundo |
| Funcionario | Seguimiento de tu solicitud | Verde |
| Técnico | Casos por resolver | Ámbar de prioridad |

El cuerpo sigue en lista + inspector. No se añaden dashboards de métricas.

## Motion y accesibilidad

`prefers-reduced-motion` anula transiciones. Focus visible en botones. Escape cierra menús del shell. Contraste de tinta sobre canvas y superficie se mantiene en la paleta pedida.
