import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NomeUnicoForm } from './NomeUnicoForm'

describe('NomeUnicoForm', () => {
  it('mostra erro de validação ao tentar enviar sem preencher o nome', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<NomeUnicoForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />)

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('chama onSubmit com os valores preenchidos quando o formulário é válido', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<NomeUnicoForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />)

    await user.type(screen.getByLabelText(/nome/i), 'H Vieira Terraplanagem')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({ nome: 'H Vieira Terraplanagem' })
  })

  it('reflete erro de campo vindo do backend', async () => {
    render(
      <NomeUnicoForm
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Criar"
        serverFieldErrors={[{ field: 'nome', message: 'nome já cadastrado' }]}
      />,
    )

    expect(await screen.findByText(/nome já cadastrado/i)).toBeInTheDocument()
  })

  it('desabilita o botão de envio enquanto está salvando', () => {
    render(<NomeUnicoForm onSubmit={vi.fn()} isSubmitting submitLabel="Criar" />)

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
  })
})
