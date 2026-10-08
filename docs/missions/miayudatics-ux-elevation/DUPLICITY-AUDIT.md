# Auditoría de Duplicidad UX/UI — Rutas Post-Login

Fecha de auditoría: 2026-09-27  
Objetivo: Identificar y registrar cada elemento duplicado visual o funcionalmente en las tres superficies críticas.

## Matriz de Duplicidad

| Rol | Elemento | Ubicación A | Ubicación B | Problema | Decisión Canónica |
|---|---|---|---|---|---|
| **Funcionario** | Stepper de Progreso | Hero activo (`Funcionario.tsx` L297-343) | Inspector de Solicitud (`HistorialFuncionario.tsx` L198-225) | Duplica el progreso del caso y confunde la etapa activa con el historial | Mantener Hero como único Stepper visual protagonista. En Inspector, mostrar metadata compacta `Etapa actual · Radicado`. |
| **Funcionario** | Título/Descripción de Caso | Hero activo | Tarjeta seleccionada del Inspector | El funcionario ve dos veces el texto completo de su incidencia abierta | Hero muestra la incidencia destacada activa. Inspector muestra la trazabilidad técnica, detalle y evidencia. |
| **Técnico** | CTA de Resolución / Finalización | Focus Case (`CasosPorResolverTabla.tsx` L350-410) | Inspector Lateral (`CasosPorResolverTabla.tsx` L639-715) | Dos botones idénticos compiten en la pantalla (Focus Case arriba y en el Inspector de la derecha) | Mantener CTA principal de acción en el Focus Case. En Inspector lateral mantenerlo informativo (comprensión, evidencia, bitácora contextual sin duplicar el CTA principal). |
| **Técnico** | Modal Legacy vs Drawer | Modal legacy `ResolutionModal` | Drawer / Acciones V2 (`workflowKind`) | Existen dos flujos de resolución superpuestos | Consolidar la resolución desde el CTA del Focus Case usando el patrón unificado. |
| **Líder TIC** | Lista y Asignación de Técnicos | Cuadrícula Superior de Técnicos (`AdminSolicitud.tsx` L231-262) | Lista dentro del Inspector (`AdminSolicitud.tsx` L432-475) | Los técnicos aparecen dos veces con botones de asignar repetidos, saturando la pantalla | Mantener Cuadrícula Superior como el único mecanismo de selección y despacho en un clic. En el Inspector mostrar el técnico asignado y detalle de la solicitud. |
| **Líder TIC** | Acciones de Asignación | Clic en tarjeta de técnico superior | Botón "Asignar" en fila técnica del Inspector | Doble affordance para la misma acción exacta | Eliminar la lista duplicada del Inspector. El despacho se hace exclusivamente desde la cuadrícula de técnicos activos. |
