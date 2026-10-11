# Modelo de Estados (STATE-MODEL.md)

Este documento define el vocabulario de estados semánticos y humanos utilizado en toda la plataforma.

## 1. Mapeo de Estados para Funcionario (Lenguaje Humano de Acompañamiento)

| Estado Backend | Título Humano | Explicación para el Usuario | "Qué sigue" | "Lo que necesitas hacer" |
|---|---|---|---|---|
| `solicitado` / `nuevo` / `pendiente` | **Radicado y en Cola** | Tu solicitud fue recibida exitosamente por la Mesa de Ayuda TIC. | El Líder TIC revisará tu caso para despacharlo al especialista del área. | N/A (Esperar asignación) |
| `asignado` | **Especialista Designado** | Un técnico especialista ya tiene asignada tu solicitud y la agendó. | El técnico asignado acudirá a tu ambiente en los próximos turnos de soporte. | N/A (Esperar visita) |
| `en_progreso` / `en_atencion` | **En Atención Activa** | El técnico se encuentra realizando labores de diagnóstico y reparación. | El técnico completará la intervención y registrará la solución formal en el sistema. | Verificar operatividad al finalizar |
| `esperando_usuario` | **Esperando tu Respuesta** | El equipo técnico requiere información adicional o acceso al aula. | Esperamos tu respuesta para continuar con la intervención en el equipo. | Comunicarse con el técnico o permitir acceso al aula |
| `resuelto` / `finalizado` / `cerrado` | **Incidencia Solucionada** | La intervención técnica fue completada y validada en sitio. | El requerimiento fue solucionado. Puedes consultar los detalles abajo. | N/A |
| `cancelado` | **Solicitud Cancelada** | El caso no procedió por duplicidad o justificación registrada. | Puedes revisar el motivo de cancelación en la trazabilidad del caso. | N/A |

---

## 2. Mapeo de Estados para Técnico (Lenguaje Operativo de Consola)

| Estado Backend | Segmento en Cola | CTA Principal en Focus Case | Acción Secundaria |
|---|---|---|---|
| `asignado` | **Por Iniciar** | `Iniciar atención` | Abrir evidencia, revisar ambiente |
| `en_progreso` / `en_atencion` | **En Atención Activa** | `Finalizar caso` | `Bitácora`, `Solicitar datos` |
| `esperando_usuario` | **Esperando Funcionario** | `Reanudar atención` | Consultar teléfono, registrar intento de visita |
| `resuelto` | **Esperando Confirmación** | `Ver resolución formal` | Historial de bitácora |

---

## 3. Mapeo de Estados para Líder TIC (Lenguaje de Despacho y Operación)

| Estado Backend | Condición en Cola | Indicador Visual | Acción de Mando |
|---|---|---|---|
| `solicitado` / `pendiente` | **Sin Asignar** | Badge Amber | Seleccionar técnico en cuadrícula y despachar en 1 toque |
| `asignado` | **Asignado** | Badge Azul | Reasignar si el técnico está sobrecargado |
| `en_progreso` | **En Atención en Sitio** | Badge Verde | Monitorear tiempo de atención |
| `cancelado` | **Histórico Cancelado** | Badge Gris | Auditoría de rechazos y duplicidades |
