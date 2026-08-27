import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VeiculoListPage } from './VeiculoListPage'
import { veiculoApi } from '../api/veiculoApi'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'

vi.mock('../api/veiculoApi', () => ({ veiculoApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useObraOptions', () => ({ useObraOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VeiculoListPage', () => {
  it('lista os veículos, resolvendo empresa e obra atual', async () => {
    vi.mocked(veiculoApi.listar).mockResolvedValueOnce([
      { id: '1', empresaId: 'e1', nomeIdentificacao: 'Caminhão 01', tipo: 'Caminhão', obraAtualId: 'o1' },
    ])
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: 'e1', nome: 'H Vieira' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)
    vi.mocked(useObraOptions).mockReturnValue({
      data: [{ id: 'o1', nome: 'Duplicação BR-101' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useObraOptions>)

    renderWithProviders(<VeiculoListPage />)

    expect(await screen.findByText('Caminhão 01')).toBeInTheDocument()
    expect(screen.getByText('H Vieira')).toBeInTheDocument()
    expect(screen.getByText('Duplicação BR-101')).toBeInTheDocument()
  })

  it('mostra "—" quando o veículo não tem obra atual', async () => {
    vi.mocked(veiculoApi.listar).mockResolvedValueOnce([
      { id: '1', empresaId: 'e1', nomeIdentificacao: 'Caminhão 01', tipo: 'Caminhão', obraAtualId: null },
    ])
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: 'e1', nome: 'H Vieira' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)
    vi.mocked(useObraOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useObraOptions>)

    renderWithProviders(<VeiculoListPage />)

    expect(await screen.findAllByText('—')).toHaveLength(1)
  })

  it('mostra estado vazio quando não há veículos', async () => {
    vi.mocked(veiculoApi.listar).mockResolvedValueOnce([])
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)
    vi.mocked(useObraOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useObraOptions>)

    renderWithProviders(<VeiculoListPage />)

    expect(await screen.findByText(/nenhum veículo cadastrado/i)).toBeInTheDocument()
  })
})
