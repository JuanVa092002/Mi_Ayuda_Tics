# Análisis Figma — CRM UI Kit for SaaS Dashboards (Copy)

**Archivo:** `O5IIsGwO8Su5Qj3xhE5hU7`  
**URL:** https://www.figma.com/design/O5IIsGwO8Su5Qj3xhE5hU7/CRM-UI-Kit-for-SaaS-Dashboards--Community---Copy-  
**Método:** MCP `use_figma` de solo lectura (21 páginas) y `get_metadata` del lienzo UI Kit.  
**Fecha:** 2026-09-27

## Sistema visual observado

El duplicado no publica estilos locales (`getLocalTextStyles` / `getLocalPaintStyles` = 0). El sistema vive en frames, no en variables.

| Capa | Evidencia |
|---|---|
| Lienzo de pantallas | Desktop 1680×1020. Móvil 375×812. Login 1440×900. |
| Fundaciones | Página `↳ UI Kit`: Forms, Buttons, ColorPalette, Typography, Icons. Ancho de lámina 1440. |
| Tipografía nombrada | `Regular text / 14px`, `Secondary text / 14p`. Cuerpo de datos a 14 px. |
| Controles | Checkbox, radio y switch con resting, active, error, success, disabled. Sliders con pin. |
| Densidad | Shell de `Dashboard / 02`: panel 473×1021 junto a área 1209×1021. Lista + detalle, no tabla a ancho completo. |
| Breakpoints | Par desktop 1680 y móvil 375 en Projects, Tasks, Contacts, Help Center, Files, Invoices. |
| Iconografía | Lámina `Ui / Icons`. No se reutilizan los glifos del kit. |

Colores exactos del kit no se copian. MiAyudaTICS usa los tokens institucionales de la misión.

## Patrones y traducción

| Patrón Figma | Uso | Rol | Datos reales | Cambio | No copiar | Riesgo |
|---|---|---|---|---|---|---|
| Sidebar + canvas 1680 | Shell común | Los tres | Rutas por rol | Riel de color distinto por rol | Marca del kit | Misma pantalla tres veces |
| Dashboard split 473/1209 | Cola + inspector | Líder, Técnico | Solicitud, ambiente, estado | Conservar master-detail | KPIs de ventas | Scroll horizontal |
| Projects / List vs Grid | Lista densa, no mosaico de cards | Líder | Cola de despacho | Lista | Grid de proyectos | Cards genéricas |
| Tasks / Description | Detalle con acción | Técnico | Bitácora, evidencia, resolución | Inspector | Kanban comercial | Estados que la API no tiene |
| Contacts / Empty | Vacío con siguiente paso | Los tres | Cola vacía | Empty con verbo | Ilustración del kit | Empty decorativo |
| Help Center / Tickets | Seguimiento | Funcionario | Etapa, técnico, historial | Timeline de solicitud | Tickets de producto ajeno | Campos nuevos |
| Login Sign In | Acceso | Todos | Formulario actual | No rediseñar auth en esta pasada | Pantallas Recover/Sign Up | Tocar autenticación |
| Invoices, Products, Messenger, Calendar, Kanban | — | — | No existen | Rechazar | Todo el módulo | Inventar dominio |
| Mobile 375 | Drawer | Los tres | Misma cola | Menú ya es drawer | Layout 375 literal | Overflow |

## Adoptado / rechazado

Adoptado: shell, lista-detalle ~28/72, empty, estados de control, cuerpo 14 px, desktop ancho y móvil estrecho.  
Rechazado: facturas, productos, mensajería, calendario, kanban de ventas, paleta y logo del kit, mayúsculas de marketing.
