import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FaturaListPage } from './FaturaListPage'
import { faturaApi } from '../api/faturaApi'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('../api/faturaApi', () => ({ faturaApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useCartaoCreditoOptions', () => ({ useCartaoCreditoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function setupContaEEmpresa() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', empresaId: 'e1', banco: 'Itaú' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H Vieira' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
}

describe('FaturaListPage', () => {
  it('lista as faturas, resolvendo o cartão e o status de pagamento', async () => {
    setupContaEEmpresa()
    vi.mocked(faturaApi.listar).mockResolvedValueOnce([
      { id: 'fat1', cartaoId: 'cc1', ciclo: '2026-08', valorTotalCalculado: 1200, valorCobrado: 1200, paga: false },
    ])
    vi.mocked(useCartaoCreditoOptions).mockReturnValue({
      data: [{ id: 'cc1', contaBancariaId: 'cb1', banco: 'Itaú', diaFechamento: 10, diaVencimento: 17 }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCartaoCreditoOptions>)

    renderWithProviders(<FaturaListPage />)

    expect(await screen.findByText('H Vieira — Itaú')).toBeInTheDocument()
    expect(screen.getByText('2026-08')).toBeInTheDocument()
    expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há faturas', async () => {
    setupContaEEmpresa()
    vi.mocked(faturaApi.listar).mockResolvedValueOnce([])
    vi.mocked(useCartaoCreditoOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCartaoCreditoOptions>)

    renderWithProviders(<FaturaListPage />)

    expect(await screen.findByText(/nenhuma fatura fechada ainda/i)).toBeInTheDocument()
  })
})
