# Decisiones de Diseño (DESIGN-DECISIONS.md)

## Decisión 1: Unificación de Stepper en Funcionario
- **Contexto:** `Funcionario.tsx` ya posee un Hero con la línea de vida y etapas (Radicado, Asignado, En Atención, Resuelto). Dentro de `HistorialFuncionario.tsx`, el panel de detalle (`Inspector`) renderizaba un segundo componente Stepper idéntico de 4 pasos, produciendo duplicidad y competencia visual.
- **Resolución:** Remover el Stepper de 4 pasos de `HistorialFuncionario.tsx`. En su lugar, mostrar una barra de metadata contextual compacta que indica el estado semántico y la fecha de radicación con `StatusBadge`, reduciendo la carga cognitiva y preservando el Hero como el único stepper dominante.

## Decisión 2: Consolidación de CTA de Acción en Técnico
- **Contexto:** En `CasosPorResolverTabla.tsx`, el Focus Case superior presentaba botones de acción ("Iniciar atención", "Finalizar caso", "Resolver caso"), y simultáneamente en el Inspector lateral derecho se renderizaban botones idénticos duplicando las acciones.
- **Resolución:** Mantener el Focus Case como el único punto de decisión y ejecución primaria (CTA dominante). En el Inspector lateral derecho, mantener el propósito puramente informativo (contacto, ambiente, descripción, visualizador de fotos) y un botón de "Bitácora / Actualización" contextual si el caso está activo, suprimiendo la duplicidad de botones primarios de resolución.

## Decisión 3: Despacho Unificado en Líder TIC
- **Contexto:** En `AdminSolicitud.tsx`, el usuario disponía de la cuadrícula superior de técnicos para despacho en 1 toque, pero en el Inspector lateral derecho volvía a aparecer una lista vertical completa de todos los técnicos con botones individuales "Asignar".
- **Resolución:** Eliminar la lista repetida de técnicos del Inspector lateral. Reemplazarla por una tarjeta informativa de despacho rápido indicando el técnico sugerido/seleccionado o instrucciones de despacho desde la cuadrícula superior, manteniendo el botón secundario "Cancelar caso" en su ubicación contextual.

## Decisión 4: Refinamiento de Superficies y Espaciado
- **Contexto:** Uso de bordes y sombras con clases arbitrarias junto a variables de diseño (`--border-c`, `--surface-0`, `--surface-1`).
- **Resolución:** Homogeneizar los contenedores usando el canvas canónico de `WorkCanvas`, `Pane`, `SplitWorkspace` y tokens semánticos del sistema de diseño.
