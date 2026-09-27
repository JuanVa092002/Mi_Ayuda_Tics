# Revisión UX informada por Figma

## Aplicado

- Patrón: shell con jerarquía de página (título 28 px, metadata 13 px).
- Pantallas: todas las que usan `AppShell` (líder, funcionario, técnico).
- Antes: “Hola, {nombre}” y riel idéntico.
- Después: “Despacho de solicitudes”, “Seguimiento de tu solicitud” o “Casos por resolver”, con riel azul, verde o ámbar.
- Canvas `#e9eff2` en lugar de un gris suelto.

## Operación

La cola, el inspector, la asignación y la resolución no cambian de contrato ni de endpoint. Cambia el marco que dice qué trabajo está abierto.

## Limitaciones

- No se recorrió el login en navegador: la herramienta de browser no tiene la sesión del producto.
- `SeguimientoSolicitud` sigue siendo una tabla ancha. Queda como riesgo de scroll horizontal.
- No se copiaron frames de facturas, kanban ni mensajería.

## Riesgos

El título del shell ya no saluda por nombre en el `h1`. El nombre queda en la línea de metadata. Quien busque “Hola” en la interfaz no lo verá en el encabezado.
