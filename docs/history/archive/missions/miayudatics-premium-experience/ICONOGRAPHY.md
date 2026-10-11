# Mapa Semántico de Iconografía (ICONOGRAPHY.md)

## 1. Biblioteca Canónica
Se seleccionó exclusivamente la biblioteca nativa cargada en `index.html`: **Google Material Symbols Outlined**, encapsulada en el componente reactivo accesible `SemanticIcon` (`client/src/shared/ui/SemanticIcon.tsx`).

## 2. Mapa Semántico Canónico

| Concepto de Negocio | Nombre Semántico | Símbolo Material | Uso en la Aplicación |
|---|---|---|---|
| **Ticket / Incidencia** | `ticket` | `description` | Identificador de requerimiento, etiquetas monoespaciadas |
| **Radicación** | `create` | `add_circle` | Botón principal de radicar caso |
| **Estado General** | `status` | `radio_button_checked` | Badges de seguimiento y metadatos |
| **Radicado** | `radicado` | `mark_email_unread` | Primer paso del Stepper (Recepción en Mesa) |
| **Asignado** | `asignado` | `person_pin_circle` | Segundo paso del Stepper (Técnico designado) |
| **En Atención** | `atencion` | `build` | Tercer paso del Stepper (Intervención en sitio) |
| **Solucionado** | `solucionado` | `check_circle` | Cuarto paso del Stepper (Caso validado y cerrado) |
| **En Espera** | `esperando` | `pending` | Espera de disponibilidad de usuario |
| **Ambiente de Aprendizaje** | `ambiente` | `apartment` | Aula, laboratorio, taller, sede |
| **Teléfono de Contacto** | `telefono` | `phone_in_talk` | Llamada directa y extensión del solicitante/técnico |
| **Evidencia Adjunta** | `evidencia` | `image` | Fotos de falla técnica y previsualización |
| **Bitácora** | `bitacora` | `edit_note` | Registro de actividad técnica en campo |
| **Búsqueda** | `buscar` | `search` | Filtros de cola y bandejas de tickets |
| **Técnico Especialista** | `tecnico` | `support_agent` | Selector de técnicos y fichas de despacho |
| **Despacho** | `despachar` | `assignment_turned_in` | Asignación en 1 toque en el Dispatch Board |
| **Cancelación** | `cancelar` | `cancel` | Cancelación justificada de incidencias |
| **Información** | `info` | `info` | Bloques explicativos ("Qué está pasando") |
| **Próximo Paso** | `siguiente` | `arrow_forward` | Bloques accionables ("Próximo paso") |
| **Éxito / Solución** | `exito` | `task_alt` | Estados de confirmación y banderas de éxito |
| **Consola Operativa** | `console` | `terminal` | Encabezado de la consola técnica |
| **Mando de Despacho** | `command` | `dashboard_customize` | Encabezado del centro de comando del Líder TIC |
