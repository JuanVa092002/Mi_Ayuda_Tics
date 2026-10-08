import { describe, expect, it } from 'vitest'
import { buildWorkflowEmail } from '../features/tickets/domain/workflow-email'

const people = {
  codigoCaso: '2026-10-00023',
  funcionarioNombre: 'Juan Perez',
  funcionarioCorreo: 'juan.func@test.local',
  tecnicoNombre: 'Rafael Pastas',
  tecnicoCorreo: 'rafael.tec@test.local',
  tecnicoNuevoNombre: 'QA Tec',
  tecnicoNuevoCorreo: 'qa.tec@test.local',
}

describe('correo del flujo, como lo vive cada persona', () => {
  it('el funcionario radica y solo guarda el comprobante; nadie más recibe correo de ese paso', () => {
    expect(buildWorkflowEmail({ action: 'start', ...people, idempotent: false })).toBeNull()
  })

  it('sigue el caso completo: asignar, pedir datos, resolver y confirmar', () => {
    const asignado = buildWorkflowEmail({ action: 'assign', ...people, idempotent: false })
    expect(asignado?.to).toBe(people.tecnicoCorreo)
    expect(asignado?.subject).toContain('Este caso es tuyo')
    expect(asignado?.html).not.toContain(people.funcionarioCorreo)

    expect(buildWorkflowEmail({ action: 'start', ...people, idempotent: false })).toBeNull()
    expect(buildWorkflowEmail({ action: 'update', ...people, idempotent: false })).toBeNull()

    const espera = buildWorkflowEmail({ action: 'wait_for_requester', ...people, idempotent: false })
    expect(espera?.to).toBe(people.funcionarioCorreo)
    expect(espera?.subject).toContain('Necesitamos un dato')
    expect(espera?.html).toContain('2026-10-00023')
    expect(espera?.html).not.toContain('quedó cerrado')

    expect(buildWorkflowEmail({ action: 'requester_reply', ...people, idempotent: false })).toBeNull()
    expect(buildWorkflowEmail({ action: 'partial_solution', ...people, idempotent: false })).toBeNull()

    const confirmar = buildWorkflowEmail({ action: 'resolve', ...people, idempotent: false })
    expect(confirmar?.to).toBe(people.funcionarioCorreo)
    expect(confirmar?.subject).toContain('Revisa la solución y confirma')
    expect(confirmar?.html).not.toContain('visto bueno')

    const cerrado = buildWorkflowEmail({ action: 'confirm', ...people, idempotent: false })
    expect(cerrado?.to).toBe(people.funcionarioCorreo)
    expect(cerrado?.subject).toContain('Tu caso ya quedó cerrado')
    expect(cerrado?.html).toContain('visto bueno')

    expect(buildWorkflowEmail({ action: 'confirm', ...people, idempotent: true })).toBeNull()
  })

  it('al reasignar solo escribe al técnico que recibe el caso', () => {
    const mail = buildWorkflowEmail({
      action: 'reassign',
      ...people,
      tecnicoNombre: people.tecnicoNuevoNombre,
      tecnicoCorreo: people.tecnicoNuevoCorreo,
      idempotent: false,
    })
    expect(mail?.to).toBe('qa.tec@test.local')
    expect(mail?.to).not.toBe(people.funcionarioCorreo)
    expect(mail?.subject).toContain('Este caso es tuyo')
  })

  it('cancelar o reabrir no manda correo', () => {
    expect(buildWorkflowEmail({ action: 'cancel', ...people, idempotent: false })).toBeNull()
    expect(buildWorkflowEmail({ action: 'reopen', ...people, idempotent: false })).toBeNull()
  })
})
