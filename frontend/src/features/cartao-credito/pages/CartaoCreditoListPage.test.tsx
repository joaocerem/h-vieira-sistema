import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartaoCreditoListPage } from './CartaoCreditoListPage'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

vi.mock('../api/cartaoCreditoApi', () => ({
  cartaoCreditoApi: { listar: vi.fn() },
}))

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({
  useContaBancariaOptions: vi.fn(),
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
  it('lista os cartões, resolvendo a conta bancária vinculada', async () => {
    vi.mocked(cartaoCreditoApi.listar).mockResolvedValueOnce([
      { id: '1', contaBancariaId: 'cb1', banco: 'Nubank', apelido: 'Corporativo', diaFechamento: 10, diaVencimento: 17 },
    ])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    renderWithProviders(<CartaoCreditoListPage />)

    expect(await screen.findByText('Corporativo')).toBeInTheDocument()
    expect(screen.getByText('Itaú — Conta Movimento')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há cartões', async () => {
    vi.mocked(cartaoCreditoApi.listar).mockResolvedValueOnce([])
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    renderWithProviders(<CartaoCreditoListPage />)

    expect(await screen.findByText(/nenhum cartão de crédito cadastrado/i)).toBeInTheDocument()
  })
})
