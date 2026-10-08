# Contrato de Producto — L1: Mesa de Despacho

- **Usuario:** Líder TIC o coordinador de soporte encargado de la asignación ágil de técnicos a requerimientos pendientes.
- **Job Principal:** Revisar el resumen del caso (aula, solicitante, falla) y despachar al especialista más adecuado en 1 clic.
- **Problema:** Los formularios lentos o con demasiados pasos retrasan el despacho de incidencias urgentes en aulas de clase.
- **Hipótesis:** Un request brief prominente enfrentado directamente al catálogo de especialistas disponibles reduce el tiempo de despacho a segundos.
- **Composición:** Split operativo con lista de requerimientos por despachar a la izquierda y ficha de caso con especialista-picker en 1 clic a la derecha.
- **Flujo:** Seleccionar solicitud → Revisar resumen técnico y ambiente → Elegir especialista del listado → Confirmar despacho inmediato → Continuar con el siguiente.
- **Copy:** "Listas para despacho", "Esta solicitud necesita un responsable", "Selecciona especialista disponible".
- **CTA Principal:** `Despachar solicitud`.
- **Acciones Secundarias:** Cancelar solicitud justificada, Ampliar evidencia de foto, Paginación de solicitudes.
- **Estados:** Solicitudes en cola sin asignar y especialistas en guardia.
- **Métrica:** Tiempo promedio de despacho por ticket < 8 segundos.
- **Tradeoff:** Menor visión global del estado de la infraestructura completa.
