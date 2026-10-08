# Contrato de Producto — L3: Centro de Excepciones

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
