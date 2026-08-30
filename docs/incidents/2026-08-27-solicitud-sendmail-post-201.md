# Incidente — `crearSolicitud` responde 201 y luego `sendMail`

**Estado:** ABIERTO — deuda backend, fase separada  
**Fecha apertura:** 2026-08-27  
**Severidad:** P2 (funcional en el 201; riesgo de conexión/observabilidad en fallo de mail)  
**Workstream:** `DEBT-solicitud-sendmail-post-201`  
**Fuera de:** incidente `codigoCaso` / Fase D mobile

No se corrige en esta fase. No se modifica el controller.

---

## Síntoma

`POST /api/solicitud` puede devolver **201** (solicitud persistida) y, a continuación, si `sendMail` falla, el `catch` de `crearSolicitud` llama `handleHttpError` e intenta **una segunda respuesta HTTP**. En Node/Express eso lanza `Cannot set headers after they are sent to the client` y puede romper la conexión del cliente.

Observado en Fase C simulation local con Brevo/SMTP intencionalmente vacíos: el create ya había hecho `201`, el mail falló, y el catch intentó responder otra vez.

## Causa

En `server/src/features/tickets/controllers/solicitud.ts`:

1. `solicitudModel.create(...)`
2. `res.status(201).send({ message, solicitud })`
3. `await sendMail(...)` (correo de registro)
4. El `catch` envuelve **create y mail**. Si el mail falla, trata el error como fallo de registro y llama `handleHttpError` **después** de haber enviado el 201.

El mail no está aislado del ciclo de respuesta HTTP.

## Riesgo

- Cliente (mobile/web) puede ver 201 y después un socket/reset o error de red (p. ej. `NETWORK_ERROR` / fetch failed).
- Se puede interpretar un create exitoso como fallo de UI.
- Logs de “Error al registrar solicitud” para un documento **ya persistido**.
- No es un bug de unicidad de `codigoCaso` ni de RBAC; es un defecto de orden respuesta vs efecto secundario.

## Comportamiento correcto esperado

- Persistencia + `codigoCaso` determinan el **201**.
- El correo es **efecto secundario no bloqueante**: no debe revertir ni reescribir el status HTTP.
- **Nunca** enviar una segunda respuesta HTTP en el mismo request.
- Fallo de mail: log + métrica / cola / retry; el cliente ya tiene el cuerpo 201.

## Alcance de corrección

Requiere **fase backend separada** (no Fase D, no mobile, no staging/prod de este incidente). Posible forma (no implementar ahora):

- `try/catch` solo alrededor de `sendMail` **después** del 201; o
- `void sendMail(...).catch(log)`; o
- outbox/job.

No mezclar con unique index, privacidad de teléfono, ni E2E mobile.

## Relación con tests

`test:integration` mockea `sendMail`, por eso no reproduce este catch. Fase C HTTP real sin stub lo disparó.
