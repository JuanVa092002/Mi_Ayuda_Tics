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
  sortSolicitudesOldest,
  sortLeaderDispatch,
  unwrapWorkflowSolicitud,
  validateRequiredMotivo,
  workflowLabel,
  filterLeaderOps,
  countLeaderOps,
  leaderFacingStatusLabel,
  leaderResponsibilityLine,
  leaderReassignIsPrimary,
  reassignConsequence,
  leaderCaseNarrative,
  leaderUrgencyMarks,
  tecnicoActiveLoad,
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
    const waiting = sortSolicitudesOldest([
      row({ _id: 'new', estado: 'nuevo', fecha: '2026-09-07T21:36:00.000Z' }),
      row({ _id: 'undated', estado: 'nuevo' }),
      row({ _id: 'old', estado: 'nuevo', fecha: '13-06-2026 05:28' }),
    ])
    expect(waiting.map((item) => item._id)).toEqual(['old', 'new', 'undated'])
    expect(parseSolicitudDate('07-09-2026 21:36')).toBeGreaterThan(parseSolicitudDate('13-06-2026'))
  })

  it('ordena despacho: express, luego atención al público, luego estándar; dentro del grupo el más antiguo', () => {
    const expressNew = row({
      _id: 'express-new',
      estado: 'nuevo',
      fecha: '2026-09-07T21:36:00.000Z',
      descripcion: '[MODO: EXPRESS] Clase en vivo',
    })
    const expressOld = row({
      _id: 'express-old',
      estado: 'nuevo',
      fecha: '13-06-2026 05:28',
      descripcion: '[MODO: EXPRESS] Clase en vivo',
    })
    const publico = row({
      _id: 'publico',
      estado: 'nuevo',
      fecha: '01-01-2026 10:00',
      descripcion: '[IMPACTO: ATENCION_PUBLICO] Ventanilla',
    })
    const ordinario = row({
      _id: 'ordinario',
      estado: 'nuevo',
      fecha: '01-01-2025 10:00',
      descripcion: 'Falla de red en oficina',
    })
    const sinFecha = row({ _id: 'sin-fecha', estado: 'nuevo', descripcion: 'Sin marca' })

    const ordered = sortLeaderDispatch([ordinario, publico, expressNew, sinFecha, expressOld])
    expect(ordered.map((item) => item._id)).toEqual([
      'express-old',
      'express-new',
      'publico',
      'ordinario',
      'sin-fecha',
    ])
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
    expect(solutionPreview(row({ _id: 'v2', estado: 'resuelto', headline: 'El funcionario debe confirmar.' }))).toBe(
      'Sin solución registrada',
    )
    expect(workflowLabel(2)).toBe('v2')
  })

  it('separa la operación por cola y no llama solución al estado', () => {
    const items = [
      row({ _id: 'a', estado: 'asignado', workflowVersion: 2, queue: 'por_iniciar', tecnico: { _id: 't1', nombre: 'Ana' } as never }),
      row({ _id: 'b', estado: 'en_progreso', workflowVersion: 2, queue: 'en_atencion' }),
      row({ _id: 'c', estado: 'esperando_usuario', queue: 'esperando_funcionario' }),
      row({ _id: 'd', estado: 'resuelto', queue: 'esperando_confirmacion' }),
      row({ _id: 'e', estado: 'cerrado', queue: 'terminados' }),
    ]
    expect(filterLeaderOps(items, 'operacion').map((item) => item._id)).toEqual(['a', 'b', 'c', 'd'])
    expect(filterLeaderOps(items, 'por_iniciar').map((item) => item._id)).toEqual(['a'])
    expect(countLeaderOps(items).terminados).toBe(1)
    expect(leaderResponsibilityLine(items[0]!)).toBe('Ana aún no inicia')
    expect(leaderFacingStatusLabel({ ...items[2]!, displayStatus: 'Requiere tu información' })).toBe('Espera funcionario')
    expect(leaderFacingStatusLabel(items[0]!)).toBe('Por iniciar')
    expect(leaderFacingStatusLabel(items[3]!)).toBe('Espera confirmación')
    expect(leaderResponsibilityLine(items[2]!)).toBe('Espera respuesta del funcionario')
    expect(leaderReassignIsPrimary(items[2]!)).toBe(false)
    expect(reassignConsequence(items[1]!)).toMatch(/por iniciar/)
    expect(leaderCaseNarrative('[MODO: EXPRESS | IMPACTO: ATENCION_PUBLICO]\nProyector')).toBe('Proyector')
    expect(leaderUrgencyMarks('[MODO: EXPRESS | IMPACTO: ATENCION_PUBLICO]\nProyector')).toEqual([
      'clase_en_vivo',
      'atencion_publico',
    ])
    expect(tecnicoActiveLoad(items, 't1')).toBe(1)
  })
})
