import { buildEmailLayout, getClientUrl, type EmailContent } from '../emailLayout'

export interface SolicitudRegistradaEmailParams {
  nombre: string
  codigoCaso: string
}

export function buildSolicitudRegistradaEmail(
  params: SolicitudRegistradaEmailParams
): EmailContent {
  const clientUrl = getClientUrl()
  return buildEmailLayout({
    pageTitle: 'Tu caso ya está radicado — MiAyudaTic',
    icon: '',
    recipientName: params.nombre,
    headline: 'Tu caso ya está en la mesa.',
    introHtml: `
      <p style="margin:0;">
        Quedó radicado en <strong>MiAyudaTic</strong>. Guarda este número: es el que vas a decir si preguntas en el ambiente.
      </p>`,
    caseLabel: 'Tu radicado',
    caseCode: params.codigoCaso,
    steps: [
      { state: 'done', label: 'Radicado', detail: 'El centro ya tiene tu solicitud.' },
      { state: 'now', label: 'El líder despacha', detail: 'Elige al técnico que va a tu ambiente.' },
      { state: 'later', label: 'Alguien llega', detail: 'Te avisamos cuando el técnico inicie la atención.' },
    ],
    cta: { label: 'Consultar estado de mi solicitud', href: clientUrl },
    fallbackLink: clientUrl,
  })
}
