import { describe, expect, it } from 'vitest'
import { resolveUserPhotoUrl, userInitials } from './user-photo'

describe('resolveUserPhotoUrl', () => {
  it('usuario sin foto no genera URL', () => {
    expect(resolveUserPhotoUrl(undefined)).toBeUndefined()
    expect(resolveUserPhotoUrl('')).toBeUndefined()
  })

  it('conserva una URL de producción https', () => {
    const url = 'https://res.cloudinary.com/miayudatics/image/upload/lider.jpg'
    expect(resolveUserPhotoUrl({ url })).toBe(url)
    expect(resolveUserPhotoUrl(url)).toBe(url)
  })

  it('no usa localhost ni usuario-undefined', () => {
    expect(resolveUserPhotoUrl('http://localhost:8000/usuario-undefined.png')).toBeUndefined()
    expect(resolveUserPhotoUrl({ url: 'http://localhost:8000/usuario-undefined.png' })).toBeUndefined()
    expect(resolveUserPhotoUrl('http://127.0.0.1:8000/foto.png')).toBeUndefined()
    expect(resolveUserPhotoUrl('https://cdn.example/usuario-undefined.png')).toBeUndefined()
  })

  it('iniciales locales sin red', () => {
    expect(userInitials('Administrador Lider TIC')).toBe('AL')
    expect(userInitials(undefined)).toBe('U')
  })
})
