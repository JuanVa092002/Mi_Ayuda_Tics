import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  buildPasswordResetEmail,
  buildSolicitudRegistradaEmail,
  buildCasoAsignadoEmail,
  buildCasoCerradoEmail,
  buildTecnicoAprobadoEmail,
  buildTecnicoDenegadoEmail,
  getClientUrl,
} from '../shared/emails'

const CLIENT_URL = 'http://localhost:5173'

describe('email templates', () => {
  beforeEach(() => {
    process.env.CLIENT_URL = CLIENT_URL
  })

  afterEach(() => {
    delete process.env.CLIENT_URL
  })

  const templates = [
    {
      name: 'passwordReset',
      build: () =>
        buildPasswordResetEmail({
          nombre: 'Juan Pérez',
          resetLink: `${CLIENT_URL}/restablecerPassword/abc123`,
        }),
      expectInHtml: ['Restablecer mi contraseña', 'Juan Pérez', 'abc123'],
    },
    {
      name: 'solicitudRegistrada',
      build: () =>
        buildSolicitudRegistradaEmail({ nombre: 'María López', codigoCaso: 'CASO-001' }),
      expectInHtml: ['CASO-001', 'María López', CLIENT_URL],
    },
    {
      name: 'casoAsignado',
      build: () =>
        buildCasoAsignadoEmail({ nombre: 'Carlos Técnico', codigoCaso: 'CASO-042' }),
      expectInHtml: ['CASO-042', 'Carlos Técnico', 'Ver mis casos'],
    },
    {
      name: 'casoCerrado',
      build: () =>
        buildCasoCerradoEmail({ nombre: 'Ana Funcionario', codigoCaso: 'CASO-099' }),
      expectInHtml: ['CASO-099', 'Ana Funcionario', 'Caso finalizado'],
    },
    {
      name: 'tecnicoAprobado',
      build: () => buildTecnicoAprobadoEmail({ nombre: 'Pedro Técnico' }),
      expectInHtml: ['Pedro Técnico', 'aprobada', CLIENT_URL],
    },
    {
      name: 'tecnicoDenegado',
      build: () => buildTecnicoDenegadoEmail({ nombre: 'Luis Rechazado' }),
      expectInHtml: ['Luis Rechazado', 'no fue aprobada'],
    },
  ]

  it.each(templates)('$name incluye branding y datos dinámicos', ({ build, expectInHtml }) => {
    const { html, text } = build()

    expect(html).toContain('MiAyudaTics')
    expect(html).not.toContain('AyudaTIC')
    expect(html).not.toContain('MiAyudaTIC')
    expect(html).toContain('Mesa de servicios · SENA CTPI')
    expect(html).toContain('#04324d')

    for (const fragment of expectInHtml) {
      expect(html).toContain(fragment)
    }

    expect(text.length).toBeGreaterThan(0)
  })

  it('getClientUrl usa CLIENT_URL del entorno', () => {
    expect(getClientUrl()).toBe(CLIENT_URL)
  })
})
