import { describe, expect, it, vi } from 'vitest'
import {
  applyWebBootstrapOutcome,
  resolveWebAuthBootstrap,
} from '@/features/auth/context/web-auth-bootstrap'

describe('AuthProvider bootstrap contract', () => {
  it('si verify-token falla, guest sigue usable (loading=false, sin auth)', async () => {
    const verify = vi.fn().mockRejectedValue(new Error('timeout'))

    const outcome = await resolveWebAuthBootstrap(verify)

    expect(outcome).toEqual({ kind: 'guest' })
    expect(applyWebBootstrapOutcome(outcome)).toEqual({
      loading: false,
      isAuthenticated: false,
      user: null,
    })
  })

  it('si verify-token responde 401, guest usable y no autenticado', async () => {
    const verify = vi.fn().mockRejectedValue({ response: { status: 401 } })
    const outcome = await resolveWebAuthBootstrap(verify)
    expect(outcome).toEqual({ kind: 'guest' })
    expect(applyWebBootstrapOutcome(outcome).isAuthenticated).toBe(false)
  })

  it('si verify-token responde, sesión queda autenticada', async () => {
    const user = {
      _id: '1',
      correo: 'user@test.com',
      rol: 'funcionario' as const,
      nombre: 'User',
    }
    const verify = vi.fn().mockResolvedValue(user)

    const outcome = await resolveWebAuthBootstrap(verify)

    expect(outcome).toEqual({ kind: 'authenticated', user })
    expect(applyWebBootstrapOutcome(outcome)).toEqual({
      loading: false,
      isAuthenticated: true,
      user,
    })
  })
})
