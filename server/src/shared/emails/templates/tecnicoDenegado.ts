import { buildEmailLayout, type EmailContent } from '../emailLayout'

export interface TecnicoDenegadoEmailParams {
  nombre: string
}

export function buildTecnicoDenegadoEmail(params: TecnicoDenegadoEmailParams): EmailContent {
  return buildEmailLayout({
    pageTitle: 'Tu registro no quedó habilitado — MiAyudaTic',
    icon: '',
    recipientName: params.nombre,
    headline: 'Esta vez el registro no quedó habilitado.',
    introHtml: `
      <p style="margin:0;">
        El líder revisó tu solicitud para entrar como técnico en <strong>MiAyudaTic</strong> y no fue aprobada. No es un cierre definitivo: puedes aclararlo con él.
      </p>`,
    steps: [
      { state: 'done', label: 'Revisada', detail: 'Alguien del centro ya vio la solicitud.' },
      { state: 'now', label: 'No habilitada', detail: 'Suele pasar por datos incompletos, correo sin verificar o porque el turno no tiene plaza.' },
      { state: 'later', label: 'Si no cuadra', detail: 'Habla con el líder TIC del CTPI y revisen juntos el registro.' },
    ],
    alert: {
      tone: 'warning',
      title: 'Tu solicitud de registro como técnico no fue aprobada.',
      body: 'Para una aclaración, habla con el líder TIC del centro.',
    },
    footerNoteHtml: 'Coordinación de MiAyudaTic · SENA CTPI Regional Cauca',
  })
}
