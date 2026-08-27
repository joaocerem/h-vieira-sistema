import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContaBancariaListPage } from './ContaBancariaListPage'
import { contaBancariaApi } from '../api/contaBancariaApi'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('../api/contaBancariaApi', () => ({
  contaBancariaApi: { listar: vi.fn() },
}))

vi.mock('@/shared/hooks/useEmpresaOptions', () => ({
  useEmpresaOptions: vi.fn(),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ContaBancariaListPage', () => {
  it('resolve o nome da empresa a partir do empresaId', async () => {
    vi.mocked(contaBancariaApi.listar).mockResolvedValueOnce([
      { id: '1', empresaId: 'e1', banco: 'Itaú', apelido: 'Conta Movimento' },
    ])
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: 'e1', nome: 'H Vieira Terraplanagem' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    renderWithProviders(<ContaBancariaListPage />)

    expect(await screen.findByText('H Vieira Terraplanagem')).toBeInTheDocument()
    expect(screen.getByText('Itaú')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há contas bancárias', async () => {
    vi.mocked(contaBancariaApi.listar).mockResolvedValueOnce([])
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    renderWithProviders(<ContaBancariaListPage />)

    expect(await screen.findByText(/nenhuma conta bancária cadastrada/i)).toBeInTheDocument()
  })
})
