import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FaturaListPage } from './FaturaListPage'
import { faturaApi } from '../api/faturaApi'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'

vi.mock('../api/faturaApi', () => ({ faturaApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useCartaoCreditoOptions', () => ({ useCartaoCreditoOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FaturaListPage', () => {
  it('lista as faturas, resolvendo o cartão e o status de pagamento', async () => {
    vi.mocked(faturaApi.listar).mockResolvedValueOnce([
      { id: 'fat1', cartaoId: 'cc1', ciclo: '2026-08', valorTotalCalculado: 1200, valorCobrado: 1200, liquidacaoFinanceiraId: null },
    ])
    vi.mocked(useCartaoCreditoOptions).mockReturnValue({
      data: [{ id: 'cc1', contaBancariaId: 'cb1', banco: 'Itaú', apelido: 'Corporativo', diaFechamento: 10, diaVencimento: 17 }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCartaoCreditoOptions>)

    renderWithProviders(<FaturaListPage />)

    expect(await screen.findByText('Itaú — Corporativo')).toBeInTheDocument()
    expect(screen.getByText('2026-08')).toBeInTheDocument()
    expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há faturas', async () => {
    vi.mocked(faturaApi.listar).mockResolvedValueOnce([])
    vi.mocked(useCartaoCreditoOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCartaoCreditoOptions>)

    renderWithProviders(<FaturaListPage />)

    expect(await screen.findByText(/nenhuma fatura fechada ainda/i)).toBeInTheDocument()
  })
})
