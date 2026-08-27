import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartaoCreditoForm } from './CartaoCreditoForm'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({
  useContaBancariaOptions: vi.fn(),
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CartaoCreditoForm', () => {
  it('exige conta bancária, banco, apelido e dias no modo criar', async () => {
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [{ id: '1', banco: 'Itaú', apelido: 'Conta Movimento' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    const user = userEvent.setup()
    renderWithQueryClient(
      <CartaoCreditoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/banco é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/apelido é obrigatório/i)).toBeInTheDocument()
  })

  it('envia os valores preenchidos, incluindo os dias como número', async () => {
    vi.mocked(useContaBancariaOptions).mockReturnValue({
      data: [{ id: '1', banco: 'Itaú', apelido: 'Conta Movimento' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useContaBancariaOptions>)

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <CartaoCreditoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/conta bancária/i), '1')
    await user.type(screen.getByLabelText(/^banco$/i), 'Nubank')
    await user.type(screen.getByLabelText(/apelido/i), 'Cartão Corporativo')
    await user.type(screen.getByLabelText(/dia de fechamento/i), '10')
    await user.type(screen.getByLabelText(/dia de vencimento/i), '17')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit.mock.calls[0][0]).toEqual({
      contaBancariaId: '1',
      banco: 'Nubank',
      apelido: 'Cartão Corporativo',
      diaFechamento: 10,
      diaVencimento: 17,
    })
  })
})
