# State Model Canonical — MiAyudaTICS

Este documento formaliza el mapeo entre los estados persistidos en base de datos (`estado` en MongoDB) y su correspondiente modelo mental, representación visual, actor responsable y próximo paso en la interfaz de usuario.

| Estado Backend | Etiqueta Humana | Significado Operativo | Actor Responsable | Próximo Paso en el Sistema | CTA Principal / Interacción |
|---|---|---|---|---|---|
| `solicitado` / `nuevo` / `pendiente` | **Radicado / Por Asignar** | La solicitud fue ingresada y espera asignación de especialista técnico. | Líder TIC | El Líder TIC evalúa el requerimiento y lo asigna a un especialista. | *Líder:* "Asignar a [Técnico]". *Funcionario:* Espera pasiva. |
| `asignado` | **Especialista Designado** | El caso tiene un técnico responsable y está en cola de su turno. | Técnico de Campo | El técnico revisa la ubicación y se traslada al ambiente para iniciar atención. | *Técnico:* "Iniciar atención". *Funcionario:* Muestra nombre del técnico. |
| `en_progreso` / `en_atencion` | **En Atención en Sitio** | El técnico está interviniendo activamente los equipos en el aula/ambiente. | Técnico de Campo | El técnico realiza diagnóstico, registra bitácora o formaliza la solución. | *Técnico:* "Registrar Solución" / "Agregar Avance". |
| `esperando_usuario` | **Esperando Datos del Solicitante** | El técnico solicitó información adicional o pruebas al funcionario. | Funcionario | El funcionario debe proveer los datos solicitados para continuar la atención. | *Funcionario:* Revisar consulta y brindar respuesta. |
| `resuelto` / `finalizado` / `cerrado` | **Incidencia Solucionada** | La intervención concluyó favorablemente y la solución quedó documentada. | Sistema / Mesa TIC | Caso resuelto. Disponible en historial para consulta de trazabilidad. | *Funcionario:* Consultar solución en drawer. |
| `cancelado` | **Cancelado** | El ticket fue cancelado por el Líder con motivo justificado. | Líder TIC | Registro histórico archivado. | Solo lectura. Muestra motivo de cancelación. |

### Estados Operacionales Especiales de Interfaz
- **Loading:** Renderiza `AdaptiveSkeletonList` con micro-animación pulsante para evitar layout shift.
- **Empty State:** Ilustración y mensaje tranquilizador contextual (e.g. "Mesa de despacho al día", "No tienes solicitudes en curso").
- **Error State:** Alerta en línea con clasificación de fallo y acción de reintento (`Retry`) manual idempotente.
- **Post-Action State:** Renderizado del componente `FeedbackBanner` con explicación de lo ocurrido, el caso afectado y la acción sugerida.
