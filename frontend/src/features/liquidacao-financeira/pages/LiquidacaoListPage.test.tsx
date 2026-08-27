import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LiquidacaoListPage } from './LiquidacaoListPage'
import { liquidacaoFinanceiraApi } from '../api/liquidacaoFinanceiraApi'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

vi.mock('../api/liquidacaoFinanceiraApi', () => ({
  liquidacaoFinanceiraApi: { listar: vi.fn() },
}))

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({
  useContaBancariaOptions: vi.fn(),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LiquidacaoListPage', () => {
  it('lista as liquidações, resolvendo a conta bancária e o total de lançamentos cobertos', async () => {
    vi.mocked(liquidacaoFinanceiraApi.listar).mockResolvedValueOnce([
      {
        id: '1',
        tipo: 'Pagamento',
        dataEfetiva: '2026-08-15',
        valor: 100,
        contaBancariaId: 'cb1',
        aplicacoes: [{ id: 'a1', lancamentoFinanceiroId: 'l1', valorAplicado: 100 }],
      },
    ])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    renderWithProviders(<LiquidacaoListPage />)

    expect(await screen.findByText('Itaú — Conta Movimento')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver detalhes/i })).toHaveAttribute(
      'href',
      '/liquidacoes-financeiras/1',
    )
  })

  it('mostra estado vazio quando não há liquidações', async () => {
    vi.mocked(liquidacaoFinanceiraApi.listar).mockResolvedValueOnce([])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    renderWithProviders(<LiquidacaoListPage />)

    expect(await screen.findByText(/nenhuma liquidação registrada/i)).toBeInTheDocument()
  })
})
