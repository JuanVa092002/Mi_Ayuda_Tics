# Historial de tickets (timeline)

Componente de presentación del `historial` que ya llega en el detalle de la solicitud. No llama al API ni cambia la forma de los datos.

## Uso

```tsx
import { TicketHistory } from '@/shared/ui/ticket-history';

<TicketHistory
  events={detail.historial}
  emptyNote={detail.historyNote}
  incidentPhotoUrl={detail.photo?.optimizedUrl ?? detail.photo?.url}
  solutionEvidenceUrl={detail.solution?.evidenceUrl}
/>
```

Pantallas que lo usan hoy:

- Detalle funcionario: `SolicitudDetailScreen`
- Detalle técnico: `app/(tecnico)/caso/[id].tsx`

## Qué hace

| Pieza | Comportamiento |
| --- | --- |
| Agrupación | `Hoy`, `Ayer` o fecha en es-CO. Días más recientes arriba. |
| Iconos / color | Cada `type` tiene nodo, color institucional y peso visual. |
| Copy | `[Autor] [acción]`. El `message` del API solo se muestra si no es el texto genérico. |
| Evidencia | Foto inline con tap para ampliar. Adjuntos no-imagen como chip. |
| Performance | Si hay más de 20 eventos, muestra los más recientes y un CTA para el resto. |

## Tipos visuales

- Creación: azul `#04324D`
- Asignación: verde `#39A900`
- Trabajo (`started`, `updated`): gris
- Espera / reapertura: naranja
- Solución: verde
- Cierre: gris
- Cancelación: rojo

Eventos críticos (`created`, `resolved`, `closed`, `cancelled`, `reopened`) van en tarjeta tintada. El resto es compacto.

El rol (Funcionario / Técnico / Líder) se infiere del tipo de evento porque el API no envía `rol` en el autor del historial.
