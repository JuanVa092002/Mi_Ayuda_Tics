# Contrato de Producto — T2: Cola de Ejecución Secuencial

- **Usuario:** Técnico de soporte en rondas continuas de mantenimiento que debe despachar caso tras caso sin interrupciones.
- **Job Principal:** Resolver requerimientos en secuencia estricta de prioridad con mínima fricción entre un caso y el siguiente.
- **Problema:** Perder tiempo decidiendo cuál caso atender después cuando la cola ya está definida.
- **Hipótesis:** Un layout secuencial centrado en "Ahora" y "Siguiente" con botón dominante de transición acelera el ritmo de intervención.
- **Composición:** Vista enfocada con selector "Caso Actual" prominente y lista compacta de "Siguiente en Fila" al pie.
- **Flujo:** Caso actual en foco → Ejecutar acción requerida → Finalizar o actualizar → Pasar automáticamente al siguiente caso.
- **Copy:** "Caso en curso ahora", "Siguiente en fila", "Listo para iniciar", "Pasar al siguiente caso".
- **CTA Principal:** `Tomar siguiente caso`.
- **Acciones Secundarias:** Iniciar caso actual, Registrar avance rápido, Ver caso anterior.
- **Estados:** Enfoque prioritario en casos pendientes de atención y asignados.
- **Métrica:** Reducción de tiempos muertos entre intervenciones de campo.
- **Tradeoff:** Menor visibilidad del conjunto global de requerimientos del turno.
