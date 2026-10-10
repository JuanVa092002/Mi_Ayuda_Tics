import type { SolicitudWorkflowAction } from './solicitud-lifecycle'
import { buildCasoAsignadoEmail, buildCasoCerradoEmail, buildEmailLayout } from '../../../shared/emails'

export interface WorkflowEmailInput {
  action: SolicitudWorkflowAction
  idempotent: boolean
  codigoCaso: string
  funcionarioNombre: string
  funcionarioCorreo: string
  tecnicoNombre: string
  tecnicoCorreo: string
}

export interface WorkflowEmail {
  to: string
  subject: string
  html: string
  text: string
}

function needInfo(nombre: string, codigoCaso: string): WorkflowEmail {
  const content = buildEmailLayout({
    pageTitle: 'Necesitamos un dato — MiAyudaTic',
    icon: '',
    recipientName: nombre,
    headline: 'El técnico no puede seguir sin ti.',
    introHtml: `<p style="margin:0;">Paró el caso para esperar un dato tuyo. Cuando respondas en MiAyudaTic, la atención continúa.</p>`,
    caseLabel: 'Caso en espera',
    caseCode: codigoCaso,
    steps: [
      { state: 'done', label: 'En atención', detail: 'El técnico ya estaba en el caso.' },
      { state: 'now', label: 'Te toca a ti', detail: 'Responde lo que pidió.' },
      { state: 'later', label: 'Sigue la atención', detail: 'Con tu respuesta, el técnico retoma el ambiente.' },
    ],
  })
  return {
    to: '',
    subject: 'Necesitamos un dato de tu caso — MiAyudaTic',
    ...content,
  }
}

function askConfirm(nombre: string, codigoCaso: string): WorkflowEmail {
  const content = buildEmailLayout({
    pageTitle: 'Revisa la solución y confirma — MiAyudaTic',
    icon: '',
    recipientName: nombre,
    headline: 'Revisa la solución y confirma.',
    introHtml: `<p style="margin:0;">El técnico ya registró lo que hizo. El caso no se cierra hasta que tú digas que quedó bien.</p>`,
    caseLabel: 'Pendiente de tu confirmación',
    caseCode: codigoCaso,
    steps: [
      { state: 'done', label: 'Solución registrada', detail: 'Ya puedes leer qué se hizo.' },
      { state: 'now', label: 'Te toca confirmar', detail: 'Si quedó bien, confírmalo. Si no, el caso puede reabrirse.' },
      { state: 'later', label: 'Cierre', detail: 'Solo después de tu visto en la app el caso queda cerrado.' },
    ],
  })
  return {
    to: '',
    subject: 'Revisa la solución y confirma — MiAyudaTic',
    ...content,
  }
}

export function buildWorkflowEmail(input: WorkflowEmailInput): WorkflowEmail | null {
  if (input.idempotent) return null

  if (input.action === 'assign' || input.action === 'reassign') {
    if (!input.tecnicoCorreo) return null
    const content = buildCasoAsignadoEmail({
      nombre: input.tecnicoNombre,
      codigoCaso: input.codigoCaso,
    })
    return { to: input.tecnicoCorreo, subject: 'Este caso es tuyo — MiAyudaTic', ...content }
  }

  if (input.action === 'wait_for_requester') {
    if (!input.funcionarioCorreo) return null
    const mail = needInfo(input.funcionarioNombre, input.codigoCaso)
    return { ...mail, to: input.funcionarioCorreo }
  }

  if (input.action === 'resolve') {
    if (!input.funcionarioCorreo) return null
    const mail = askConfirm(input.funcionarioNombre, input.codigoCaso)
    return { ...mail, to: input.funcionarioCorreo }
  }

  if (input.action === 'confirm') {
    if (!input.funcionarioCorreo) return null
    const content = buildCasoCerradoEmail({
      nombre: input.funcionarioNombre,
      codigoCaso: input.codigoCaso,
    })
    return {
      to: input.funcionarioCorreo,
      subject: 'Tu caso ya quedó cerrado — MiAyudaTic',
      ...content,
    }
  }

  return null
}
