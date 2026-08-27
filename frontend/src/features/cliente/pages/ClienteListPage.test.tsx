import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClienteListPage } from './ClienteListPage'
import { clienteApi } from '../api/clienteApi'

vi.mock('../api/clienteApi', () => ({
  clienteApi: { listar: vi.fn() },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ClienteListPage', () => {
  it('carrega e exibe os clientes vindos da API', async () => {
    vi.mocked(clienteApi.listar).mockResolvedValueOnce([{ id: '1', nome: 'Construtora XYZ' }])

    renderWithProviders(<ClienteListPage />)

    expect(await screen.findByText('Construtora XYZ')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há clientes', async () => {
    vi.mocked(clienteApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<ClienteListPage />)

    expect(await screen.findByText(/nenhum cliente cadastrado/i)).toBeInTheDocument()
  })
})
