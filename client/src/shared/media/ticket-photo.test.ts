import { describe, expect, it, vi } from 'vitest'
import {
  authenticatedMediaUrl,
  fetchAuthenticatedTicketPhoto,
  resolveTicketPhotoSource,
} from './ticket-photo'

describe('resolveTicketPhotoSource', () => {
  it('sin foto o placeholder no muestra miniatura', () => {
    expect(resolveTicketPhotoSource(undefined)).toEqual({ kind: 'none' })
    expect(resolveTicketPhotoSource({ url: '' })).toEqual({ kind: 'none' })
    expect(resolveTicketPhotoSource({ url: 'https://cdn.example/usuario-undefined.png' })).toEqual({
      kind: 'none',
    })
  })

  it('Cloudinary se usa como URL pública', () => {
    const url = 'https://res.cloudinary.com/miayudatics/image/upload/v1/evidencias/file-1.jpg'
    expect(resolveTicketPhotoSource({ url })).toEqual({ kind: 'public', url })
  })

  it('media local se pide autenticada aunque el registro traiga localhost', () => {
    expect(
      resolveTicketPhotoSource({
        url: 'http://127.0.0.1:8000/api/media/local/file-1710000000000.jpg',
      }),
    ).toEqual({ kind: 'authenticated', path: '/media/local/file-1710000000000.jpg' })
    expect(
      resolveTicketPhotoSource({
        url: 'https://miayudatics-v1-0.onrender.com/api/media/local/file-abc.png',
      }),
    ).toEqual({ kind: 'authenticated', path: '/media/local/file-abc.png' })
  })

  it('rechaza un localhost que no es media del ticket', () => {
    expect(resolveTicketPhotoSource('http://127.0.0.1:8000/foto.png')).toEqual({ kind: 'none' })
  })
})

describe('fetchAuthenticatedTicketPhoto', () => {
  it('arma la URL contra el API base y pide la imagen con credentials', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    })
    vi.stubGlobal('fetch', fetchMock)
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:ticket-photo')

    await expect(fetchAuthenticatedTicketPhoto('/media/local/file-1.jpg')).resolves.toBe(
      'blob:ticket-photo',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/media/local/file-1.jpg'),
      expect.objectContaining({ credentials: 'include' }),
    )
    createObjectURL.mockRestore()
    vi.unstubAllGlobals()
  })

  it('authenticatedMediaUrl concatena el API base', () => {
    expect(authenticatedMediaUrl('/media/local/file-1.jpg', 'https://api.example/api')).toBe(
      'https://api.example/api/media/local/file-1.jpg',
    )
  })
})
