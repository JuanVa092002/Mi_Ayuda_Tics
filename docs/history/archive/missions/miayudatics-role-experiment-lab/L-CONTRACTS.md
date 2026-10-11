# Contratos de Producto — Variantes de Líder TIC (L1 a L5)

## L1 — Mesa de Despacho
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

---

## L2 — Cola de Decisiones
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

---

## L3 — Centro de Excepciones
- **Usuario:** Coordinador técnico que necesita intervenir únicamente en los casos que presentan problemas, retrasos o excepciones.
- **Job Principal:** Identificar de inmediato anomalías operacionales (tickets sin técnico, casos esperando al usuario, cancelaciones pendientes) y aplicar acciones correctivas.
- **Problema:** En bandejas con decenas de casos normales, los casos problemáticos pasan desapercibidos y se estancan.
- **Hipótesis:** Un tablero filtrado por tipo de excepción operacional permite al líder concentrarse en destrabar el servicio.
- **Composición:** Command strip de indicadores de excepción superior y tarjetas clasificadas por tipo de atención requerida con botones de acción correctiva.
- **Flujo:** Identificar alerta de excepción → Analizar causa de bloqueo → Ejecutar acción correctiva (asignar especialista, revisar motivo) → Registrar resolución.
- **Copy:** "Requiere atención prioritaria", "Solicitudes sin responsable asignado", "Casos detenidos en espera de datos", "Resolver excepción".
- **CTA Principal:** `Tomar decisión correctiva`.
- **Acciones Secundarias:** Filtrar por tipo de excepción, Despachar de urgencia, Cancelar caso inválido.
- **Estados:** Excepciones reales soportadas por backend (sin asignar, esperando usuario, solicitudes antiguas).
- **Métrica:** Tiempo de detección y desbloqueo de tickets estancados.
- **Tradeoff:** No muestra directamente los casos que fluyen con normalidad.

---

## L4 — Control de Continuidad
- **Usuario:** Líder de soporte comprometido con mantener el flujo continuo de las solicitudes y asegurar que ninguna quede paralizada.
- **Job Principal:** Supervisar el dinamismo de la mesa de ayuda, mover solicitudes estancadas y monitorear la distribución equitativa de la carga entre especialistas.
- **Problema:** Los requerimientos se acumulan en cuellos de botella porque no se monitorea activamente el movimiento de los tickets.
- **Hipótesis:** Una vista centrada en el estado de movimiento operacional y en el flujo continuo impulsa la acción proactiva del coordinador.
- **Composición:** Panel de control de flujo con bloques de capacidad por técnico, tarjetas de solicitudes que esperan movimiento y acciones de reasignación ágil.
- **Flujo:** Revisar estado de la operación de soporte → Detectar solicitudes que esperan movimiento → Asignar o reasignar → Confirmar continuidad del servicio.
- **Copy:** "Operación de soporte activo", "Solicitudes sin responsable", "Casos que esperan movimiento", "Mover solicitud".
- **CTA Principal:** `Mover solicitud`.
- **Acciones Secundarias:** Asignar a especialista con menor carga, Visualizar histórico de despacho.
- **Estados:** Flujo activo de requerimientos en tránsito.
- **Métrica:** Reducción del tiempo de permanencia de solicitudes en estado solicitado.
- **Tradeoff:** Enfoque prioritario en volumen y flujo por encima del detalle cualitativo individual.

---

## L5 — Triage Operativo
- **Usuario:** Coordinador o especialista en mesa de entrada que debe clasificar rigurosamente cada requerimiento antes de autorizar su despacho a campo.
- **Job Principal:** Leer en profundidad la descripción del funcionario, verificar el ambiente y los antecedentes, y asignar al técnico con el perfil exacto.
- **Problema:** Despachar sin análisis previo resulta en visitas técnicas infructuosas por falta de repuestos o herramientas adecuadas.
- **Hipótesis:** Un flujo de triage con revisión documental previa y confirmación explícita eleva la tasa de resolución en la primera visita.
- **Composición:** Vista tipo expediente de triage con panel amplio de lectura, resumen estructurado de afectación y confirmación en dos pasos antes del despacho.
- **Flujo:** Leer detenidamente solicitud → Verificar afectación de ambiente y tipo de falla → Seleccionar especialista idóneo → Confirmar y despachar a campo.
- **Copy:** "Revisar solicitud para triage", "Confirmar análisis técnico", "Lista para despacho a campo", "Clasificar y despachar".
- **CTA Principal:** `Clasificar y despachar`.
- **Acciones Secundarias:** Solicitar ampliación de información, Cancelar reporte inconsistente, Previsualizar evidencia.
- **Estados:** Evaluación previa, Clasificación lista, Despachada.
- **Métrica:** Máxima efectividad en la asignación del especialista idóneo por tipo de incidencia.
- **Tradeoff:** Mayor tiempo invertido por caso antes del despacho.
