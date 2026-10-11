# Contrato de Producto — L2: Cola de Decisiones

- **Usuario:** Líder TIC enfocado en despachar una lista ordenada de solicitudes pendientes una tras otra sin distracciones visuales.
- **Job Principal:** Tomar decisiones secuenciales rápidas (asignar a especialista o cancelar con causa) sin cambiar de contexto.
- **Problema:** En tableros complejos con muchas columnas, la atención del líder se dispersa y se postergan casos difíciles.
- **Hipótesis:** Presentar una cola estricta de decisiones donde cada ticket se procesa como una decisión aislada ("Decisión actual") garantiza orden y cero casos olvidados.
- **Composición:** Vista secuencial limpia con una tarjeta de decisión en foco, contador de avance "Decisión X de Y" y selector desplegable de técnico inmediato.
- **Flujo:** Evaluar decisión en pantalla → Asignar especialista o Cancelar solicitud → Pasar automáticamente a la siguiente decisión pendiente.
- **Copy:** "Decisiones pendientes de despacho", "Requiere asignación inmediata", "Revisar siguiente decisión".
- **CTA Principal:** `Resolver decisión`.
- **Acciones Secundarias:** Cancelar con motivo, Navegar a decisión anterior/siguiente.
- **Estados:** Pendientes de despacho procesadas en secuencia ordenada.
- **Métrica:** Tasa de resolución de cola sin interrupciones del flujo.
- **Tradeoff:** Menor flexibilidad para saltar entre tickets de forma arbitraria.
