# Modelo de Estados (STATE-MODEL.md)

Este documento define el vocabulario de estados semánticos y humanos utilizado en toda la plataforma.

## 1. Mapeo de Estados para Funcionario (Lenguaje Humano de Acompañamiento)

| Estado Backend | Título Humano | Explicación para el Usuario | Próximo Paso Accionable |
|---|---|---|---|
| `solicitado` / `nuevo` / `pendiente` | **Radicado y en Cola** | Tu solicitud fue recibida exitosamente por la Mesa de Ayuda TIC. | El Líder TIC está asignando un especialista técnico para tu ambiente. |
| `asignado` | **Especialista Designado** | Un técnico especialista ya tiene asignada tu solicitud y la agendó para atención. | El técnico acudirá a tu ambiente o se contactará contigo. |
| `en_progreso` / `en_atencion` | **En Atención Activa** | El técnico se encuentra realizando labores de diagnóstico y reparación en tu ambiente. | Mantén disponibilidad para verificar el funcionamiento una vez finalice. |
| `esperando_usuario` | **Esperando tu Respuesta** | El equipo técnico requiere información adicional o acceso al aula/equipo. | Revisa las notas de tu caso o contacta al técnico al número indicado. |
| `resuelto` / `finalizado` / `cerrado` | **Incidencia Solucionada** | La intervención técnica fue completada y validada en sitio. | Tu requerimiento está concluido con éxito. Puedes consultar la solución formal. |
| `cancelado` | **Solicitud Cancelada** | El caso no procedió por duplicidad o justificación registrada. | Puedes revisar el motivo de cancelación en la trazabilidad del caso. |

---

## 2. Mapeo de Estados para Técnico (Lenguaje Operativo de Consola)

| Estado Backend | Segmento en Cola | CTA Principal en Focus Case | Acción Secundaria |
|---|---|---|---|
| `asignado` | **Por Iniciar** | `Iniciar atención` (Cambia a en progreso) | Abrir evidencia, revisar ambiente |
| `en_progreso` / `en_atencion` | **En Atención Activa** | `Finalizar caso` (Abre registro de solución) | `Bitácora` (Agregar nota de avance), `Solicitar datos` |
| `esperando_usuario` | **Esperando Funcionario** | `Reanudar atención` | Consultar teléfono, registrar intento de visita |
| `resuelto` | **Esperando Confirmación** | `Ver resolución formal` | Historial de bitácora |

---

## 3. Mapeo de Estados para Líder TIC (Lenguaje de Despacho y Operación)

| Estado Backend | Condición en Cola | Indicador Visual | Acción de Mando |
|---|---|---|---|
| `solicitado` / `pendiente` | **Sin Asignar** | Badge Amber / Alerta de tiempo | Seleccionar técnico en cuadrícula y despachar en 1 toque |
| `asignado` | **Asignado (En espera de inicio)** | Badge Azul / En agenda técnica | Reasignar si el técnico está sobrecargado |
| `en_progreso` | **En Atención en Sitio** | Badge Verde / Intervención viva | Monitorear tiempo de atención |
| `cancelado` | **Histórico Cancelado** | Badge Gris / Motivo archivado | Auditoría de rechazos y duplicidades |
