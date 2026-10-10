import { buildEmailLayout, getClientUrl, type EmailContent } from '../emailLayout'

export interface CasoCerradoEmailParams {
  nombre: string
  codigoCaso: string
}

export function buildCasoCerradoEmail(params: CasoCerradoEmailParams): EmailContent {
  const clientUrl = getClientUrl()
  return buildEmailLayout({
    pageTitle: 'Tu caso quedó cerrado — MiAyudaTic',
    icon: '',
    recipientName: params.nombre,
    headline: 'Este caso ya quedó cerrado.',
    introHtml: `
      <p style="margin:0;">
        La intervención terminó y el caso quedó archivado con tu visto bueno. Gracias: eso mantiene el servicio del CTPI al día.
      </p>`,
    caseLabel: 'Caso finalizado',
    caseCode: params.codigoCaso,
    steps: [
      { state: 'done', label: 'Atendido', detail: 'El técnico registró la solución.' },
      { state: 'done', label: 'Confirmado', detail: 'El cierre quedó con tu visto bueno.' },
      { state: 'now', label: 'En tu historial', detail: 'Puedes volver a leer qué se hizo, cuando lo necesites.' },
    ],
    cta: { label: 'Consultar historial en el sistema', href: clientUrl },
    alert: {
      tone: 'success',
      title: 'Caso finalizado y archivado.',
      body: 'La bitácora de la solución sigue disponible en tu historial.',
    },
    fallbackLink: clientUrl,
    footerNoteHtml: 'Equipo de MiAyudaTic · CTPI Regional Cauca',
  })
}
