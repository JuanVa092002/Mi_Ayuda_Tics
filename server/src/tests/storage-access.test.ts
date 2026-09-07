import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Types } from 'mongoose'
import { actorCanAccessStorage } from '../features/tickets/domain/storage-access'
import HistorialSolicitud from '../features/tickets/models/historialSolicitud'
import Solicitud from '../features/tickets/models/solicitud'
import SolucionCaso from '../features/tickets/models/solucionCaso'
import Usuario from '../features/users/models/usuarios'

const owner = { id: '60d0fe4f5311236168a109bc', rol: 'funcionario' as const }
const other = { id: '60d0fe4f5311236168a109bd', rol: 'funcionario' as const }
const tech = { id: '60d0fe4f5311236168a109bb', rol: 'tecnico' as const }
const otherTech = { id: '60d0fe4f5311236168a109be', rol: 'tecnico' as const }
const lider = { id: '60d0fe4f5311236168a109ba', rol: 'lider' as const }
const storageId = '60d0fe4f5311236168a109af'
const ticketId = new Types.ObjectId('60d0fe4f5311236168a109aa')

function mockNoLinks() {
  vi.spyOn(Usuario, 'exists').mockResolvedValue(null)
  vi.spyOn(HistorialSolicitud, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
  } as never)
  vi.spyOn(SolucionCaso, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
  } as never)
  vi.spyOn(Solicitud, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
  } as never)
}

function mockLinkedTicket(ticket: { usuario?: unknown; tecnico?: unknown }, via: 'foto' | 'historial' | 'solucion') {
  vi.spyOn(Usuario, 'exists').mockResolvedValue(null)
  vi.spyOn(HistorialSolicitud, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(via === 'historial' ? { solicitud: ticketId } : null),
    }),
  } as never)
  vi.spyOn(SolucionCaso, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(via === 'solucion' ? { solicitud: ticketId } : null),
    }),
  } as never)
  vi.spyOn(Solicitud, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(ticket),
    }),
  } as never)
}

describe('actorCanAccessStorage — matriz G3', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('ObjectId válido no concede acceso por sí mismo', async () => {
    mockNoLinks()
    expect(await actorCanAccessStorage(lider, storageId, 'file.png')).toBe(false)
    expect(await actorCanAccessStorage(owner, storageId, 'file.png')).toBe(false)
    expect(await actorCanAccessStorage(tech, storageId, 'file.png')).toBe(false)
  })

  it('id inválido no concede acceso', async () => {
    expect(await actorCanAccessStorage(lider, 'not-an-id', 'file.png')).toBe(false)
  })

  it('matriz de foto/evidencia del ticket vinculado', async () => {
    mockLinkedTicket({ usuario: owner.id, tecnico: tech.id }, 'historial')
    expect(await actorCanAccessStorage(owner, storageId, 'evidencia.png')).toBe(true)
    expect(await actorCanAccessStorage(tech, storageId, 'evidencia.png')).toBe(true)
    expect(await actorCanAccessStorage(lider, storageId, 'evidencia.png')).toBe(true)
    expect(await actorCanAccessStorage(otherTech, storageId, 'evidencia.png')).toBe(false)
    expect(await actorCanAccessStorage(other, storageId, 'evidencia.png')).toBe(false)
  })

  it('adjunto legacy SolucionCaso respeta la misma matriz', async () => {
    mockLinkedTicket({ usuario: owner.id, tecnico: tech.id }, 'solucion')
    expect(await actorCanAccessStorage(owner, storageId, 'legacy.png')).toBe(true)
    expect(await actorCanAccessStorage(tech, storageId, 'legacy.png')).toBe(true)
    expect(await actorCanAccessStorage(lider, storageId, 'legacy.png')).toBe(true)
    expect(await actorCanAccessStorage(other, storageId, 'legacy.png')).toBe(false)
    expect(await actorCanAccessStorage(otherTech, storageId, 'legacy.png')).toBe(false)
  })

  it('foto del ticket (solicitud.foto) respeta la misma matriz', async () => {
    mockLinkedTicket({ usuario: owner.id, tecnico: tech.id }, 'foto')
    expect(await actorCanAccessStorage(owner, storageId, 'ticket.jpg')).toBe(true)
    expect(await actorCanAccessStorage(other, storageId, 'ticket.jpg')).toBe(false)
  })

  it('permite el avatar propio aunque no esté ligado a un ticket', async () => {
    mockNoLinks()
    vi.spyOn(Usuario, 'exists').mockImplementation(async (filter: { _id?: unknown }) => {
      return String(filter._id) === owner.id ? ({ _id: owner.id } as never) : null
    })
    expect(await actorCanAccessStorage(owner, storageId, 'avatar.png')).toBe(true)
    expect(await actorCanAccessStorage(other, storageId, 'avatar.png')).toBe(false)
  })

  it('permite el avatar por defecto autenticado', async () => {
    expect(await actorCanAccessStorage(owner, storageId, 'usuario-undefined.png')).toBe(true)
  })
})
