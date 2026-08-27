import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmpresaListPage } from './EmpresaListPage'
import { empresaApi } from '../api/empresaApi'

vi.mock('../api/empresaApi', () => ({
  empresaApi: {
    listar: vi.fn(),
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EmpresaListPage', () => {
  it('carrega e exibe as empresas vindas da API', async () => {
    vi.mocked(empresaApi.listar).mockResolvedValueOnce([
      { id: '1', nome: 'H Vieira Terraplanagem' },
    ])

    renderWithProviders(<EmpresaListPage />)

    expect(await screen.findByText('H Vieira Terraplanagem')).toBeInTheDocument()
    expect(empresaApi.listar).toHaveBeenCalledOnce()
  })

  it('mostra estado vazio quando a API não retorna nenhuma empresa', async () => {
    vi.mocked(empresaApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<EmpresaListPage />)

    expect(await screen.findByText(/nenhuma empresa cadastrada/i)).toBeInTheDocument()
  })
})
