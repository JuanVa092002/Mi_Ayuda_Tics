# 15 — Registro de Decisiones de Arquitectura (Architectural Decisions)

> **Clasificación:** Decisiones observadas y deducidas a partir de la implementación y evolución del repositorio.

---

## ADR-01: Máquina de Estados Workflow v2 con Persistencia Append-Only
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** En la versión inicial (v1), el estado de un caso se mutaba directamente y el cierre dependía de una entidad secundaria (`SolucionCaso`), impidiendo saber qué técnico intervino previamente o qué preguntas se realizaron.
- **Decisión:** Implementar Workflow v2 (`workflowVersion === 2`) con 7 estados determinísticos y un historial inmutable (`HistorialSolicitud`) donde cada acción (`started`, `note_added`, `resolved`, etc.) es un registro independiente.
- **Consecuencias:** Trazabilidad absoluta de extremo a extremo, pero exige transacciones de réplica en MongoDB para mantener la atomicidad de las mutaciones.

---

## ADR-02: Garantía de Idempotencia a Nivel de Frontera HTTP
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** En condiciones de conectividad inestable o clics repetidos en la interfaz, una misma acción (ej. resolver un caso o registrar una nota) podía duplicarse o crear condiciones de carrera.
- **Decisión:** Exigir la cabecera HTTP `Idempotency-Key` en todas las acciones de mutación de tickets. Si llega una petición con la misma clave, se devuelve el resultado previo sin volver a mutar ni crear eventos duplicados en la base de datos.
- **Consecuencias:** Elimina duplicaciones accidentales; obliga al cliente a generar UUIDs por cada intención de usuario.

---

## ADR-03: Realtime Híbrido: Server-Sent Events (SSE) + Sondeo Secundario
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** Socket.IO requería configuraciones complejas de handshake, reintentos y dependencias de cliente adicionales en Web.
- **Decisión:** Utilizar **Server-Sent Events (SSE)** mediante `/api/notificaciones/stream` como el mecanismo primario de push para navegadores, con un polling de respaldo de baja frecuencia (60s).
- **Consecuencias:** Funciona sobre HTTP estándar sin librerías pesadas en el frontend; desconexiones transitorias se recuperan automáticamente con backoff.

---

## ADR-04: Exclusión del Rol Líder TIC en la Aplicación Móvil
- **Estado:** `Aceptada y en Producción`.
- **Contexto:** Las tareas del Líder TIC involucran tableros Bento Grid densos, análisis de métricas comparativas y gestión masiva de ambientes y usuarios.
- **Decisión:** Bloquear el acceso a cuentas de Líder en la aplicación Expo (`lider-not-supported.tsx`), forzando el uso exclusivo de la versión Web para este rol.
- **Consecuencias:** Evita degradar la experiencia de coordinación técnica en pantallas pequeñas; simplifica el alcance de la app móvil centrándola en la labor de campo (Funcionario y Técnico).
