import { describe, expect, it } from 'vitest'
import type { Solicitud } from '@/shared/types'
import {
  canLeaderAssign,
  canLeaderCancel,
  canLeaderReassign,
  filterLeaderHistory,
  formatSolicitudFecha,
  leaderStatusTone,
  parseSolicitudDate,
  solutionPreview,
  sortSolicitudesNewest,
  unwrapWorkflowSolicitud,
  validateRequiredMotivo,
  workflowLabel,
} from './leader-inbox'

function row(partial: Partial<Solicitud> & Pick<Solicitud, '_id' | 'estado'>): Solicitud {
  return {
    descripcion: 'Incidente',
    ...partial,
  }
}

describe('leader-inbox', () => {
  it('ordena ISO y fechas DD-MM-YYYY de más reciente a más antigua', () => {
    const sorted = sortSolicitudesNewest([
      row({ _id: 'old', estado: 'nuevo', fecha: '13-06-2026 05:28' }),
      row({ _id: 'new', estado: 'nuevo', fecha: '2026-09-07T21:36:00.000Z' }),
    ])
    expect(sorted[0]?._id).toBe('new')
    expect(parseSolicitudDate('07-09-2026 21:36')).toBeGreaterThan(parseSolicitudDate('13-06-2026'))
  })

  it('permite asignar v1 solicitado y v2 nuevo según capabilities', () => {
    expect(canLeaderAssign({ estado: 'solicitado', capabilities: { canAssign: true } })).toBe(true)
    expect(canLeaderAssign({ estado: 'nuevo', capabilities: { canAssign: true } })).toBe(true)
    expect(canLeaderAssign({ estado: 'asignado', capabilities: { canAssign: false } })).toBe(false)
    expect(canLeaderAssign({ estado: 'solicitado' })).toBe(true)
  })

  it('reasigna y cancela solo con capabilities v2', () => {
    expect(canLeaderReassign({ estado: 'asignado', capabilities: { canReassign: true } })).toBe(true)
    expect(canLeaderReassign({ estado: 'asignado', capabilities: { canReassign: false } })).toBe(false)
    expect(canLeaderReassign({ estado: 'esperando_usuario' })).toBe(true)
    expect(canLeaderCancel({ estado: 'nuevo', capabilities: { canCancel: true } })).toBe(true)
    expect(canLeaderCancel({ estado: 'nuevo', workflowVersion: 1 })).toBe(false)
    expect(canLeaderCancel({ estado: 'nuevo', workflowVersion: 2 })).toBe(true)
  })

  it('exige motivo de al menos 3 caracteres para reasignar o cancelar', () => {
    expect(validateRequiredMotivo('abc')).toBeNull()
    expect(validateRequiredMotivo('ab')).toMatch(/obligatorio/)
  })

  it('marca cancelado aparte de cerrado/resuelto', () => {
    expect(leaderStatusTone('cancelado')).toBe('cancelled')
    expect(leaderStatusTone('cerrado')).toBe('done')
    expect(leaderStatusTone('nuevo')).toBe('inbox')
    expect(formatSolicitudFecha('2026-09-07T21:36:00.000Z')).toMatch(/7\/09/)
  })

  it('separa historial activo y cerrado', () => {
    const items = [
      row({ _id: 'a', estado: 'esperando_usuario' }),
      row({ _id: 'b', estado: 'cancelado' }),
      row({ _id: 'c', estado: 'resuelto' }),
    ]
    expect(filterLeaderHistory(items, 'activos').map((item) => item._id)).toEqual(['a', 'c'])
    expect(filterLeaderHistory(items, 'cerrados').map((item) => item._id)).toEqual(['b'])
  })

  it('desenvuelve { message, solicitud } de las mutaciones v2', () => {
    const solicitud = row({ _id: 's1', estado: 'asignado' })
    expect(unwrapWorkflowSolicitud({ message: 'ok', solicitud })._id).toBe('s1')
    expect(unwrapWorkflowSolicitud(solicitud)._id).toBe('s1')
  })

  it('prefiere solución legacy y si no hay, el headline v2', () => {
    expect(
      solutionPreview(
        row({
          _id: 'v1',
          estado: 'finalizado',
          solucion: { descripcionSolucion: 'Cambio de disco' },
        }),
      ),
    ).toBe('Cambio de disco')
    expect(
      solutionPreview(
        row({ _id: 'v2', estado: 'resuelto', headline: 'El funcionario debe confirmar.' }),
      ),
    ).toBe('El funcionario debe confirmar.')
    expect(workflowLabel(2)).toBe('v2')
  })
})
