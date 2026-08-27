import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BalancoPage } from './BalancoPage'
import { balancoApi } from '../api/balancoApi'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('../api/balancoApi', () => ({ balancoApi: { calcular: vi.fn() } }))
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H. Vieira Terraplanagem' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
}

describe('BalancoPage', () => {
  it('mostra os seis valores de Realizado e Projetado', async () => {
    setupMocks()
    vi.mocked(balancoApi.calcular).mockResolvedValueOnce({
      receitasRealizadas: 10000,
      despesasRealizadas: 4000,
      resultadoRealizado: 6000,
      receitasProjetadas: 20000,
      despesasProjetadas: 9000,
      resultadoProjetado: 11000,
    })

    renderWithProviders(<BalancoPage />)

    expect(await screen.findByText('Receitas realizadas')).toBeInTheDocument()
    expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument()
    expect(screen.getByText('Despesas realizadas')).toBeInTheDocument()
    expect(screen.getByText('R$ 4.000,00')).toBeInTheDocument()
    expect(screen.getByText('Resultado realizado')).toBeInTheDocument()
    expect(screen.getByText('R$ 6.000,00')).toBeInTheDocument()
    expect(screen.getByText('Receitas projetadas')).toBeInTheDocument()
    expect(screen.getByText('R$ 20.000,00')).toBeInTheDocument()
    expect(screen.getByText('Despesas projetadas')).toBeInTheDocument()
    expect(screen.getByText('R$ 9.000,00')).toBeInTheDocument()
    expect(screen.getByText('Resultado projetado')).toBeInTheDocument()
    expect(screen.getByText('R$ 11.000,00')).toBeInTheDocument()
  })

  it('refaz a consulta filtrando por empresa quando selecionada', async () => {
    setupMocks()
    vi.mocked(balancoApi.calcular).mockResolvedValue({
      receitasRealizadas: 0,
      despesasRealizadas: 0,
      resultadoRealizado: 0,
      receitasProjetadas: 0,
      despesasProjetadas: 0,
      resultadoProjetado: 0,
    })

    const user = userEvent.setup()
    renderWithProviders(<BalancoPage />)

    await screen.findByText('Receitas realizadas')
    expect(vi.mocked(balancoApi.calcular).mock.calls.at(-1)?.[0]).toBeUndefined()

    await user.selectOptions(screen.getByLabelText(/filtrar por empresa/i), 'e1')

    await vi.waitFor(() => {
      expect(vi.mocked(balancoApi.calcular).mock.calls.at(-1)?.[0]).toBe('e1')
    })
  })

  it('mostra estado de erro quando a consulta falha', async () => {
    setupMocks()
    vi.mocked(balancoApi.calcular).mockRejectedValueOnce(new Error('falha'))

    renderWithProviders(<BalancoPage />)

    expect(await screen.findByText(/não foi possível carregar o balanço/i)).toBeInTheDocument()
  })
})
