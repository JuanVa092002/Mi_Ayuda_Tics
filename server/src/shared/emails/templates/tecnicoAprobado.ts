import { buildEmailLayout, getClientUrl, type EmailContent } from '../emailLayout'

export interface TecnicoAprobadoEmailParams {
  nombre: string
}

export function buildTecnicoAprobadoEmail(params: TecnicoAprobadoEmailParams): EmailContent {
  const clientUrl = getClientUrl()
  return buildEmailLayout({
    pageTitle: 'Ya puedes salir a campo — MiAyudaTics',
    icon: '',
    recipientName: params.nombre,
    headline: 'Ya puedes salir a campo.',
    introHtml: `
      <p style="margin:0;">
        El líder aprobó tu cuenta. Desde ahora los casos del centro pueden llegar a tu guardia en <strong>MiAyudaTics</strong>.
      </p>`,
    steps: [
      { state: 'done', label: 'Cuenta aprobada', detail: 'Quedaste habilitado como técnico.' },
      { state: 'now', label: 'Entra a la consola', detail: 'Usa las mismas credenciales con las que te registraste.' },
      { state: 'later', label: 'Durante el turno', detail: 'Deja la consola abierta para ver los casos que te asignen.' },
    ],
    cta: { label: 'Ingresar a mi consola de campo', href: clientUrl },
    alert: {
      tone: 'success',
      title: 'Tu cuenta de técnico está lista.',
      body: 'La solicitud de registro fue aprobada.',
    },
    fallbackLink: clientUrl,
    footerNoteHtml: 'Coordinación de MiAyudaTics · SENA CTPI Regional Cauca',
  })
}
