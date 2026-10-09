import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '../core/app'
import models from '../core/models'
import { tokenSign } from '../shared/utils/handleJwt'

describe('Auth & RBAC Logic', () => {
  it('debe retornar 401 si no hay token en una ruta protegida', async () => {
    const response = await request(app).get('/api/usuarios/perfil')
    expect(response.status).toBe(401)
    expect(response.body.message ?? response.body.error).toContain('Se requiere autenticación')
  })

  it('debe retornar 403 si un "funcionario" intenta acceder a ruta de "lider"', async () => {
    // 1. Mockear que el usuario existe en la DB
    const dummyUser = {
      _id: '60d0fe4f5311236168a109ca',
      rol: 'funcionario',
      nombre: 'Test User',
      activo: true,
      estado: true,
    }
    
    // Spying on the model method
    const findByIdSpy = vi.spyOn(models.usuarioModel, 'findById')
    findByIdSpy.mockResolvedValue(dummyUser)

    // 2. Generar token para funcionario
    const token = await tokenSign(dummyUser)

    // 3. Intentar acceder a /api/tecnicos/tecnicosPendientes (que requiere lider)
    const response = await request(app)
      .get('/api/tecnicos/tecnicosPendientes')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    findByIdSpy.mockRestore()
  })

  it('debe retornar 401 si el token es invlido o mal formado', async () => {
    const response = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', 'Bearer token-invlido')
    
    expect(response.status).toBe(401)
  })

  it('verify-token acepta Authorization Bearer', async () => {
    const dummyUser = {
      _id: '60d0fe4f5311236168a109ca',
      rol: 'funcionario',
      nombre: 'Test User',
      activo: true,
      estado: true,
    }

    const findOneSpy = vi.spyOn(models.usuarioModel, 'findOne')
    findOneSpy.mockReturnValue({
      select: vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(dummyUser),
      }),
    } as never)

    const token = await tokenSign(dummyUser)
    const response = await request(app)
      .get('/api/auth/verify-token')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.nombre).toBe('Test User')
    findOneSpy.mockRestore()
  })
})

