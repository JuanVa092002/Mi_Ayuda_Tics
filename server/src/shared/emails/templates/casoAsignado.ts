import { buildEmailLayout, getClientUrl, type EmailContent } from '../emailLayout'

export interface CasoAsignadoEmailParams {
  nombre: string
  codigoCaso: string
}

export function buildCasoAsignadoEmail(params: CasoAsignadoEmailParams): EmailContent {
  const clientUrl = getClientUrl()
  return buildEmailLayout({
    pageTitle: 'Este caso es tuyo — MiAyudaTic',
    icon: '',
    recipientName: params.nombre,
    headline: 'Este caso es tuyo.',
    introHtml: `
      <p style="margin:0;">
        El líder te lo dejó en la guardia. El ambiente, el puesto y lo que reportaron están en tu consola.
      </p>`,
    caseLabel: 'Caso en tu guardia',
    caseCode: params.codigoCaso,
    steps: [
      { state: 'done', label: 'Asignado', detail: 'Ya aparece en tus casos.' },
      { state: 'now', label: 'Ve al ambiente', detail: 'Revisa bloque, puesto y lo que pidieron.' },
      { state: 'later', label: 'Inicia la atención', detail: 'Al llegar, pulsa Iniciar atención para dejar el tiempo registrado.' },
    ],
    cta: { label: 'Ver mis casos', href: clientUrl },
    fallbackLink: clientUrl,
    footerNoteHtml: 'Coordinación de MiAyudaTic · CTPI Cauca',
  })
}
