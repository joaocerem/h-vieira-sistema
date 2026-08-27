import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ParcelaListPage } from './ParcelaListPage'
import { parcelaApi } from '../api/parcelaApi'
import { useCompraCartaoOptions } from '@/shared/hooks/useCompraCartaoOptions'
import { useContratoFinanceiroOptions } from '@/shared/hooks/useContratoFinanceiroOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'

vi.mock('../api/parcelaApi', () => ({ parcelaApi: { listar: vi.fn(), gerarLancamento: vi.fn() } }))
vi.mock('@/shared/hooks/useCompraCartaoOptions', () => ({ useCompraCartaoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useContratoFinanceiroOptions', () => ({ useContratoFinanceiroOptions: vi.fn() }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/parcelas']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function setupMocks() {
  vi.mocked(useCompraCartaoOptions).mockReturnValue({
    data: [{ id: 'cp1', cartaoId: 'cc1', fornecedorId: 'f1', valor: 900, data: '2026-08-01', categoriaId: 'cat1', classificacao: 'Terraplanagem', obraId: null, veiculoId: null, numeroParcelas: 3 }],
    isLoading: false,
  } as unknown as ReturnType<typeof useCompraCartaoOptions>)
  vi.mocked(useContratoFinanceiroOptions).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useContratoFinanceiroOptions>)
  vi.mocked(useFornecedorOptions).mockReturnValue({
    data: [{ id: 'f1', nome: 'Posto Shell' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useFornecedorOptions>)
}

describe('ParcelaListPage', () => {
  it('lista as parcelas, resolvendo a Compra de origem, e mostra "Gerar lançamento" quando pendente', async () => {
    setupMocks()
    vi.mocked(parcelaApi.listar).mockResolvedValueOnce([
      { id: 'p1', origem: 'Compra Cartão', compraCartaoId: 'cp1', contratoFinanceiroId: null, numero: 1, total: 3, valor: 300, vencimento: '2026-09-17', faturaId: null, lancamentoFinanceiroId: null },
    ])

    renderWithProviders(<ParcelaListPage />)

    expect(await screen.findByText(/compra — posto shell/i)).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gerar lançamento/i })).toBeInTheDocument()
  })

  it('não mostra "Gerar lançamento" quando já gerado', async () => {
    setupMocks()
    vi.mocked(parcelaApi.listar).mockResolvedValueOnce([
      { id: 'p1', origem: 'Compra Cartão', compraCartaoId: 'cp1', contratoFinanceiroId: null, numero: 1, total: 3, valor: 300, vencimento: '2026-09-17', faturaId: 'fat1', lancamentoFinanceiroId: 'l1' },
    ])

    renderWithProviders(<ParcelaListPage />)

    await screen.findByText('1/3')
    expect(screen.queryByRole('button', { name: /gerar lançamento/i })).not.toBeInTheDocument()
    expect(screen.getByText('Gerado')).toBeInTheDocument()
  })

  it('pré-seleciona o filtro a partir do query param compraCartaoId', async () => {
    setupMocks()
    vi.mocked(parcelaApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<ParcelaListPage />, ['/parcelas?compraCartaoId=cp1'])

    expect(await screen.findByDisplayValue(/posto shell/i)).toBeInTheDocument()
    expect(vi.mocked(parcelaApi.listar).mock.calls.at(-1)?.[0]).toMatchObject({ compraCartaoId: 'cp1' })
  })

  it('pré-seleciona o filtro a partir do query param contratoFinanceiroId', async () => {
    setupMocks()
    vi.mocked(useContratoFinanceiroOptions).mockReturnValue({
      data: [{ id: 'ct1', tipo: 'Financiamento', empresaId: 'e1', contaBancariaId: 'cb1', fornecedorId: 'f1', valorContratado: 12000, numeroParcelas: 24, dataVencimentoPrimeiraParcela: '2026-09-10', taxa: 1.5, grupoCota: null, contemplado: null, veiculoId: null }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContratoFinanceiroOptions>)
    vi.mocked(parcelaApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<ParcelaListPage />, ['/parcelas?contratoFinanceiroId=ct1'])

    expect(await screen.findByDisplayValue(/financiamento — posto shell/i)).toBeInTheDocument()
    expect(vi.mocked(parcelaApi.listar).mock.calls.at(-1)?.[0]).toMatchObject({ contratoFinanceiroId: 'ct1' })
  })

  it('resolve a origem Contrato Financeiro e mostra "—" na coluna Fatura (não se aplica)', async () => {
    setupMocks()
    vi.mocked(useContratoFinanceiroOptions).mockReturnValue({
      data: [{ id: 'ct1', tipo: 'Consórcio', empresaId: 'e1', contaBancariaId: 'cb1', fornecedorId: 'f1', valorContratado: 30000, numeroParcelas: 60, dataVencimentoPrimeiraParcela: '2026-09-10', taxa: null, grupoCota: 'Grupo 10 / Cota 5', contemplado: false, veiculoId: null }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContratoFinanceiroOptions>)
    vi.mocked(parcelaApi.listar).mockResolvedValueOnce([
      { id: 'p1', origem: 'Contrato Financeiro', compraCartaoId: null, contratoFinanceiroId: 'ct1', numero: 1, total: 60, valor: 500, vencimento: '2026-09-10', faturaId: null, lancamentoFinanceiroId: null },
    ])

    renderWithProviders(<ParcelaListPage />)

    expect(await screen.findByText('1/60')).toBeInTheDocument()
    expect(screen.getByText(/consórcio — posto shell/i, { selector: 'td' })).toBeInTheDocument()
    const linhaFatura = screen.getByText('1/60').closest('tr')
    expect(linhaFatura).not.toBeNull()
    expect(linhaFatura?.textContent).toContain('—')
  })

  it('chama gerarLancamento ao clicar no botão', async () => {
    setupMocks()
    vi.mocked(parcelaApi.listar).mockResolvedValue([
      { id: 'p1', origem: 'Compra Cartão', compraCartaoId: 'cp1', contratoFinanceiroId: null, numero: 1, total: 3, valor: 300, vencimento: '2026-09-17', faturaId: null, lancamentoFinanceiroId: null },
    ])
    vi.mocked(parcelaApi.gerarLancamento).mockResolvedValueOnce({
      id: 'p1', origem: 'Compra Cartão', compraCartaoId: 'cp1', contratoFinanceiroId: null, numero: 1, total: 3, valor: 300, vencimento: '2026-09-17', faturaId: null, lancamentoFinanceiroId: 'l1',
    })

    const user = userEvent.setup()
    renderWithProviders(<ParcelaListPage />)

    await user.click(await screen.findByRole('button', { name: /gerar lançamento/i }))

    expect(vi.mocked(parcelaApi.gerarLancamento).mock.calls[0][0]).toBe('p1')
  })
})
