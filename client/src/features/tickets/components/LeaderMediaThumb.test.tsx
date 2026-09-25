import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LeaderMediaThumb from './LeaderMediaThumb'

describe('LeaderMediaThumb', () => {
  it('muestra el icono vacío cuando el ticket no tiene foto', () => {
    render(<LeaderMediaThumb />)
    expect(screen.getByLabelText('Sin evidencia')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('previsualiza la imagen pública y abre el visor', () => {
    const url = 'https://res.cloudinary.com/miayudatics/image/upload/v1/evidencias/file-1.jpg'
    render(<LeaderMediaThumb foto={{ url }} />)

    const preview = screen.getByRole('img', { name: 'Evidencia del caso' })
    expect(preview).toHaveAttribute('src', url)

    fireEvent.click(screen.getByRole('button', { name: 'Ver evidencia' }))
    expect(screen.getByRole('dialog', { name: 'Evidencia del caso' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'Evidencia del caso' })).toHaveLength(2)
  })
})
