import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AjusteFinanceiroForm } from './AjusteFinanceiroForm'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { useUsuarioOptions } from '@/shared/hooks/useUsuarioOptions'

vi.mock('@/shared/hooks/useLancamentoOptions', () => ({ useLancamentoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useUsuarioOptions', () => ({ useUsuarioOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useLancamentoOptions).mockReturnValue({
    data: [
      { id: 'l1', tipo: 'Despesa', valor: 5000, vencimento: '2026-08-10', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Pago-Recebido' },
      { id: 'l2', tipo: 'Receita', valor: 5000, vencimento: '2026-08-20', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Aberto' },
      { id: 'l3', tipo: 'Despesa', valor: 100, vencimento: '2026-08-25', situacaoAdministrativa: 'Cancelado', statusFinanceiro: 'Aberto' },
    ],
    isLoading: false,
  } as unknown as ReturnType<typeof useLancamentoOptions>)
  vi.mocked(useUsuarioOptions).mockReturnValue({
    data: [{ id: 'u1', nome: 'João Pedro', identificadorDeAcesso: 'joao', situacaoDeAcesso: 'Ativo' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useUsuarioOptions>)
}

describe('AjusteFinanceiroForm', () => {
  it('exige lançamento original, lançamento de ajuste, tipo, valor, data e usuário', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<AjusteFinanceiroForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /criar ajuste/i }))

    expect(await screen.findByText(/lançamento original é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/lançamento de ajuste é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor deve ser um valor monetário positivo/i)).toBeInTheDocument()
    expect(screen.getByText(/^data é obrigatória$/i)).toBeInTheDocument()
    expect(screen.getByText(/usuário é obrigatório/i)).toBeInTheDocument()
  })

  it('exclui Lançamentos Cancelados das duas seleções', () => {
    setupMocks()
    renderWithQueryClient(<AjusteFinanceiroForm onSubmit={vi.fn()} isSubmitting={false} />)

    const original = screen.getByLabelText(/lançamento original/i)
    const opcoes = Array.from(original.querySelectorAll('option')).map((o) => o.getAttribute('value'))
    expect(opcoes).not.toContain('l3')
    expect(opcoes).toContain('l1')
    expect(opcoes).toContain('l2')
  })

  it('recusa quando original e ajuste são o mesmo Lançamento, sem chamar onSubmit', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<AjusteFinanceiroForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/lançamento original/i), 'l1')
    await user.selectOptions(screen.getByLabelText(/lançamento de ajuste/i), 'l1')
    await user.selectOptions(screen.getByLabelText(/tipo de ajuste/i), 'Estorno')
    await user.type(screen.getByLabelText(/^valor$/i), '500')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-21')
    await user.selectOptions(screen.getByLabelText(/usuário responsável/i), 'u1')
    await user.click(screen.getByRole('button', { name: /criar ajuste/i }))

    expect(await screen.findByText(/deve ser diferente do original/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os valores preenchidos quando original e ajuste são diferentes', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<AjusteFinanceiroForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/lançamento original/i), 'l1')
    await user.selectOptions(screen.getByLabelText(/lançamento de ajuste/i), 'l2')
    await user.selectOptions(screen.getByLabelText(/tipo de ajuste/i), 'Estorno')
    await user.type(screen.getByLabelText(/^valor$/i), '500')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-21')
    await user.selectOptions(screen.getByLabelText(/usuário responsável/i), 'u1')
    await user.type(screen.getByLabelText(/observação/i), 'Devolução parcial')
    await user.click(screen.getByRole('button', { name: /criar ajuste/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      lancamentoOriginalId: 'l1',
      lancamentoAjusteId: 'l2',
      tipoAjuste: 'Estorno',
      valor: 500,
      data: '2026-08-21',
      usuarioId: 'u1',
      observacao: 'Devolução parcial',
    })
  })

  it('pré-seleciona o lançamento original quando informado via defaultLancamentoOriginalId', () => {
    setupMocks()
    renderWithQueryClient(
      <AjusteFinanceiroForm defaultLancamentoOriginalId="l1" onSubmit={vi.fn()} isSubmitting={false} />,
    )

    expect(screen.getByLabelText(/lançamento original/i)).toHaveValue('l1')
  })
})
