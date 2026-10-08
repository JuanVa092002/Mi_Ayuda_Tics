# Flujo del técnico (mobile)

Cola de campo: ver, iniciar, actualizar y resolver sin fricción, también sin red.

## Acciones y estados

| Estado | CTA principal | Endpoint | Cambia estado |
|---|---|---|---|
| `asignado` | Iniciar atención (1 tap) | `POST /solicitud/:id/iniciarAtencion` | `en_progreso` |
| `en_progreso` | Actualizar (2 taps) | `POST /solicitud/:id/actualizacion` | no |
| `en_progreso` | Pedir info | `POST /solicitud/:id/solicitarInformacion` | `esperando_usuario` |
| `en_progreso` | Solución parcial | `POST /solicitud/:id/solucionParcial` | no |
| `en_progreso` | Solución total (≤3 taps) | `POST /solicitud/:id/solucionTotal` | `resuelto` |

Todas las mutaciones v2 envían `Idempotency-Key`. El retry automático es 0; el CTA “Reintentar acción” reutiliza la misma clave y el mismo payload.

Adjunto opcional (`evidencia`) en actualizar, parcial y total. Pedir información es solo texto.

## Offline-first

1. La cola asignada, los cerrados y el detalle (con historial) se guardan en `tecnico-offline/{userId}.json`.
2. Sin red, las queries sirven ese cache si existe.
3. Iniciar / actualizar / pedir info / solucionar en offline entra a una cola local (`drafts`).
4. Las fotos se copian al storage del documento cuando es posible.
5. Al volver a `AppState.active` (y al montar el stack de técnico) se sincroniza.
6. Un `409` marca `conflict: true`, conserva el texto y pide re-leer el historial antes de reenviar.
7. Logout borra el cache (`wipeSession` → `clearTecnicoOffline`).

No hay NetInfo: se usa el código de error de red del cliente HTTP.

## UI

Mismo kit que Login e Inicio Funcionario: `#04324D` / `#39A900`, `Button`, `BrandTitle`, `StatusBadge`, `TicketHistory`, `FadeIn`.

El avatar del home cierra sesión (el técnico no tiene tab Cuenta). Los tickets v1 siguen resolviéndose en `caso/[id]/resolver`.
