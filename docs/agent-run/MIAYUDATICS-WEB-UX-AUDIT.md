# Auditoría web frente al kit CRM

**Fecha:** 2026-09-27  
**Evidencia de producto:** código de `client/` y tests de layout. El navegador de Cursor no tiene sesión de Figma ni de MiAyudaTICS, así que el login real no se recorrió en esta pasada.

| Superficie | Figma | MiAyudaTICS antes | Acción |
|---|---|---|---|
| Shell | Sidebar + encabezado + canvas | Shell blanco con saludo “Hola” igual para los tres roles y tracking en mayúsculas | Adaptar: título operativo por rol y canvas `#e9eff2` |
| Lista-detalle | Dashboard 473 + 1209 | Colas de líder y técnico ya parten la vista | Adoptar la relación, no el contenido CRM |
| Funcionario | Help Center / tickets | Formulario + historial | Conservar; el título del shell pasa a seguimiento |
| Tablas anchas | Listas con detalle | Seguimiento del líder aún usa muchas columnas | Deuda: no migrada en esta pasada |
| Auth | Sign in del kit | Login propio | Rechazar copia |
| Módulos ajenos | Facturas, kanban, chat | No existen | Rechazar |
