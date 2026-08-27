import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MovimentacaoListPage } from './MovimentacaoListPage'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useLiquidacaoOptions } from '@/shared/hooks/useLiquidacaoOptions'

vi.mock('../api/movimentacaoBancariaApi', () => ({
  movimentacaoBancariaApi: { listar: vi.fn(), reclassificar: vi.fn() },
}))
vi.mock('../api/vinculoConciliacaoApi', () => ({
  vinculoConciliacaoApi: {
    listar: vi.fn(),
    confirmar: vi.fn(),
    marcarDivergente: vi.fn(),
    marcarSemCorrespondencia: vi.fn(),
    vincularManualmente: vi.fn(),
    rodarSugestaoAutomatica: vi.fn(),
  },
}))
vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useLiquidacaoOptions', () => ({ useLiquidacaoOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function setupMocks() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useLiquidacaoOptions).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useLiquidacaoOptions>)
}

describe('MovimentacaoListPage', () => {
  it('lista as movimentações com o estado de conciliação de cada uma', async () => {
    setupMocks()
    vi.mocked(movimentacaoBancariaApi.listar).mockResolvedValueOnce([
      {
        id: 'm1',
        contaBancariaId: 'cb1',
        data: '2026-08-01',
        descricao: 'Pagamento fornecedor X',
        valor: -500,
        classificacao: 'Não Classificada',
      },
    ])
    vi.mocked(vinculoConciliacaoApi.listar).mockResolvedValueOnce([
      { id: 'v1', movimentacaoBancariaId: 'm1', liquidacaoFinanceiraId: 'l1', estadoConciliacao: 'Sugerido' },
    ])

    renderWithProviders(<MovimentacaoListPage />)

    expect(await screen.findByText('Pagamento fornecedor X')).toBeInTheDocument()
    expect(screen.getByText('Sugerido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^confirmar$/i })).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há movimentações', async () => {
    setupMocks()
    vi.mocked(movimentacaoBancariaApi.listar).mockResolvedValueOnce([])
    vi.mocked(vinculoConciliacaoApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<MovimentacaoListPage />)

    expect(await screen.findByText(/nenhuma movimentação importada ainda/i)).toBeInTheDocument()
  })

  it('roda a sugestão automática ao clicar no botão', async () => {
    setupMocks()
    vi.mocked(movimentacaoBancariaApi.listar).mockResolvedValue([])
    vi.mocked(vinculoConciliacaoApi.listar).mockResolvedValue([])
    vi.mocked(vinculoConciliacaoApi.rodarSugestaoAutomatica).mockResolvedValueOnce({
      processados: 3,
      sugeridos: 2,
      semCorrespondencia: 1,
    })

    const user = userEvent.setup()
    renderWithProviders(<MovimentacaoListPage />)

    await user.click(await screen.findByRole('button', { name: /rodar sugestão automática/i }))

    expect(vinculoConciliacaoApi.rodarSugestaoAutomatica).toHaveBeenCalledOnce()
  })
})
