import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import BrandWordmark from './BrandWordmark'

describe('BrandWordmark', () => {
  it('renderiza MIAYUDATIC con segmentos institucionales', () => {
    render(<BrandWordmark />)
    expect(screen.getByLabelText('MIAYUDATIC')).toBeInTheDocument()
    expect(screen.getByText('MI')).toHaveClass('text-azul-sena')
    expect(screen.getByText('AYUDA')).toHaveClass('text-verde-sena')
    expect(screen.getByText('TICS')).toHaveClass('text-azul-sena')
  })
})
