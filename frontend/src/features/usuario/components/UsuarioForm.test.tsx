import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsuarioForm } from './UsuarioForm'

describe('UsuarioForm', () => {
  it('exige nome e identificador de acesso no modo criar', async () => {
    const user = userEvent.setup()
    render(<UsuarioForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />)

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/identificador de acesso é obrigatório/i)).toBeInTheDocument()
  })

  it('não mostra o campo identificador de acesso no modo editar', () => {
    render(
      <UsuarioForm
        modo="editar"
        defaultValues={{ nome: 'João', identificadorDeAcesso: undefined, situacaoDeAcesso: 'Ativo' }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByLabelText(/identificador de acesso/i)).not.toBeInTheDocument()
  })

  it('envia nome, identificador e situação preenchidos no modo criar', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UsuarioForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />)

    await user.type(screen.getByLabelText(/^nome$/i), 'João Pedro')
    await user.type(screen.getByLabelText(/identificador de acesso/i), 'joao.pedro')
    await user.type(screen.getByLabelText(/situação de acesso/i), 'Ativo')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit.mock.calls[0][0]).toEqual({
      nome: 'João Pedro',
      identificadorDeAcesso: 'joao.pedro',
      situacaoDeAcesso: 'Ativo',
    })
  })
})
