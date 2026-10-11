# Contratos de Producto — Variantes de Funcionario (F1 a F5)

## F1 — Journey de Confianza
- **Usuario:** Funcionario administrativo o docente que radicó un requerimiento técnico y experimenta incertidumbre.
- **Job Principal:** Entender en qué va su caso, quién lo atenderá y tener la certeza de que no fue olvidado.
- **Problema:** Los sistemas de tickets tradicionales solo muestran un código numérico y una tabla estéril.
- **Hipótesis:** Explicar el caso como una historia paso a paso ("Qué está pasando", "Qué sigue", "Lo que necesitas hacer") reduce la ansiedad y las llamadas innecesarias a la mesa de ayuda.
- **Composición:** Recorrido vertical narrativo con stepper visual de 4 fases y tarjetas explicativas en lenguaje natural.
- **Flujo:** Estado actual → Qué pasó → Qué sigue → Actividad reciente → Detalle progresivo.
- **Copy:** "Tu solicitud fue recibida", "Estamos buscando el especialista adecuado", "No necesitas hacer nada por ahora".
- **CTA Principal:** `Ver qué sigue`.
- **Acciones Secundarias:** Radicar incidencia, Consultar historial, Ver detalles del caso.
- **Estados:** Solicitado, Asignado, En Atención, Esperando Respuesta, Resuelto.
- **Métrica:** Reducción del tiempo de comprensión del estado a < 5 segundos.
- **Tradeoff:** Menor densidad de información simultánea de otros tickets.

---

## F2 — Centro de Claridad
- **Usuario:** Funcionario ocupado que necesita respuestas inmediatas sin leer narrativas ni timelines.
- **Job Principal:** Obtener de un vistazo las respuestas a las 4 preguntas esenciales: Estado, Responsable, Acción Requerida y Último Evento.
- **Problema:** En situaciones de prisa, un flujo narrativo exige demasiado scroll y lectura.
- **Hipótesis:** Agrupar la información en 4 bloques de decisión directos y escaneables permite tomar decisiones en 2 segundos.
- **Composición:** Grid simétrico de 4 paneles de alta visibilidad con etiquetas en formato pregunta-respuesta.
- **Flujo:** ¿En qué estado está? → ¿Quién está a cargo? → ¿Qué debo hacer? → ¿Qué ocurrió recientemente?
- **Copy:** "Estado de tu solicitud", "Responsable actual", "Acción requerida", "Última actualización".
- **CTA Principal:** `Revisar actualización`.
- **Acciones Secundarias:** Cambiar solicitud activa, Contactar soporte.
- **Estados:** Mapeo directo de estados con código visual de color semántico (ámbar, azul, verde).
- **Métrica:** 100% de identificación del responsable y estado en la primera fijación ocular.
- **Tradeoff:** Menor contexto pedagógico de la intervención.

---

## F3 — Seguimiento Conversacional
- **Usuario:** Funcionario habituado a canales de mensajería (WhatsApp, Teams) que prefiere interacción humana guiada.
- **Job Principal:** Seguir el progreso del soporte mediante un feed de mensajes interactivos que plantean preguntas y opciones.
- **Problema:** Los formularios y tablas se perciben burocráticos y despersonalizados.
- **Hipótesis:** Presentar los hitos del ticket como burbujas de diálogo del sistema y del técnico incrementa el sentido de acompañamiento.
- **Composición:** Stream vertical de diálogo tipo mensajería con burbujas de estado, preguntas y respuestas sugeridas.
- **Flujo:** Mensaje del sistema → Notificación o pregunta técnica → Respuesta del funcionario → Confirmación.
- **Copy:** "Recibimos tu reporte en el CTPI", "¿El equipo vuelve a encender?", "No necesitas responder todavía".
- **CTA Principal:** `Responder actualización` (o "No requiere respuesta").
- **Acciones Secundarias:** Escribir mensaje rápido en bitácora, Ver adjunto de foto.
- **Estados:** Diálogo dinámico condicionado por el estado real del backend.
- **Métrica:** Mayor tasa de respuesta oportuna ante requerimientos de información del técnico.
- **Tradeoff:** Presentación visual sujeta a los contratos de backend existentes (mensajes registrados).

---

## F4 — Bandeja Personal
- **Usuario:** Funcionario o coordinador que gestiona múltiples requerimientos en diferentes ambientes simultáneamente.
- **Job Principal:** Monitorear, priorizar y consultar el historial completo de sus solicitudes desde un único panel compacto.
- **Problema:** Las interfaces centradas en un solo caso dificultan ver el panorama de varios reportes abiertos.
- **Hipótesis:** Una bandeja de entrada con filtros rápidos (`En seguimiento`, `Esperando respuesta`, `Solucionadas`) optimiza la gestión multipetición.
- **Composición:** Bandeja tipo inbox con barra superior de filtros segmentados y panel de lectura adyacente.
- **Flujo:** Filtros → Lista compacta de solicitudes → Selección → Detalle contextual → Acción.
- **Copy:** "Tus solicitudes personales", "En seguimiento", "Esperando tu respuesta", "Solucionadas".
- **CTA Principal:** `Abrir solicitud`.
- **Acciones Secundarias:** Radicar nueva incidencia, Buscar por término o aula.
- **Estados:** Conteo dinámico y filtrado por estado operacional.
- **Métrica:** Menor número de clics para cambiar entre solicitudes activas.
- **Tradeoff:** Menor énfasis emocional en la narrativa individual del caso.

---

## F5 — Recovery & Reassurance
- **Usuario:** Funcionario que reportó una falla crítica y teme que su caso se haya perdido o cancelado indebidamente.
- **Job Principal:** Confirmar la persistencia de su requerimiento, entender por qué hay demoras y contar con opciones claras de reintento.
- **Problema:** En situaciones de alta carga o demoras técnicas, la falta de feedback explícito genera desconfianza.
- **Hipótesis:** Destacar estados de resiliencia, banners de tranquilidad ("Tu solicitud sigue registrada") y botones de reintento/contacto directo restaura la confianza.
- **Composición:** Panel de alta certidumbre con tarjetas de garantía de atención, estado de conexión y mecanismos de reintento visibles.
- **Flujo:** Estado verificado → Explicación de contingencia → Garantía de persistencia → Siguiente acción recomendada.
- **Copy:** "Tu solicitud sigue registrada de forma segura", "El equipo técnico ya tiene asignado tu reporte", "Reintentar verificación".
- **CTA Principal:** `Reintentar o Actuar`.
- **Acciones Secundarias:** Solicitar estado de prioridad, Contacto telefónico con mesa de ayuda.
- **Estados:** Enfoque especial en estados de espera, retrasos y reintentos.
- **Métrica:** Disminución a cero de reportes duplicados por desconfianza en el sistema.
- **Tradeoff:** Diseño percibido como más cauteloso o defensivo.
