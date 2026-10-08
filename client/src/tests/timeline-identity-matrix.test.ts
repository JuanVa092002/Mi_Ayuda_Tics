import { describe, it, expect } from 'vitest'
import {
  resolveTimelineActor,
  normalizeId,
} from '@/features/tickets/utils/timeline-identity'
import type { Solicitud, SolicitudHistorialEvent, User } from '@/shared/types'

describe('Timeline Identity Matrix & Cross-Role Invariants', () => {
  const mockSolicitud: Solicitud = {
    _id: 'caso-uuid-100',
    codigoCaso: '2026-10-00100',
    descripcion: 'Pantalla no enciende en aula 101',
    estado: 'en_progreso',
    fecha: '2026-10-06T10:00:00.000Z',
    usuario: {
      _id: 'user-juan-id',
      nombre: 'Juan Perez',
      correo: 'juan@sena.edu.co',
      rol: 'funcionario',
    },
    tecnico: {
      _id: 'user-rafael-id',
      nombre: 'Rafael Pastas',
      correo: 'rafael@sena.edu.co',
      rol: 'tecnico',
    },
    historial: [],
  }

  const requesterReplyEvent: SolicitudHistorialEvent = {
    _id: 'evt-reply-1',
    type: 'requester_reply',
    message: 'Si me encuentro en el Aula. Esperandolos',
    createdAt: '2026-10-06T10:30:00.000Z',
    author: {
      _id: 'user-juan-id',
      nombre: 'Juan Perez',
      rol: 'funcionario',
    },
  }

  const technicianNoteEvent: SolicitudHistorialEvent = {
    _id: 'evt-note-1',
    type: 'note_added',
    message: 'Se reemplazó cable HDMI dañado por nuevo cable certificado.',
    createdAt: '2026-10-06T10:35:00.000Z',
    author: {
      _id: 'user-rafael-id',
      nombre: 'Rafael Pastas',
      rol: 'tecnico',
    },
  }

  const technicianQuestionEvent: SolicitudHistorialEvent = {
    _id: 'evt-quest-1',
    type: 'waiting_for_requester',
    message: '¿Te encuentras en la oficina/aula para darnos acceso físico al equipo?',
    createdAt: '2026-10-06T10:20:00.000Z',
    author: {
      _id: 'user-rafael-id',
      nombre: 'Rafael Pastas',
      rol: 'tecnico',
    },
  }

  const mesaAssignmentEvent: SolicitudHistorialEvent = {
    _id: 'evt-assign-1',
    type: 'assigned',
    message: 'Se asignó al técnico especialista Rafael Pastas.',
    createdAt: '2026-10-06T10:05:00.000Z',
    author: {
      _id: 'user-lider-id',
      nombre: 'Carlos Coordinador',
      rol: 'lider',
    },
  }

  describe('INVARIANTE 1 & 4: El autor del evento es inmutable independientemente del observador', () => {
    it('Perspectiva Funcionario Juan Perez (Solicitante observando)', () => {
      const viewer: User = { _id: 'user-juan-id', nombre: 'Juan Perez', correo: 'juan@sena.edu.co', rol: 'funcionario' }

      // 1. Su propia respuesta
      const resReply = resolveTimelineActor({ event: requesterReplyEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resReply.isCurrentUser).toBe(true)
      expect(resReply.isRequesterParty).toBe(true)
      expect(resReply.party).toBe('mine')
      expect(resReply.partyLabel).toBe('Tú (Solicitante)')
      expect(resReply.authorDisplayName).toBe('Juan Perez')
      expect(resReply.eventTitle).toBe('Respuesta del Funcionario')
      expect(resReply.badgeStyle.containerClasses).toContain('bg-emerald-600')

      // 2. La consulta del técnico
      const resQuestion = resolveTimelineActor({ event: technicianQuestionEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resQuestion.isCurrentUser).toBe(false)
      expect(resQuestion.isRequesterParty).toBe(false)
      expect(resQuestion.party).toBe('tecnico')
      expect(resQuestion.partyLabel).toBe('Técnico Asignado')
      expect(resQuestion.authorDisplayName).toBe('Rafael Pastas')
      expect(resQuestion.eventTitle).toBe('Información Adicional Requerida')

      // 3. La asignación de Mesa TIC
      const resAssign = resolveTimelineActor({ event: mesaAssignmentEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resAssign.isCurrentUser).toBe(false)
      expect(resAssign.party).toBe('mesa')
      expect(resAssign.partyLabel).toBe('Mesa TIC')
    })

    it('Perspectiva Técnico Rafael Pastas (Técnico asignado observando)', () => {
      const viewer: User = { _id: 'user-rafael-id', nombre: 'Rafael Pastas', correo: 'rafael@sena.edu.co', rol: 'tecnico' }

      // 1. La respuesta del funcionario
      const resReply = resolveTimelineActor({ event: requesterReplyEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resReply.isCurrentUser).toBe(false)
      expect(resReply.isRequesterParty).toBe(true)
      expect(resReply.party).toBe('mine')
      expect(resReply.partyLabel).toBe('Parte Solicitante')
      expect(resReply.authorDisplayName).toBe('Juan Perez')
      expect(resReply.eventTitle).toBe('Respuesta del Funcionario')

      // 2. Su propia bitácora
      const resNote = resolveTimelineActor({ event: technicianNoteEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resNote.isCurrentUser).toBe(true)
      expect(resNote.isRequesterParty).toBe(false)
      expect(resNote.party).toBe('tecnico')
      expect(resNote.partyLabel).toBe('Tú (Técnico Asignado)')
      expect(resNote.authorDisplayName).toBe('Rafael Pastas')
      expect(resNote.eventTitle).toBe('Nota en Bitácora Técnica')
    })

    it('Perspectiva Mesa TIC / Líder (Observador neutral)', () => {
      const viewer: User = { _id: 'user-lider-id', nombre: 'Carlos Coordinador', correo: 'carlos@sena.edu.co', rol: 'lider' }

      // 1. La respuesta del funcionario JAMÁS debe salir como Mesa TIC
      const resReply = resolveTimelineActor({ event: requesterReplyEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resReply.isCurrentUser).toBe(false)
      expect(resReply.isRequesterParty).toBe(true)
      expect(resReply.party).toBe('mine')
      expect(resReply.partyLabel).toBe('Parte Solicitante')
      expect(resReply.authorDisplayName).toBe('Juan Perez')

      // 2. La bitácora del técnico JAMÁS debe salir como Mesa TIC
      const resNote = resolveTimelineActor({ event: technicianNoteEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resNote.isCurrentUser).toBe(false)
      expect(resNote.party).toBe('tecnico')
      expect(resNote.partyLabel).toBe('Técnico Asignado')
      expect(resNote.authorDisplayName).toBe('Rafael Pastas')

      // 3. Su propia asignación
      const resAssign = resolveTimelineActor({ event: mesaAssignmentEvent, solicitud: mockSolicitud, currentUser: viewer })
      expect(resAssign.isCurrentUser).toBe(true)
      expect(resAssign.party).toBe('mesa')
      expect(resAssign.partyLabel).toBe('Tú (Mesa TIC)')
    })
  })

  describe('INVARIANTE 3: El caseRole prevalece sobre el rol organizacional genérico', () => {
    it('Si un usuario con rol organizacional de Mesa TIC/Admin es el solicitante del caso, debe resolverse como Solicitante', () => {
      // Caso donde un funcionario de mesa TIC radica una solicitud personal para reparar su equipo
      const caseWithMesaRequester: Solicitud = {
        ...mockSolicitud,
        usuario: {
          _id: 'user-admin-personal',
          nombre: 'María Administradora',
          correo: 'maria@sena.edu.co',
          rol: 'lider', // Rol organizacional alto (Mesa TIC / Líder)
        },
      }

      const personalReplyEvent: SolicitudHistorialEvent = {
        _id: 'evt-maria-1',
        type: 'requester_reply',
        message: 'El teclado sigue bloqueado',
        createdAt: '2026-10-06T11:00:00.000Z',
        author: {
          _id: 'user-admin-personal',
          nombre: 'María Administradora',
          rol: 'lider',
        },
      }

      // Visto por María misma
      const resAsMaria = resolveTimelineActor({
        event: personalReplyEvent,
        solicitud: caseWithMesaRequester,
        currentUser: {
          _id: 'user-admin-personal',
          nombre: 'María Administradora',
          correo: 'maria@sena.edu.co',
          rol: 'lider',
        },
      })
      expect(resAsMaria.isCurrentUser).toBe(true)
      expect(resAsMaria.isRequesterParty).toBe(true)
      expect(resAsMaria.party).toBe('mine')
      expect(resAsMaria.partyLabel).toBe('Tú (Solicitante)')
      expect(resAsMaria.authorRole).toBe('Funcionario Solicitante')

      // Visto por el técnico
      const resAsTech = resolveTimelineActor({
        event: personalReplyEvent,
        solicitud: caseWithMesaRequester,
        currentUser: {
          _id: 'user-rafael-id',
          nombre: 'Rafael Pastas',
          correo: 'rafael@sena.edu.co',
          rol: 'tecnico',
        },
      })
      expect(resAsTech.isRequesterParty).toBe(true)
      expect(resAsTech.partyLabel).toBe('Parte Solicitante')
    })
  })

  describe('Edge cases de normalización de identificadores (ObjectId, string, anidado)', () => {
    it('Normaliza correctamente IDs string, ObjectId y objetos { _id } o { id }', () => {
      expect(normalizeId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011')
      expect(normalizeId({ _id: '507f1f77bcf86cd799439011' })).toBe('507f1f77bcf86cd799439011')
      expect(normalizeId({ id: '507f1f77bcf86cd799439011' })).toBe('507f1f77bcf86cd799439011')
      expect(normalizeId(null)).toBe('')
      expect(normalizeId(undefined)).toBe('')
    })

    it('BLINDAJE ANTE PAYLOADS LEGADOS: author solo contiene { nombre: "Juan Perez" } y type="updated" sin ID confiable -> UNKNOWN', () => {
      // Regla de Oro: Si no hay ID ni relación confiable en el backend/contrato, el sistema NO debe adivinar
      // por nombre 'Juan Perez' ni asignar Mesa TIC por descarte. Debe clasificarlo como UNKNOWN / Histórico no clasificado.
      const legacyDegradedEvent: SolicitudHistorialEvent = {
        _id: 'evt-legacy-1',
        type: 'updated',
        message: 'Si me encuentro actualmente en el Aula',
        createdAt: '2026-10-06T06:30:52.398Z',
        author: {
          nombre: 'Juan Perez', // Sin _id ni rol
        } as any,
      }

      // Observador Juan Perez
      const resJuan = resolveTimelineActor({
        event: legacyDegradedEvent,
        solicitud: mockSolicitud,
        currentUser: {
          _id: 'user-juan-id',
          nombre: 'Juan Perez',
          correo: 'juan@sena.edu.co',
          rol: 'funcionario',
        },
      })
      // Determinismo absoluto: No inventa identidad basándose en el nombre de pila
      expect(resJuan.caseRole).toBe('UNKNOWN')
      expect(resJuan.party).toBe('unknown')
      expect(resJuan.partyLabel).toBe('Evento No Clasificado')
      expect(resJuan.authorRole).toBe('Registro Histórico')
      expect(resJuan.eventTitle).toBe('Actualización Histórica')

      // Observador Técnico Rafael Pastas
      const resRafael = resolveTimelineActor({
        event: legacyDegradedEvent,
        solicitud: mockSolicitud,
        currentUser: {
          _id: 'user-rafael-id',
          nombre: 'Rafael Pastas',
          correo: 'rafael@sena.edu.co',
          rol: 'tecnico',
        },
      })
      expect(resRafael.caseRole).toBe('UNKNOWN')
      expect(resRafael.party).toBe('unknown')
      expect(resRafael.partyLabel).toBe('Evento No Clasificado')
    })

    it('NOMBRES DUPLICADOS Y SIMILARES: Usuarios con mismo nombre o nombres parecidos pero IDs distintos jamás se confunden', () => {
      // Caso 1: Dos usuarios llamados exactamente "Juan Perez" pero con IDs distintos en casos distintos
      const casoJuan1: Solicitud = {
        ...mockSolicitud,
        _id: 'caso-juan-1',
        usuario: { _id: 'id-juan-1', nombre: 'Juan Perez', correo: 'juan1@sena.edu.co', rol: 'funcionario' },
      }


      // Evento emitido por Juan Perez #1
      const eventoJuan1: SolicitudHistorialEvent = {
        _id: 'evt-juan-1',
        type: 'requester_reply',
        caseRole: 'SOLICITANTE',
        author: { _id: 'id-juan-1', nombre: 'Juan Perez', rol: 'funcionario' },
        message: 'Respuesta de Juan Perez #1',
      }

      // Si Juan Perez #2 visualiza el caso 1, debe verse como Parte Solicitante ajena (NO "Tú")
      const resJuan2ViendoCaso1 = resolveTimelineActor({
        event: eventoJuan1,
        solicitud: casoJuan1,
        currentUser: { _id: 'id-juan-2', nombre: 'Juan Perez', correo: 'juan2@sena.edu.co', rol: 'funcionario' },
      })
      expect(resJuan2ViendoCaso1.isCurrentUser).toBe(false)
      expect(resJuan2ViendoCaso1.party).toBe('mine')
      expect(resJuan2ViendoCaso1.partyLabel).toBe('Parte Solicitante')

      // Si Juan Perez #1 visualiza su caso 1, debe verse como Tú (Solicitante)
      const resJuan1ViendoCaso1 = resolveTimelineActor({
        event: eventoJuan1,
        solicitud: casoJuan1,
        currentUser: { _id: 'id-juan-1', nombre: 'Juan Perez', correo: 'juan1@sena.edu.co', rol: 'funcionario' },
      })
      expect(resJuan1ViendoCaso1.isCurrentUser).toBe(true)
      expect(resJuan1ViendoCaso1.partyLabel).toBe('Tú (Solicitante)')

      // Nombres parecidos: "Juan Perez" vs "Juan Perez López" vs "Juan"
      const casoJuanLopez: Solicitud = {
        ...mockSolicitud,
        usuario: { _id: 'id-juan-lopez', nombre: 'Juan Perez López', correo: 'jlopez@sena.edu.co', rol: 'funcionario' },
      }
      const eventoJuanLopez: SolicitudHistorialEvent = {
        _id: 'evt-lopez',
        type: 'requester_reply',
        caseRole: 'SOLICITANTE',
        author: { _id: 'id-juan-lopez', nombre: 'Juan Perez López', rol: 'funcionario' },
        message: 'Respuesta con ID inequívoco',
      }
      const resJuanPerezViendoLopez = resolveTimelineActor({
        event: eventoJuanLopez,
        solicitud: casoJuanLopez,
        currentUser: { _id: 'id-juan-1', nombre: 'Juan Perez', correo: 'juan@sena.edu.co', rol: 'funcionario' },
      })
      expect(resJuanPerezViendoLopez.isCurrentUser).toBe(false)
      expect(resJuanPerezViendoLopez.partyLabel).toBe('Parte Solicitante')
    })

    it('PROHIBICIÓN DE FALLBACK SILENCIOSO: Evento con actor totalmente desconocido nunca cae a Mesa TIC', () => {
      const unknownEvent: SolicitudHistorialEvent = {
        _id: 'evt-ghost-1',
        type: 'updated',
        message: 'Cambio de sistema sin metadata de autor',
      }

      const res = resolveTimelineActor({
        event: unknownEvent,
        solicitud: mockSolicitud,
        currentUser: { _id: 'user-juan-id', nombre: 'Juan Perez', correo: 'juan@sena.edu.co', rol: 'funcionario' },
      })

      expect(res.caseRole).toBe('UNKNOWN')
      expect(res.party).toBe('unknown')
      expect(res.partyLabel).not.toBe('Mesa TIC')
      expect(res.partyLabel).not.toBe('Tú (Mesa TIC)')
      expect(res.partyLabel).toBe('Evento No Clasificado')
    })
  })
})
