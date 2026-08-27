import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoriaForm } from './CategoriaForm'

describe('CategoriaForm', () => {
  it('mostra erro de validação para nome e tipo quando ambos estão vazios', async () => {
    const user = userEvent.setup()
    render(
      <CategoriaForm onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar categoria" />,
    )

    await user.click(screen.getByRole('button', { name: /criar categoria/i }))

    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/tipo é obrigatório/i)).toBeInTheDocument()
  })

  it('chama onSubmit com nome e tipo preenchidos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CategoriaForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar categoria" />)

    await user.type(screen.getByLabelText(/^nome$/i), 'Combustível')
    await user.type(screen.getByLabelText(/^tipo$/i), 'Despesa')
    await user.click(screen.getByRole('button', { name: /criar categoria/i }))

    expect(onSubmit.mock.calls[0][0]).toEqual({ nome: 'Combustível', tipo: 'Despesa' })
  })
})
