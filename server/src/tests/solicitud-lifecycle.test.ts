import { describe, expect, it } from 'vitest'
import {
  canTransitionSolicitud,
  funcionarioCapabilities,
  getSolicitudCapabilities,
  getSolicitudDisplayStatus,
  getSolicitudLifecycleState,
  getTechnicianQueue,
  getWorkflowVersion,
  isLegacyWorkflow,
  nextPersistedEstado,
  type SolicitudLifecycleInput,
} from '../features/tickets/domain/solicitud-lifecycle'

const lider = { id: 'lider1', rol: 'lider' as const }
const tecnico = { id: 'tec1', rol: 'tecnico' as const }
const funcionario = { id: 'fun1', rol: 'funcionario' as const }

describe('legacy workflowVersion ausente', () => {
  it('interpreta ausencia como version 1', () => {
    expect(getWorkflowVersion({})).toBe(1)
    expect(isLegacyWorkflow({ estado: 'solicitado' })).toBe(true)
  })

  it('solicitado muestra Enviada', () => {
    const s: SolicitudLifecycleInput = { estado: 'solicitado' }
    expect(getSolicitudLifecycleState(s)).toBe('nuevo')
    expect(getSolicitudDisplayStatus(s).label).toBe('Enviada')
  })

  it('asignado legacy muestra En atención y no Técnico asignado', () => {
    const s: SolicitudLifecycleInput = { estado: 'asignado' }
    expect(getSolicitudLifecycleState(s)).toBe('en_progreso_legacy')
    expect(getSolicitudDisplayStatus(s).label).toBe('En atención')
    expect(getSolicitudDisplayStatus(s).label).not.toBe('Técnico asignado')
  })

  it('pendiente legacy muestra seguimiento del equipo TIC', () => {
    const s: SolicitudLifecycleInput = { estado: 'pendiente' }
    expect(getSolicitudLifecycleState(s)).toBe('en_progreso_legacy')
    expect(getSolicitudDisplayStatus(s).label).toBe('Seguimiento pendiente del equipo TIC')
    expect(funcionarioCapabilities(s)).toEqual({
      canReply: false,
      canConfirm: false,
      canReopen: false,
    })
  })

  it('finalizado legacy muestra Cerrada y no permite confirmar ni reabrir', () => {
    const s: SolicitudLifecycleInput = { estado: 'finalizado' }
    expect(getSolicitudLifecycleState(s)).toBe('cerrado_legacy')
    expect(getSolicitudDisplayStatus(s).label).toBe('Cerrada')
    expect(funcionarioCapabilities(s).canConfirm).toBe(false)
    expect(funcionarioCapabilities(s).canReopen).toBe(false)
  })

  it('la máquina v2 no modifica tickets legacy', () => {
    const blocked = canTransitionSolicitud({ estado: 'asignado' }, 'start', tecnico)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.status).toBe(409)
  })
})

describe('workflowVersion 2', () => {
  it('usa los nuevos estados persistidos', () => {
    expect(getSolicitudLifecycleState({ estado: 'nuevo', workflowVersion: 2 })).toBe('nuevo')
    expect(getSolicitudLifecycleState({ estado: 'asignado', workflowVersion: 2 })).toBe('asignado')
    expect(getSolicitudDisplayStatus({ estado: 'asignado', workflowVersion: 2 }).label).toBe(
      'Técnico asignado',
    )
    expect(getSolicitudDisplayStatus({ estado: 'esperando_usuario', workflowVersion: 2 }).label).toBe(
      'Requiere tu información',
    )
  })

  it('permite transiciones válidas', () => {
    expect(nextPersistedEstado('assign', 'nuevo')).toBe('asignado')
    expect(nextPersistedEstado('start', 'asignado')).toBe('en_progreso')
    expect(nextPersistedEstado('wait_for_requester', 'en_progreso')).toBe('esperando_usuario')
    expect(nextPersistedEstado('requester_reply', 'esperando_usuario')).toBe('en_progreso')
    expect(nextPersistedEstado('partial_solution', 'en_progreso')).toBe('en_progreso')
    expect(nextPersistedEstado('resolve', 'en_progreso')).toBe('resuelto')
    expect(nextPersistedEstado('confirm', 'resuelto')).toBe('cerrado')
    expect(nextPersistedEstado('reopen', 'resuelto')).toBe('en_progreso')
    expect(nextPersistedEstado('cancel', 'nuevo')).toBe('cancelado')
    expect(nextPersistedEstado('cancel', 'asignado')).toBe('cancelado')
  })

  it('permite reasignar en asignado, en_progreso y esperando_usuario', () => {
    expect(nextPersistedEstado('reassign', 'asignado')).toBe('asignado')
    expect(nextPersistedEstado('reassign', 'en_progreso')).toBe('asignado')
    expect(nextPersistedEstado('reassign', 'esperando_usuario')).toBe('esperando_usuario')
  })

  it('rechaza reasignar en nuevo, resuelto, cerrado y cancelado', () => {
    expect(nextPersistedEstado('reassign', 'nuevo')).toBeNull()
    expect(nextPersistedEstado('reassign', 'resuelto')).toBeNull()
    expect(nextPersistedEstado('reassign', 'cerrado')).toBeNull()
    expect(nextPersistedEstado('reassign', 'cancelado')).toBeNull()
  })

  it('rechaza transiciones inválidas', () => {
    expect(nextPersistedEstado('resolve', 'nuevo')).toBeNull()
    expect(nextPersistedEstado('confirm', 'nuevo')).toBeNull()
    expect(nextPersistedEstado('resolve', 'asignado')).toBeNull()
    expect(nextPersistedEstado('confirm', 'asignado')).toBeNull()
    expect(nextPersistedEstado('resolve', 'esperando_usuario')).toBeNull()
    expect(nextPersistedEstado('start', 'cerrado')).toBeNull()
    expect(nextPersistedEstado('reopen', 'cancelado')).toBeNull()
    expect(nextPersistedEstado('cancel', 'en_progreso')).toBeNull()
  })

  it('solución parcial no cierra ni pasa a resuelto', () => {
    expect(nextPersistedEstado('partial_solution', 'en_progreso')).toBe('en_progreso')
  })

  it('solución total deja el ticket en resuelto', () => {
    expect(nextPersistedEstado('resolve', 'en_progreso')).toBe('resuelto')
  })

  it('solo líder asigna, reasigna y cancela', () => {
    const ticket = { estado: 'nuevo', workflowVersion: 2 }
    expect(canTransitionSolicitud(ticket, 'assign', lider).ok).toBe(true)
    expect(canTransitionSolicitud(ticket, 'assign', tecnico).ok).toBe(false)
    expect(canTransitionSolicitud({ estado: 'asignado', workflowVersion: 2 }, 'cancel', funcionario).ok).toBe(
      false,
    )
  })

  it('solo técnico puede iniciar, actualizar o resolver', () => {
    const assigned = { estado: 'asignado', workflowVersion: 2 }
    const progress = { estado: 'en_progreso', workflowVersion: 2 }
    expect(canTransitionSolicitud(assigned, 'start', tecnico).ok).toBe(true)
    expect(canTransitionSolicitud(assigned, 'start', lider).ok).toBe(false)
    expect(canTransitionSolicitud(progress, 'resolve', funcionario).ok).toBe(false)
  })

  it('funcionario solo confirma y reabre en resuelto, y solo responde en esperando_usuario', () => {
    const resolved = { estado: 'resuelto', workflowVersion: 2 }
    const waiting = { estado: 'esperando_usuario', workflowVersion: 2 }
    expect(funcionarioCapabilities(resolved)).toEqual({
      canReply: false,
      canConfirm: true,
      canReopen: true,
    })
    expect(funcionarioCapabilities(waiting).canReply).toBe(true)
    expect(canTransitionSolicitud(waiting, 'requester_reply', funcionario).ok).toBe(true)
    expect(canTransitionSolicitud(waiting, 'requester_reply', tecnico).ok).toBe(false)
  })

  it('capacidades de líder y técnico respetan el estado v2', () => {
    const caps = getSolicitudCapabilities(
      { estado: 'nuevo', workflowVersion: 2, usuario: funcionario.id, tecnico: undefined },
      lider,
    )
    expect(caps.canAssign).toBe(true)
    expect(caps.canCancel).toBe(true)
    expect(caps.canStart).toBe(false)
  })

  it('el líder puede reasignar tickets activos v2', () => {
    const assigned = getSolicitudCapabilities(
      { estado: 'asignado', workflowVersion: 2, usuario: funcionario.id, tecnico: tecnico.id },
      lider,
    )
    const progress = getSolicitudCapabilities(
      { estado: 'en_progreso', workflowVersion: 2, usuario: funcionario.id, tecnico: tecnico.id },
      lider,
    )
    const waiting = getSolicitudCapabilities(
      { estado: 'esperando_usuario', workflowVersion: 2, usuario: funcionario.id, tecnico: tecnico.id },
      lider,
    )
    const resolved = getSolicitudCapabilities(
      { estado: 'resuelto', workflowVersion: 2, usuario: funcionario.id, tecnico: tecnico.id },
      lider,
    )
    expect(assigned.canReassign).toBe(true)
    expect(progress.canReassign).toBe(true)
    expect(waiting.canReassign).toBe(true)
    expect(resolved.canReassign).toBe(false)
  })
})

describe('technician queues', () => {
  it('separa resuelto de en atención y lo pone en confirmación', () => {
    expect(getTechnicianQueue({ estado: 'en_progreso', workflowVersion: 2 })).toBe('en_atencion')
    expect(getTechnicianQueue({ estado: 'resuelto', workflowVersion: 2 })).not.toBe('en_atencion')
    expect(getTechnicianQueue({ estado: 'resuelto', workflowVersion: 2 })).toBe('esperando_confirmacion')
    expect(getTechnicianQueue({ estado: 'cerrado', workflowVersion: 2 })).toBe('terminados')
    expect(getTechnicianQueue({ estado: 'cancelado', workflowVersion: 2 })).toBe('terminados')
  })

  it('mantiene legacy asignado y pendiente en en_atencion via lifecycleState', () => {
    expect(getTechnicianQueue({ estado: 'asignado' })).toBe('en_atencion')
    expect(getTechnicianQueue({ estado: 'pendiente' })).toBe('en_atencion')
    expect(getTechnicianQueue({ estado: 'finalizado' })).toBe('terminados')
    expect(getTechnicianQueue({ estado: 'asignado', workflowVersion: 2 })).toBe('por_iniciar')
  })
})
