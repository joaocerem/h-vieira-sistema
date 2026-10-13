import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartaoCreditoListPage } from './CartaoCreditoListPage'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('../api/cartaoCreditoApi', () => ({
  cartaoCreditoApi: { listar: vi.fn() },
}))

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({
  useContaBancariaOptions: vi.fn(),
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

describe('CartaoCreditoListPage', () => {
  it('lista os cartões, resolvendo Empresa + Banco da conta bancária vinculada', async () => {
    vi.mocked(cartaoCreditoApi.listar).mockResolvedValueOnce([
      { id: '1', contaBancariaId: 'cb1', banco: 'Nubank', diaFechamento: 10, diaVencimento: 17 },
    ])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [{ id: 'cb1', empresaId: 'e1', banco: 'Itaú' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: 'e1', nome: 'H Vieira' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    renderWithProviders(<CartaoCreditoListPage />)

    expect(await screen.findByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('H Vieira — Itaú')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há cartões', async () => {
    vi.mocked(cartaoCreditoApi.listar).mockResolvedValueOnce([])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    renderWithProviders(<CartaoCreditoListPage />)

    expect(await screen.findByText(/nenhum cartão de crédito cadastrado/i)).toBeInTheDocument()
  })
})
