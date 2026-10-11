# Product Brief & Diagnosis — REBUILD 01

## 1. Declaración de Diagnóstico Real
La arquitectura previa compartía una maqueta estática demasiado homogénea entre los roles: un encabezado de métricas, una lista estrecha a la izquierda y un inspector lateral genérico. Aunque técnicamente funcional, no representaba el modelo mental ni el trabajo operativo de cada usuario:
- El **Técnico** necesita una consola de intervención física: un resumen de su turno, saber a dónde ir (ambiente/sede), tener contacto directo con el docente, iniciar formalmente el servicio en 1 clic y contar con drawers estructurados para notas y solución.
- El **Líder TIC** requiere un centro de mando para resolver cuellos de botella: ver solicitudes pendientes, inspeccionar el síntoma reportado con su evidencia fotográfica y asignar al técnico adecuado con un selector de especialistas ágil de un solo clic, o cancelar casos espurios con motivo justificado.
- El **Funcionario** no debe ser tratado como un auditor de base de datos; requiere certeza: un saludo empático, saber qué ocurre con su solicitud activa, un stepper humano ("Radicado" → "Especialista Designado" → "En Atención en Sitio" → "Incidencia Solucionada"), el teléfono del técnico responsable y la capacidad de radicar sin perder su vista.

## 2. Inventario de Datos

| Dato | Estado | Fuente / Contrato | Justificación |
|---|---|---|---|
| `codigoCaso`, `descripcion`, `estado`, `fecha` | **SUPPORTED** | `server/src/models/Solicitud.ts` | Propiedades estándar de solicitud. |
| `ambiente.nombre` | **SUPPORTED** | `server/src/models/Ambiente.ts` | Ubicación física en la sede SENA CTPI. |
| `usuario.nombre`, `telefono` | **SUPPORTED** | `server/src/models/User.ts` | Datos de contacto del funcionario reportante. |
| `tecnico.nombre`, `telefono` | **SUPPORTED** | `server/src/models/User.ts` | Especialista asignado a la incidencia. |
| `foto.url` / `foto.path` | **SUPPORTED** | Almacenamiento local o blob autenticado | Evidencia gráfica adjunta. |
| `solucion.tipo`, `solucion.descripcionSolucion` | **SUPPORTED** | Contrato de cierre técnico | Registro formal de conclusión del servicio. |
| `SLA dinámico / tiempo límite` | **NOT_SUPPORTED** | Inexistente en backend | No implementado en client para evitar promesas falsas. |
| `Telemetría GPS en tiempo real` | **NOT_SUPPORTED** | Inexistente en backend | No implementado en client. |
