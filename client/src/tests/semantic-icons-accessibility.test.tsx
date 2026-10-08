import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SemanticIcon, StatusBadge, InlineAlert, FeedbackBanner } from '@/shared/ui'

describe('Enterprise UI System & Iconography Tests', () => {
  it('renders SemanticIcon correctly with semantic Material Symbol mapping and aria attributes', () => {
    const { container } = render(<SemanticIcon name="ticket" ariaLabel="Ticket de soporte" />)
    const icon = screen.getByLabelText('Ticket de soporte')
    expect(icon).toBeDefined()
    expect(icon.getAttribute('role')).toBe('img')
    expect(container.textContent).toContain('description')
  })

  it('renders StatusBadge with tone and semantic status icon', () => {
    const { rerender } = render(<StatusBadge status="en_progreso" />)
    expect(screen.getByText('En progreso')).toBeDefined()

    rerender(<StatusBadge status="resuelto" />)
    expect(screen.getByText('Resuelto')).toBeDefined()
  })

  it('renders InlineAlert with polite aria-live by default and assistive role', () => {
    render(
      <InlineAlert tone="info" title="Acompañamiento Activo">
        Tu solicitud ha sido recibida por la Mesa de Ayuda TIC.
      </InlineAlert>
    )

    const alert = screen.getByRole('status')
    expect(alert).toBeDefined()
    expect(alert.getAttribute('aria-live')).toBe('polite')
    expect(screen.getByText('Acompañamiento Activo')).toBeDefined()
  })

  it('renders FeedbackBanner with appropriate styling and dismiss button', () => {
    render(<FeedbackBanner tone="success" message="Asignación exitosa" subMessage="Técnico notificado" onClose={() => {}} />)
    expect(screen.getByText('Asignación exitosa')).toBeDefined()
    expect(screen.getByText('Técnico notificado')).toBeDefined()
    expect(screen.getByRole('button', { name: /cerrar notificación/i })).toBeDefined()
  })
})
