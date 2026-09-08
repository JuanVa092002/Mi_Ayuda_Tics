import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LeaderNav from './LeaderNav'

describe('LeaderNav', () => {
  it('marca Cola de nuevos como activa en /adminSolicitud', () => {
    render(
      <MemoryRouter initialEntries={['/adminSolicitud']}>
        <LeaderNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Cola de nuevos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Seguimiento' })).not.toHaveAttribute('aria-current')
  })

  it('marca Seguimiento como activa en /seguimiento', () => {
    render(
      <MemoryRouter initialEntries={['/seguimiento']}>
        <LeaderNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Seguimiento' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Cola de nuevos' })).not.toHaveAttribute('aria-current')
  })
})
