import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ObraListPage } from './ObraListPage'
import { obraApi } from '../api/obraApi'
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'

vi.mock('../api/obraApi', () => ({ obraApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useClienteOptions', () => ({ useClienteOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ObraListPage', () => {
  it('lista as obras, resolvendo o cliente e mostrando o status', async () => {
    vi.mocked(obraApi.listar).mockResolvedValueOnce([
      {
        id: '1',
        clienteId: 'c1',
        nome: 'Duplicação BR-101',
        valorContratado: 500000,
        dataInicio: '2026-01-01',
        dataPrevistaTermino: '2026-12-31',
        dataRealTermino: null,
        status: 'Em andamento',
      },
    ])
    vi.mocked(useClienteOptions).mockReturnValue({
      data: [{ id: 'c1', nome: 'Construtora XYZ' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteOptions>)

    renderWithProviders(<ObraListPage />)

    expect(await screen.findByText('Duplicação BR-101')).toBeInTheDocument()
    expect(screen.getByText('Construtora XYZ')).toBeInTheDocument()
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há obras', async () => {
    vi.mocked(obraApi.listar).mockResolvedValueOnce([])
    vi.mocked(useClienteOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteOptions>)

    renderWithProviders(<ObraListPage />)

    expect(await screen.findByText(/nenhuma obra cadastrada/i)).toBeInTheDocument()
  })
})
