import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContratoFinanceiroListPage } from './ContratoFinanceiroListPage'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'

vi.mock('../api/contratoFinanceiroApi', () => ({ contratoFinanceiroApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function mockFornecedores() {
  vi.mocked(useFornecedorOptions).mockReturnValue({
    data: [{ id: 'f1', nome: 'Banco XYZ' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useFornecedorOptions>)
}

describe('ContratoFinanceiroListPage', () => {
  it('lista um Financiamento, mostrando a taxa', async () => {
    mockFornecedores()
    vi.mocked(contratoFinanceiroApi.listar).mockResolvedValueOnce([
      { id: 'ct1', tipo: 'Financiamento', empresaId: 'e1', contaBancariaId: 'cb1', fornecedorId: 'f1', valorContratado: 10000, numeroParcelas: 12, dataVencimentoPrimeiraParcela: '2026-09-10', taxa: 1.99, grupoCota: null, contemplado: null, veiculoId: null },
    ])

    renderWithProviders(<ContratoFinanceiroListPage />)

    expect(await screen.findByText('Financiamento')).toBeInTheDocument()
    expect(screen.getByText('Banco XYZ')).toBeInTheDocument()
    expect(screen.getByText('1.99% a.m.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver parcelas/i })).toHaveAttribute(
      'href',
      '/parcelas?contratoFinanceiroId=ct1',
    )
  })

  it('lista um Consórcio, mostrando grupo-cota e o status de contemplação', async () => {
    mockFornecedores()
    vi.mocked(contratoFinanceiroApi.listar).mockResolvedValueOnce([
      { id: 'ct2', tipo: 'Consórcio', empresaId: 'e1', contaBancariaId: 'cb1', fornecedorId: 'f1', valorContratado: 30000, numeroParcelas: 60, dataVencimentoPrimeiraParcela: '2026-09-10', taxa: null, grupoCota: 'Grupo 10 / Cota 5', contemplado: true, veiculoId: 'v1' },
    ])

    renderWithProviders(<ContratoFinanceiroListPage />)

    expect(await screen.findByText('Consórcio')).toBeInTheDocument()
    expect(screen.getByText('Grupo 10 / Cota 5')).toBeInTheDocument()
    expect(screen.getByText('Contemplado')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há contratos', async () => {
    mockFornecedores()
    vi.mocked(contratoFinanceiroApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<ContratoFinanceiroListPage />)

    expect(await screen.findByText(/nenhum contrato financeiro cadastrado ainda/i)).toBeInTheDocument()
  })
})
