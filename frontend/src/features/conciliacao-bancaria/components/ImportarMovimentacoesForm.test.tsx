import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ImportarMovimentacoesForm } from './ImportarMovimentacoesForm'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
}

describe('ImportarMovimentacoesForm', () => {
  it('exige conta bancária e ao menos um item com data e descrição', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<ImportarMovimentacoesForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /importar movimentações/i }))

    expect(await screen.findByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/data é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument()
  })

  it('permite adicionar e remover itens, nunca ficando com zero', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<ImportarMovimentacoesForm onSubmit={vi.fn()} isSubmitting={false} />)

    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(1)
    expect(screen.getByRole('button', { name: /remover/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /adicionar item/i }))

    const removerButtons = screen.getAllByRole('button', { name: /remover/i })
    expect(removerButtons).toHaveLength(2)
    expect(removerButtons[0]).not.toBeDisabled()

    await user.click(removerButtons[0])

    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(1)
  })

  it('envia contaBancariaId e os itens preenchidos, com valor negativo permitido (saída)', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<ImportarMovimentacoesForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/conta bancária/i), 'cb1')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-10')
    await user.type(screen.getByLabelText(/^descrição$/i), 'Pagamento fornecedor X')
    await user.type(screen.getByLabelText(/^valor$/i), '-350.50')
    await user.click(screen.getByRole('button', { name: /importar movimentações/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      contaBancariaId: 'cb1',
      itens: [{ data: '2026-08-10', descricao: 'Pagamento fornecedor X', valor: -350.5 }],
    })
  })
})
