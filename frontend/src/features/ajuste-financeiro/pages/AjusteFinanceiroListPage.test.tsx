import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AjusteFinanceiroListPage } from './AjusteFinanceiroListPage'
import { ajusteFinanceiroApi } from '../api/ajusteFinanceiroApi'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { useUsuarioOptions } from '@/shared/hooks/useUsuarioOptions'

vi.mock('../api/ajusteFinanceiroApi', () => ({ ajusteFinanceiroApi: { listar: vi.fn() } }))
vi.mock('@/shared/hooks/useLancamentoOptions', () => ({ useLancamentoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useUsuarioOptions', () => ({ useUsuarioOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/ajustes-financeiros']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function setupMocks() {
  vi.mocked(useLancamentoOptions).mockReturnValue({
    data: [
      { id: 'l1', tipo: 'Despesa', valor: 5000, vencimento: '2026-08-10', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Pago-Recebido' },
      { id: 'l2', tipo: 'Receita', valor: 500, vencimento: '2026-08-20', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Aberto' },
    ],
    isLoading: false,
  } as unknown as ReturnType<typeof useLancamentoOptions>)
  vi.mocked(useUsuarioOptions).mockReturnValue({
    data: [{ id: 'u1', nome: 'João Pedro', identificadorDeAcesso: 'joao', situacaoDeAcesso: 'Ativo' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useUsuarioOptions>)
}

describe('AjusteFinanceiroListPage', () => {
  it('lista os ajustes, resolvendo Lançamentos e Usuário', async () => {
    setupMocks()
    vi.mocked(ajusteFinanceiroApi.listar).mockResolvedValueOnce([
      { id: 'a1', lancamentoOriginalId: 'l1', lancamentoAjusteId: 'l2', tipoAjuste: 'Estorno', valor: 500, data: '2026-08-21', usuarioId: 'u1', observacao: 'Devolução parcial' },
    ])

    renderWithProviders(<AjusteFinanceiroListPage />)

    expect(await screen.findByText('João Pedro')).toBeInTheDocument()
    expect(screen.getByText('Estorno')).toBeInTheDocument()
    expect(screen.getByText('Devolução parcial')).toBeInTheDocument()
    expect(screen.getAllByText(/despesa • r\$ 5\.000,00/i).length).toBeGreaterThan(0)
  })

  it('mostra estado vazio quando não há ajustes', async () => {
    setupMocks()
    vi.mocked(ajusteFinanceiroApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<AjusteFinanceiroListPage />)

    expect(await screen.findByText(/nenhum ajuste financeiro registrado ainda/i)).toBeInTheDocument()
  })

  it('filtra por lancamentoOriginalId vindo da URL e mostra "Limpar filtro"', async () => {
    setupMocks()
    vi.mocked(ajusteFinanceiroApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<AjusteFinanceiroListPage />, ['/ajustes-financeiros?lancamentoOriginalId=l1'])

    expect(await screen.findByRole('link', { name: /limpar filtro/i })).toHaveAttribute(
      'href',
      '/ajustes-financeiros',
    )
    expect(vi.mocked(ajusteFinanceiroApi.listar).mock.calls.at(-1)?.[0]).toBe('l1')
    expect(screen.getByRole('link', { name: /novo ajuste/i })).toHaveAttribute(
      'href',
      '/ajustes-financeiros/novo?lancamentoOriginalId=l1',
    )
  })
})
