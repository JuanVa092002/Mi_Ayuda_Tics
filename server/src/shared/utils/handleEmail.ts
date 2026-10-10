import type { SendMailOptions } from 'nodemailer'
import { logError } from './logger'

interface BrevoRecipient {
  email: string
  name?: string
}

function parseFrom(from: string | undefined): { name: string; email: string } {
  const fallback = process.env.EMAIL_FROM || 'MiAyudaTic <onboarding@brevo.com>'
  const value = from || fallback
  const match = value.match(/^(.+?)\s*<([^>]+)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  return { name: 'MiAyudaTic', email: value.trim() }
}

function normalizeRecipients(to: SendMailOptions['to']): BrevoRecipient[] {
  if (!to) return []
  const list = Array.isArray(to) ? to : [to]
  return list.map(entry => {
    if (typeof entry === 'string') {
      const match = entry.match(/^(.+?)\s*<([^>]+)>$/)
      if (match) return { name: match[1].trim(), email: match[2].trim() }
      return { email: entry }
    }
    if ('address' in entry && entry.address) {
      return { email: entry.address, name: entry.name }
    }
    return { email: String(entry) }
  })
}

async function sendViaBrevoApi(mailOptions: SendMailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error('BREVO_API_KEY no configurada')
  }

  const sender = parseFrom(
    typeof mailOptions.from === 'string' ? mailOptions.from : undefined
  )
  const to = normalizeRecipients(mailOptions.to)
  if (to.length === 0) {
    throw new Error('Destinatario (to) requerido')
  }

  const payload: Record<string, unknown> = {
      sender,
      to,
      subject: mailOptions.subject ?? '(sin asunto)',
      htmlContent:
        typeof mailOptions.html === 'string'
          ? mailOptions.html
          : typeof mailOptions.text === 'string'
            ? `<p>${mailOptions.text}</p>`
            : '<p></p>',
    }

  if (typeof mailOptions.text === 'string' && mailOptions.text.trim()) {
    payload.textContent = mailOptions.text
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Brevo API ${response.status}: ${body}`)
  }

  const result = (await response.json()) as { messageId?: string }
  console.log('Correo enviado vía Brevo API: %s', result.messageId ?? 'ok')
}

function isBrevoIpBlockError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('unrecognised IP address') ||
    message.includes('unauthorized') && message.includes('Brevo API 401')
  )
}

async function sendViaSmtp(mailOptions: SendMailOptions): Promise<void> {
  const nodemailer = await import('nodemailer')
  const port = Number(process.env.BREVO_SMTP_PORT || 587)
  const transporter = nodemailer.default.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.sendinblue.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASSWORD,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
  })

  const info = await transporter.sendMail({
    ...mailOptions,
    from: mailOptions.from || process.env.EMAIL_FROM || 'MiAyudaTic <onboarding@brevo.com>',
  })

  console.log('Correo enviado vía Brevo SMTP: %s', info.messageId)
}

/**
 * Envía correo usando Brevo REST API (preferido) o SMTP como respaldo.
 */
export const sendMail = async (mailOptions: SendMailOptions): Promise<void> => {
  try {
    const hasSmtp =
      Boolean(process.env.BREVO_USER?.trim()) && Boolean(process.env.BREVO_PASSWORD?.trim())
    const hasApiKey = Boolean(process.env.BREVO_API_KEY?.trim())
    const preferSmtp = process.env.BREVO_PREFER_SMTP === 'true'

    if (hasApiKey && !preferSmtp) {
      try {
        await sendViaBrevoApi(mailOptions)
        return
      } catch (error) {
        if (isBrevoIpBlockError(error) && hasSmtp) {
          logError('Brevo API bloqueada por IP; usando SMTP como respaldo', error)
          await sendViaSmtp(mailOptions)
          return
        }
        throw error
      }
    }

    if (hasSmtp) {
      await sendViaSmtp(mailOptions)
      return
    }

    // Si no hay API Key ni credenciales SMTP configuradas en el entorno
    const errorMsg =
      'BREVO_API_KEY o credenciales SMTP (BREVO_USER/BREVO_PASSWORD) requeridas en el archivo .env para enviar correos.'
    console.warn(`[EMAIL WARNING] No se pudo despachar el correo: ${errorMsg}`)
    throw new Error(errorMsg)
  } catch (error) {
    logError('Error al enviar correo con Brevo', error)
    throw error
  }
}
