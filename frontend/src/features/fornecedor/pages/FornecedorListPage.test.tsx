import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FornecedorListPage } from './FornecedorListPage'
import { fornecedorApi } from '../api/fornecedorApi'

vi.mock('../api/fornecedorApi', () => ({
  fornecedorApi: { listar: vi.fn() },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FornecedorListPage', () => {
  it('carrega e exibe os fornecedores vindos da API', async () => {
    vi.mocked(fornecedorApi.listar).mockResolvedValueOnce([{ id: '1', nome: 'Posto ABC' }])

    renderWithProviders(<FornecedorListPage />)

    expect(await screen.findByText('Posto ABC')).toBeInTheDocument()
    expect(fornecedorApi.listar).toHaveBeenCalledOnce()
  })

  it('mostra estado vazio quando não há fornecedores', async () => {
    vi.mocked(fornecedorApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<FornecedorListPage />)

    expect(await screen.findByText(/nenhum fornecedor cadastrado/i)).toBeInTheDocument()
  })
})
