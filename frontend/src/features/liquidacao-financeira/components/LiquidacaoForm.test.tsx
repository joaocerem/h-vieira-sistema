import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LiquidacaoForm } from './LiquidacaoForm'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useLancamentoOptions', () => ({ useLancamentoOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useLancamentoOptions).mockReturnValue({
    data: [
      {
        id: 'l1',
        tipo: 'Despesa',
        valor: 100,
        vencimento: '2026-08-10',
        situacaoAdministrativa: 'Ativo',
        statusFinanceiro: 'Aberto',
      },
    ],
    isLoading: false,
  } as unknown as ReturnType<typeof useLancamentoOptions>)
}

describe('LiquidacaoForm', () => {
  it('exige tipo, data, valor, conta bancária e ao menos um lançamento coberto', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<LiquidacaoForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /criar liquidação/i }))

    expect(await screen.findByText(/data efetiva é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/^valor deve ser um valor monetário positivo$/i)).toBeInTheDocument()
    expect(screen.getByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/lançamento é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor aplicado deve ser um valor monetário positivo/i)).toBeInTheDocument()
  })

  it('permite adicionar e remover linhas de aplicação, nunca ficando com zero', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<LiquidacaoForm onSubmit={vi.fn()} isSubmitting={false} />)

    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(1)
    expect(screen.getByRole('button', { name: /remover/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /adicionar lançamento/i }))

    const removerButtons = screen.getAllByRole('button', { name: /remover/i })
    expect(removerButtons).toHaveLength(2)
    expect(removerButtons[0]).not.toBeDisabled()

    await user.click(removerButtons[0])

    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(1)
  })

  it('envia os valores preenchidos, incluindo a lista de aplicações', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<LiquidacaoForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.type(screen.getByLabelText(/data efetiva/i), '2026-08-15')
    await user.type(screen.getByLabelText(/valor total/i), '100')
    await user.selectOptions(screen.getByLabelText(/conta bancária/i), 'cb1')
    await user.selectOptions(screen.getByLabelText(/lançamento/i), 'l1')
    await user.type(screen.getByLabelText(/valor aplicado/i), '100')
    await user.click(screen.getByRole('button', { name: /criar liquidação/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      tipo: 'Pagamento',
      dataEfetiva: '2026-08-15',
      valor: 100,
      contaBancariaId: 'cb1',
      aplicacoes: [{ lancamentoFinanceiroId: 'l1', valorAplicado: 100 }],
    })
  })
})
