import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LancamentoListPage } from './LancamentoListPage'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'

vi.mock('../api/lancamentoFinanceiroApi', () => ({
  lancamentoFinanceiroApi: { listar: vi.fn() },
}))

vi.mock('@/shared/hooks/useCategoriaOptions', () => ({
  useCategoriaOptions: vi.fn(),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LancamentoListPage', () => {
  it('lista os lançamentos, resolvendo a categoria e mostrando valor/status', async () => {
    vi.mocked(lancamentoFinanceiroApi.listar).mockResolvedValueOnce([
      {
        id: '1',
        tipo: 'Despesa',
        empresaId: 'e1',
        categoriaId: 'c1',
        fornecedorId: 'f1',
        clienteId: null,
        obraId: null,
        veiculoId: null,
        valor: 150.5,
        dataCompetencia: '2026-08-01',
        vencimento: '2026-08-10',
        situacaoAdministrativa: 'Ativo',
        origem: 'Manual',
        statusFinanceiro: 'Aberto',
        descricao: null,
        documento: null,
      },
    ])
    vi.mocked(useCategoriaOptions).mockReturnValue({
      data: [{ id: 'c1', nome: 'Combustível', tipo: 'Despesa' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategoriaOptions>)

    renderWithProviders(<LancamentoListPage />)

    expect(await screen.findByText('Combustível')).toBeInTheDocument()
    expect(screen.getByText('10/08/2026')).toBeInTheDocument()
    expect(screen.getByText('Aberto')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*150,50/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ajustes/i })).toHaveAttribute(
      'href',
      '/ajustes-financeiros?lancamentoOriginalId=1',
    )
  })

  it('mostra estado vazio quando não há lançamentos', async () => {
    vi.mocked(lancamentoFinanceiroApi.listar).mockResolvedValueOnce([])
    vi.mocked(useCategoriaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategoriaOptions>)

    renderWithProviders(<LancamentoListPage />)

    expect(await screen.findByText(/nenhum lançamento cadastrado/i)).toBeInTheDocument()
  })
})
