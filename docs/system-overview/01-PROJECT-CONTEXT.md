# 01 — Contexto de Producto (MiAyudaTics)

> **Clasificación:** `VERIFIED` en código y documentación de dominio institucional.

---

## 1. ¿Qué es MiAyudaTics?

**MiAyudaTics** es la plataforma integral de gestión de soporte técnico e infraestructura tecnológica diseñada para el **SENA** (Servicio Nacional de Aprendizaje), específicamente orientada al **Centro de Teleinformática y Producción Industrial (CTPI)** y sus sedes operativas.

El sistema digitaliza, audita, prioriza y despacha las solicitudes de asistencia técnica formuladas por instructores, personal administrativo y directivos hacia el equipo técnico especializado de la Mesa de Ayuda TIC.

---

## 2. El Problema que Resuelve

### Contexto Real Observado en el SENA
1. **Pérdida de trazabilidad de fallas:** En los ambientes de formación y oficinas, las solicitudes de soporte se gestionaban tradicionalmente de forma verbal, vía WhatsApp o en planillas informales, impidiendo conocer tiempos de respuesta reales o reincidencia de fallas en equipos de cómputo.
2. **Ambientes de formación paralizados:** Un fallo de proyector, conectividad de red o software en un ambiente de cómputo detiene la formación presencial de decenas de aprendices. Se requiere atención inmediata o reasignación ágil si un técnico está distante.
3. **Falta de visibilidad para el Líder TIC:** La coordinación TIC carecía de tableros consolidados para saber cuántos técnicos estaban activos, la carga de trabajo por especialista, los ambientes más críticos y la tasa de resolución efectiva.
4. **Desconexión entre el solicitante y el técnico:** El funcionario no sabía si su caso había sido leído, asignado o si el técnico requería información adicional (ej. "el equipo no enciende", pero falta saber qué número de equipo o serial).

---

## 3. Usuarios y Roles del Sistema

El sistema implementa **3 roles canónicos** y **4 perfiles de usuario operativo**:

| Rol del Sistema | Perfil Operativo | Superficie Autorizada | Responsabilidad Principal |
|---|---|---|---|
| `funcionario` | Funcionario Docente (Instructor) / Administrativo | Web (`/funcionario`), Mobile Expo | Radicar solicitudes de soporte, adjuntar evidencias (fotografías de la falla), responder solicitudes de información técnica, confirmar solución recibida o reabrir el caso. |
| `tecnico` | Especialista de Soporte TIC en Campo | Web (`/casos-por-resolver`, `/casos-resueltos`), Mobile Expo | Atender casos asignados, iniciar atención presencial/remota, registrar bitácoras técnicas, solicitar aclaraciones, registrar soluciones parciales o definitivas con evidencia. |
| `lider` | Coordinador / Jefe de Mesa TIC | Web (`/adminSolicitud`, `/adminTecnicos`, `/adminAmbientes`, `/adminCasos`, `/adminEstadisticas`) | Triage de casos nuevos, asignación y reasignación de técnicos, aprobación de nuevas cuentas técnicas, administración de sedes/ambientes y categorías, auditoría general. |

> **Nota Crítica de RBAC:** El rol `lider` **NO está soportado en la app móvil** por diseño intencional; la app bloquea a los líderes en `lider-not-supported.tsx` forzándolos a usar la consola Web donde disponen de vistas complejas y dashboards analíticos.

---

## 4. Jobs-to-be-Done (JTBD)

### Funcionario (Docente / Administrativo)
- *“Cuando tengo una falla tecnológica en mi ambiente de formación, quiero radicar un ticket claro con foto y ambiente específico en menos de 1 minuto, para que un técnico sea enviado sin tener que interrumpir mi clase buscando a alguien por los pasillos.”*
- *“Cuando el técnico indica que resolvió el problema, quiero validar que el equipo efectivamente funciona antes de que el ticket se cierre definitivamente.”*

### Técnico de Soporte
- *“Cuando llego al centro de formación, quiero ver mi lista de casos pendientes priorizados y ordenados por proximidad física (mismo ambiente o misma sede), para atender rápidamente lo urgente sin perder tiempo en traslados innecesarios.”*
- *“Cuando necesito un repuesto o intervención de terceros, quiero registrar una solución parcial con bitácora clara sin cerrar el ticket, para que el funcionario y el líder sepan el estado exacto del equipo.”*

### Líder TIC
- *“Cuando entran múltiples solicitudes a la mesa, quiero verlas ordenadas por criticidad y antigüedad, para asignarlas con un clic al técnico disponible idóneo según la especialidad del problema.”*
- *“Cuando un nuevo técnico se registra, quiero validar su identidad antes de activarlo para asegurar que personas ajenas a la institución no accedan a los datos de soporte.”*

---

## 5. Propuesta de Valor y Principios de Producto

1. **Cero Ambigüedad en el Ciclo de Vida:** Un caso nunca pasa de "en atención" a "cerrado" de forma unilateral; el funcionario solicitante tiene la palabra final de confirmación (`confirm` / `reopen`).
2. **Auditoría Estricta (Append-Only):** Todo cambio de estado, nota de bitácora, reasignación o solicitud de información genera un evento inmutable en `HistorialSolicitud` con autor, marca temporal y rol en el caso.
3. **Resiliencia Operativa:** Sincronización en vivo mediante Server-Sent Events (SSE) y Socket.IO con respaldo automático vía sondeo HTTP, evitando pérdida de novedades ante microcortes de conectividad.
