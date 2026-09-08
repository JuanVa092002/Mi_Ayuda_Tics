import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Solicitud } from '@/shared/types'
import { clearAllWorkflowAttemptKeys } from './workflow-idempotency'

const axiosMocks = vi.hoisted(() => ({
  put: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
}))

vi.mock('@/shared/api/axios', () => ({
  default: {
    put: axiosMocks.put,
    post: axiosMocks.post,
    get: axiosMocks.get,
  },
}))

import {
  asignarSolicitudTecnico,
  getSolicitudesPendientes,
} from './solicitud.service'
import { cancelarSolicitud, reasignarTecnico } from './workflow.service'

describe('leader web ticket mutations', () => {
  afterEach(() => {
    clearAllWorkflowAttemptKeys()
    vi.clearAllMocks()
  })

  it('GET pendientes usa la cola de nuevos', async () => {
    axiosMocks.get.mockResolvedValue({ data: { data: [] } })
    await getSolicitudesPendientes()
    expect(axiosMocks.get).toHaveBeenCalledWith('/solicitud/pendientes')
  })

  it('asignación manda PUT e Idempotency-Key', async () => {
    const solicitud = { _id: 's1', estado: 'asignado' } as Solicitud
    axiosMocks.put.mockResolvedValue({ data: { message: 'ok', solicitud } })
    await asignarSolicitudTecnico('s1', { tecnico: 'tec1' })
    expect(axiosMocks.put).toHaveBeenCalledTimes(1)
    const [url, body, config] = axiosMocks.put.mock.calls[0]
    expect(url).toBe('/solicitud/s1/asignarTecnico')
    expect(body).toEqual({ tecnico: 'tec1' })
    expect(config.headers['Idempotency-Key']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('retry manual reutiliza la misma Idempotency-Key', async () => {
    axiosMocks.put.mockRejectedValueOnce({ code: 'ECONNABORTED' })
    await expect(asignarSolicitudTecnico('s2', { tecnico: 'tec1' })).rejects.toBeTruthy()
    const firstKey = axiosMocks.put.mock.calls[0][2].headers['Idempotency-Key']
    axiosMocks.put.mockResolvedValueOnce({ data: { message: 'ok', solicitud: { _id: 's2' } } })
    await asignarSolicitudTecnico('s2', { tecnico: 'tec1' })
    expect(axiosMocks.put.mock.calls[1][2].headers['Idempotency-Key']).toBe(firstKey)
  })

  it('reasignación y cancelación exigen motivo y no usan DELETE', async () => {
    axiosMocks.post.mockResolvedValue({ data: { message: 'ok', solicitud: { _id: 's3' } } })
    axiosMocks.put.mockResolvedValue({ data: { message: 'ok', solicitud: { _id: 's3' } } })
    await reasignarTecnico('s3', { tecnico: 'tec2', motivo: 'cambio de carga' })
    await cancelarSolicitud('s3', 'fuera de alcance')
    expect(axiosMocks.put.mock.calls[0][0]).toBe('/solicitud/s3/reasignarTecnico')
    expect(axiosMocks.put.mock.calls[0][1]).toEqual({ tecnico: 'tec2', motivo: 'cambio de carga' })
    expect(axiosMocks.post.mock.calls[0][0]).toBe('/solicitud/s3/cancelar')
    expect(axiosMocks.post.mock.calls[0][1]).toEqual({ motivo: 'fuera de alcance' })
  })
})
