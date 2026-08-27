import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransferenciaInternaListPage } from './TransferenciaInternaListPage'
import { transferenciaInternaApi } from '../api/transferenciaInternaApi'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'

vi.mock('../api/transferenciaInternaApi', () => ({
  transferenciaInternaApi: { listar: vi.fn() },
}))
vi.mock('../api/movimentacaoBancariaApi', () => ({
  movimentacaoBancariaApi: { listar: vi.fn() },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TransferenciaInternaListPage', () => {
  it('lista as transferências, resolvendo a descrição das Movimentações vinculadas', async () => {
    vi.mocked(transferenciaInternaApi.listar).mockResolvedValueOnce([
      { id: 't1', movimentacaoOrigemId: 'm1', movimentacaoDestinoId: 'm2', valor: 1000, data: '2026-08-01' },
    ])
    vi.mocked(movimentacaoBancariaApi.listar).mockResolvedValueOnce([
      { id: 'm1', contaBancariaId: 'cb1', data: '2026-08-01', descricao: 'Saída Itaú', valor: -1000, classificacao: 'Transferência Interna' },
      { id: 'm2', contaBancariaId: 'cb2', data: '2026-08-01', descricao: 'Entrada Nubank', valor: 1000, classificacao: 'Transferência Interna' },
    ])

    renderWithProviders(<TransferenciaInternaListPage />)

    expect(await screen.findByText(/saída itaú/i)).toBeInTheDocument()
    expect(screen.getByText(/entrada nubank/i)).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há transferências', async () => {
    vi.mocked(transferenciaInternaApi.listar).mockResolvedValueOnce([])
    vi.mocked(movimentacaoBancariaApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<TransferenciaInternaListPage />)

    expect(await screen.findByText(/nenhuma transferência interna registrada ainda/i)).toBeInTheDocument()
  })
})
