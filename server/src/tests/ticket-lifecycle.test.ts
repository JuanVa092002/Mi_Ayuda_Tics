import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '../core/app'
import models from '../core/models'
import { tokenSign } from '../shared/utils/handleJwt'

const liderUser = {
  _id: '60d0fe4f5311236168a109cb',
  rol: 'lider',
  nombre: 'Lider',
  activo: true,
  estado: true,
}

const tecnicoUser = {
  _id: '60d0fe4f5311236168a109cc',
  rol: 'tecnico',
  nombre: 'Tecnico',
  activo: true,
  estado: true,
}

describe('Ticket lifecycle — state guards', () => {
  it('asignar técnico rechaza solicitud no solicitado (409)', async () => {
    const findByIdSpy = vi.spyOn(models.usuarioModel, 'findById')
    findByIdSpy.mockResolvedValue(liderUser as never)

    const findOneSpy = vi.spyOn(models.usuarioModel, 'findOne')
    findOneSpy.mockResolvedValue(tecnicoUser as never)

    vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
      _id: 'sol1',
      estado: 'finalizado',
    } as never)

    const token = await tokenSign(liderUser)
    const response = await request(app)
      .put('/api/solicitud/sol1/asignarTecnico')
      .set('Authorization', `Bearer ${token}`)
      .send({ tecnico: tecnicoUser._id })

    expect(response.status).toBe(409)
    findByIdSpy.mockRestore()
    findOneSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('solucionCaso rechaza solicitud ya finalizada (409)', async () => {
    const findByIdSpy = vi.spyOn(models.usuarioModel, 'findById')
    findByIdSpy.mockResolvedValue(tecnicoUser as never)

    vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
      _id: 'sol1',
      estado: 'finalizado',
      tecnico: tecnicoUser._id,
      solucion: 'existing',
    } as never)

    const token = await tokenSign(tecnicoUser)
    const response = await request(app)
      .post('/api/solucionCaso/sol1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipoSolucion: 'finalizado',
        descripcionSolucion: 'Listo',
        tipoCaso: '60d0fe4f5311236168a109cd',
      })

    expect(response.status).toBe(409)
    findByIdSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('solucionCaso rechaza estado solicitado (409)', async () => {
    const findByIdSpy = vi.spyOn(models.usuarioModel, 'findById')
    findByIdSpy.mockResolvedValue(tecnicoUser as never)

    vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
      _id: 'sol1',
      estado: 'solicitado',
      tecnico: tecnicoUser._id,
    } as never)

    const token = await tokenSign(tecnicoUser)
    const response = await request(app)
      .post('/api/solucionCaso/sol1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipoSolucion: 'finalizado',
        descripcionSolucion: 'Listo',
        tipoCaso: '60d0fe4f5311236168a109cd',
      })

    expect(response.status).toBe(409)
    findByIdSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('solucionCaso rechaza tickets workflow v2 (409)', async () => {
    const findByIdSpy = vi.spyOn(models.usuarioModel, 'findById')
    findByIdSpy.mockResolvedValue(tecnicoUser as never)

    vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
      _id: 'sol1',
      estado: 'en_progreso',
      workflowVersion: 2,
      tecnico: tecnicoUser._id,
    } as never)

    const token = await tokenSign(tecnicoUser)
    const response = await request(app)
      .post('/api/solucionCaso/sol1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipoSolucion: 'finalizado',
        descripcionSolucion: 'Listo',
        tipoCaso: '60d0fe4f5311236168a109cd',
      })

    expect(response.status).toBe(409)
    findByIdSpy.mockRestore()
    vi.restoreAllMocks()
  })
})
