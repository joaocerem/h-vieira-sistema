import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FaturaDetailPage } from './FaturaDetailPage'
import { faturaApi } from '../api/faturaApi'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useParcelaOptions } from '@/shared/hooks/useParcelaOptions'

vi.mock('../api/faturaApi', () => ({ faturaApi: { buscarPorId: vi.fn() } }))
vi.mock('@/shared/hooks/useCartaoCreditoOptions', () => ({ useCartaoCreditoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useParcelaOptions', () => ({ useParcelaOptions: vi.fn() }))

function renderWithProviders(initialEntry: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/faturas/:id" element={<FaturaDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function setupMocks() {
  vi.mocked(useCartaoCreditoOptions).mockReturnValue({
    data: [{ id: 'cc1', contaBancariaId: 'cb1', banco: 'Itaú', apelido: 'Corporativo', diaFechamento: 10, diaVencimento: 17 }],
    isLoading: false,
  } as unknown as ReturnType<typeof useCartaoCreditoOptions>)
  vi.mocked(useParcelaOptions).mockReturnValue({
    data: [
      { id: 'p1', origem: 'Compra Cartão', compraCartaoId: 'cp1', contratoFinanceiroId: null, numero: 1, total: 1, valor: 1200, vencimento: '2026-09-17', faturaId: 'fat1', lancamentoFinanceiroId: 'l1' },
      { id: 'p2', origem: 'Compra Cartão', compraCartaoId: 'cp2', contratoFinanceiroId: null, numero: 1, total: 1, valor: 500, vencimento: '2026-09-17', faturaId: 'fat2', lancamentoFinanceiroId: null },
    ],
    isLoading: false,
  } as unknown as ReturnType<typeof useParcelaOptions>)
}

describe('FaturaDetailPage', () => {
  it('mostra os dados da fatura e só as Parcelas do próprio ciclo (cruzamento por faturaId)', async () => {
    setupMocks()
    vi.mocked(faturaApi.buscarPorId).mockResolvedValueOnce({
      id: 'fat1', cartaoId: 'cc1', ciclo: '2026-08', valorTotalCalculado: 1200, valorCobrado: 1200, liquidacaoFinanceiraId: null,
    })

    renderWithProviders('/faturas/fat1')

    expect(await screen.findByText('Fatura — 2026-08')).toBeInTheDocument()
    expect(screen.getByText('Itaú — Corporativo')).toBeInTheDocument()
    expect(screen.getByText('1/1')).toBeInTheDocument()
    expect(screen.queryByText('500')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pagar fatura/i })).toHaveAttribute('href', '/faturas/fat1/pagar')
  })

  it('não mostra o link "Pagar fatura" quando já paga', async () => {
    setupMocks()
    vi.mocked(faturaApi.buscarPorId).mockResolvedValueOnce({
      id: 'fat1', cartaoId: 'cc1', ciclo: '2026-08', valorTotalCalculado: 1200, valorCobrado: 1200, liquidacaoFinanceiraId: 'liq1',
    })

    renderWithProviders('/faturas/fat1')

    await screen.findByText('Fatura — 2026-08')
    expect(screen.queryByRole('link', { name: /pagar fatura/i })).not.toBeInTheDocument()
    expect(screen.getByText('Paga')).toBeInTheDocument()
  })
})
