import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompraCartaoListPage } from './CompraCartaoListPage'
import { compraCartaoApi } from '../api/compraCartaoApi'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'

vi.mock('../api/compraCartaoApi', () => ({ compraCartaoApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))
vi.mock('@/shared/hooks/useCategoriaOptions', () => ({ useCategoriaOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CompraCartaoListPage', () => {
  it('lista as compras, resolvendo fornecedor e categoria', async () => {
    vi.mocked(compraCartaoApi.listar).mockResolvedValueOnce([
      {
        id: 'cp1',
        cartaoId: 'cc1',
        fornecedorId: 'f1',
        valor: 350,
        data: '2026-08-01',
        categoriaId: 'cat1',
        classificacao: 'Terraplanagem',
        obraId: null,
        veiculoId: null,
        numeroParcelas: 3,
      },
    ])
    vi.mocked(useFornecedorOptions).mockReturnValue({
      data: [{ id: 'f1', nome: 'Posto Shell' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useFornecedorOptions>)
    vi.mocked(useCategoriaOptions).mockReturnValue({
      data: [{ id: 'cat1', nome: 'Combustível', tipo: 'Despesa' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategoriaOptions>)

    renderWithProviders(<CompraCartaoListPage />)

    expect(await screen.findByText('Posto Shell')).toBeInTheDocument()
    expect(screen.getByText('Combustível')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver parcelas/i })).toHaveAttribute(
      'href',
      '/parcelas?compraCartaoId=cp1',
    )
  })

  it('mostra estado vazio quando não há compras', async () => {
    vi.mocked(compraCartaoApi.listar).mockResolvedValueOnce([])
    vi.mocked(useFornecedorOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useFornecedorOptions>)
    vi.mocked(useCategoriaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategoriaOptions>)

    renderWithProviders(<CompraCartaoListPage />)

    expect(await screen.findByText(/nenhuma compra de cartão cadastrada ainda/i)).toBeInTheDocument()
  })
})
