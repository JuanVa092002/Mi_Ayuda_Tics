import { buildEmailLayout, type EmailContent } from '../emailLayout'

export interface PasswordResetEmailParams {
  nombre: string
  resetLink: string
}

export function buildPasswordResetEmail(params: PasswordResetEmailParams): EmailContent {
  return buildEmailLayout({
    pageTitle: 'Restablece tu contraseña — MiAyudaTic',
    icon: '',
    recipientName: params.nombre,
    headline: 'Te dejamos una hora para entrar.',
    introHtml: `
      <p style="margin:0;">
        Pediste una contraseña nueva en <strong>MiAyudaTic</strong>. El botón abre un enlace de un solo uso. Si no fuiste tú, ignora este correo: tu clave no cambia.
      </p>`,
    steps: [
      { state: 'now', label: 'Abre el enlace', detail: 'Define la clave nueva en la página que se abre.' },
      { state: 'later', label: 'Caduca en 1 hora', detail: 'Después de eso hay que pedir otro enlace.' },
    ],
    cta: { label: 'Restablecer mi contraseña', href: params.resetLink },
    alert: {
      tone: 'warning',
      title: 'Este enlace expira en 1 hora.',
      body: 'Sirve una sola vez. Si no reconoces la solicitud, no hagas nada.',
    },
    footerNoteHtml: 'Seguridad de MiAyudaTic · SENA CTPI',
    fallbackLink: params.resetLink,
  })
}
