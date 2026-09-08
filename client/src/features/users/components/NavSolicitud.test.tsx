import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavSolicitud from './NavSolicitud'

describe('NavSolicitud', () => {
  it('marca Cola de nuevos como activa en /adminSolicitud', () => {
    render(
      <MemoryRouter initialEntries={['/adminSolicitud']}>
        <NavSolicitud />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Cola de nuevos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Seguimiento' })).not.toHaveAttribute('aria-current')
  })

  it('marca Seguimiento como activa en /seguimiento', () => {
    render(
      <MemoryRouter initialEntries={['/seguimiento']}>
        <NavSolicitud />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Seguimiento' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Cola de nuevos' })).not.toHaveAttribute('aria-current')
  })
})
