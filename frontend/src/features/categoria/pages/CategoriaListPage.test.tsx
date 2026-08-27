import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoriaListPage } from './CategoriaListPage'
import { categoriaApi } from '../api/categoriaApi'

vi.mock('../api/categoriaApi', () => ({
  categoriaApi: { listar: vi.fn() },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CategoriaListPage', () => {
  it('carrega e exibe as categorias, incluindo o tipo', async () => {
    vi.mocked(categoriaApi.listar).mockResolvedValueOnce([
      { id: '1', nome: 'Combustível', tipo: 'Despesa' },
    ])

    renderWithProviders(<CategoriaListPage />)

    expect(await screen.findByText('Combustível')).toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há categorias', async () => {
    vi.mocked(categoriaApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<CategoriaListPage />)

    expect(await screen.findByText(/nenhuma categoria cadastrada/i)).toBeInTheDocument()
  })
})
