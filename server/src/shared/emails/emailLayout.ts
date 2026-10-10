export interface EmailCta {
  label: string
  href: string
}

export type EmailAlertTone = 'info' | 'warning' | 'success'

export interface EmailAlert {
  tone: EmailAlertTone
  title: string
  body?: string
}

export interface EmailStep {
  label: string
  detail: string
  state: 'done' | 'now' | 'later'
}

export interface EmailLayoutOptions {
  pageTitle: string
  icon: string
  recipientName: string
  /** Frase que abre la experiencia. Si no viene, el saludo es el título. */
  headline?: string
  introHtml: string
  caseLabel?: string
  caseCode?: string
  steps?: EmailStep[]
  cta?: EmailCta
  alert?: EmailAlert
  fallbackLink?: string
  footerNoteHtml?: string
}

export interface EmailContent {
  html: string
  text: string
}

export function getClientUrl(): string {
  return process.env.CLIENT_URL || 'http://localhost:5173'
}

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.EMAIL ||
    'MiAyudaTic <onboarding@brevo.com>'
  )
}

const ALERT_STYLES: Record<
  EmailAlertTone,
  { bg: string; border: string; accent: string; title: string; body: string }
> = {
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    accent: '#04324d',
    title: '#04324d',
    body: '#1e40af',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    accent: '#d97706',
    title: '#92400e',
    body: '#b45309',
  },
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#39a900',
    title: '#166534',
    body: '#15803d',
  },
}

function buildAlertHtml(alert: EmailAlert): string {
  const s = ALERT_STYLES[alert.tone]
  const bodyHtml = alert.body
    ? `<p style="margin:4px 0 0;color:${s.body};font-size:12px;line-height:1.5;">${alert.body}</p>`
    : ''
  return `
    <div style="background:${s.bg};
                border:1px solid ${s.border};
                border-left:4px solid ${s.accent};
                border-radius:12px;
                padding:14px 18px;
                margin:24px 0;
                text-align:left;">
      <p style="margin:0;color:${s.title};
                font-size:13px;font-weight:700;">
        ${alert.title}
      </p>
      ${bodyHtml}
    </div>`
}

function buildCaseHtml(label: string, code: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background-color:#f4f8fb;border:1px solid #d5e3ee;border-radius:16px;">
      <tr>
        <td style="padding:18px 20px 6px;">
          <p style="margin:0;color:#5b7284;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 18px;">
          <p style="margin:0;color:#04324d;font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">#${code}</p>
        </td>
      </tr>
    </table>`
}

function buildStepsHtml(steps: EmailStep[]): string {
  const rows = steps
    .map((step) => {
      const mark = step.state === 'done' ? '#39a900' : step.state === 'now' ? '#04324d' : '#cbd5e1'
      const title = step.state === 'later' ? '#64748b' : '#0f172a'
      return `
        <tr>
          <td width="28" valign="top" style="padding:0 0 14px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${mark};margin-top:4px;"></div>
          </td>
          <td valign="top" style="padding:0 0 14px;">
            <p style="margin:0;color:${title};font-size:14px;font-weight:700;line-height:1.3;">${step.label}</p>
            <p style="margin:2px 0 0;color:#64748b;font-size:13px;line-height:1.45;">${step.detail}</p>
          </td>
        </tr>`
    })
    .join('')
  return `
    <p style="margin:0 0 10px;color:#04324d;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Qué sigue</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">${rows}</table>`
}

function buildCtaHtml(cta: EmailCta): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
      <tr>
        <td align="center" bgcolor="#04324d" style="background-color:#04324d;border-radius:12px;">
          <a href="${cta.href}"
             target="_blank"
             style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;line-height:1.2;text-decoration:none;border-radius:12px;">
            <font color="#ffffff" style="color:#ffffff;text-decoration:none;">${cta.label}</font>
          </a>
        </td>
      </tr>
    </table>`
}

function buildFallbackLinkHtml(link: string): string {
  return `
    <div style="margin-top:24px;padding-top:18px;
                border-top:1px dashed #e2e8f0;text-align:left;">
      <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
        ¿Tienes problemas con el botón superior?
      </p>
      <p style="margin:6px 0 0;word-break:break-all;font-size:12px;line-height:1.4;">
        <a href="${link}"
           target="_blank"
           rel="noopener noreferrer"
           style="color:#04324d;text-decoration:underline;word-break:break-all;">
          ${link}
        </a>
      </p>
    </div>`
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function buildEmailLayout(options: EmailLayoutOptions): EmailContent {
  const name = options.recipientName || 'usuario'
  const headline = options.headline || `Hola, ${name}`
  const greeting = options.headline
    ? `<p style="margin:0 0 8px;color:#64748b;font-size:13px;font-weight:600;">Hola, ${name}</p>`
    : ''
  const caseHtml = options.caseCode
    ? buildCaseHtml(options.caseLabel || 'Tu caso', options.caseCode)
    : ''
  const stepsHtml = options.steps?.length ? buildStepsHtml(options.steps) : ''
  const ctaHtml = options.cta ? buildCtaHtml(options.cta) : ''
  const alertHtml = options.alert ? buildAlertHtml(options.alert) : ''
  const showFallback =
    Boolean(options.fallbackLink) && !/localhost|127\.0\.0\.1/i.test(options.fallbackLink || '')
  const fallbackHtml = showFallback ? buildFallbackLinkHtml(options.fallbackLink || '') : ''
  const footerNoteHtml = options.footerNoteHtml
    ? `<div style="margin:24px 0 0;padding-top:16px;border-top:1px dashed #e2e8f0;color:#64748b;font-size:13px;line-height:1.6;text-align:left;">
        ${options.footerNoteHtml}
      </div>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${options.pageTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @media only screen and (max-width: 620px) {
    .container-card { width: 100% !important; border-radius: 0 !important; }
    .content-cell { padding: 28px 20px !important; }
    .header-cell { padding: 28px 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Plus Jakarta Sans','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:36px 12px;">
    <tr>
      <td align="center" valign="top">
        <table class="container-card" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 16px 36px -8px rgba(4,50,77,0.1),0 0 0 1px rgba(226,232,240,0.85);">
          
          <!-- Modern Header Banner -->
          <tr>
            <td class="header-cell" bgcolor="#04324d" style="background-color:#04324d;padding:28px 32px 24px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.03em;line-height:1.2;color:#ffffff;">
                <span style="color:#ffffff;">MiAyuda</span><span style="color:#39a900;">Tics</span>
              </p>
              <p style="margin:8px 0 0;color:#dbe7ef;font-size:12px;font-weight:600;line-height:1.4;">
                Mesa de servicios · SENA CTPI
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#39a900" style="background-color:#39a900;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Main Content Card Body -->
          <tr>
            <td class="content-cell" style="padding:36px 36px 28px;background-color:#ffffff;">
              <!-- Floating Icon Shield -->
              ${greeting}
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:26px;font-weight:800;letter-spacing:-0.03em;text-align:left;line-height:1.2;">
                ${headline}
              </h2>

              <div style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;text-align:left;">
                ${options.introHtml}
              </div>

              ${caseHtml}
              ${stepsHtml}
              ${alertHtml}
              ${ctaHtml}
              ${footerNoteHtml}
              ${fallbackHtml}
            </td>
          </tr>

          <!-- Footer Signature -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #edf2f7;padding:24px 36px;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                Este correo fue enviado automáticamente por <strong style="color:#04324d;">MiAyudaTic</strong><br/>
                SENA · Centro de Teleinformática y Producción Industrial · Cauca<br/>
                <span style="color:#94a3b8;font-size:11px;">© 2026 · No respondas a este correo</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textParts = [
    options.headline || `Hola, ${name}`,
    options.caseCode ? `#${options.caseCode}` : '',
    stripHtml(options.introHtml),
    options.cta ? `${options.cta.label}: ${options.cta.href}` : '',
    options.alert ? `${options.alert.title}${options.alert.body ? ` ${options.alert.body}` : ''}` : '',
    options.footerNoteHtml ? stripHtml(options.footerNoteHtml) : '',
    options.fallbackLink ? `Enlace alternativo: ${options.fallbackLink}` : '',
  ].filter(Boolean)

  return { html, text: textParts.join('\n\n') }
}
