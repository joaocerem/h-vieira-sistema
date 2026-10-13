import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MovimentacaoListPage } from './MovimentacaoListPage'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'

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
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useLancamentoOptions', () => ({ useLancamentoOptions: vi.fn() }))

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
    data: [{ id: 'cb1', empresaId: 'e1', banco: 'Itaú' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H Vieira' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
  vi.mocked(useLancamentoOptions).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useLancamentoOptions>)
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
      { id: 'v1', movimentacaoBancariaId: 'm1', lancamentosFinanceirosIds: ['l1'], estadoConciliacao: 'Sugerido' },
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
      comMultiplosCandidatos: 0,
    })

    const user = userEvent.setup()
    renderWithProviders(<MovimentacaoListPage />)

    await user.click(await screen.findByRole('button', { name: /rodar sugestão automática/i }))

    expect(vinculoConciliacaoApi.rodarSugestaoAutomatica).toHaveBeenCalledOnce()
  })
})
