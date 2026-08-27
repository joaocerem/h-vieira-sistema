import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FaturaPagarForm } from './FaturaPagarForm'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
}

describe('FaturaPagarForm', () => {
  it('exige conta bancária e data efetiva', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<FaturaPagarForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /pagar fatura/i }))

    expect(await screen.findByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/data efetiva é obrigatória/i)).toBeInTheDocument()
  })

  it('envia contaBancariaId e dataEfetiva preenchidos', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<FaturaPagarForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/conta bancária/i), 'cb1')
    await user.type(screen.getByLabelText(/data efetiva/i), '2026-08-20')
    await user.click(screen.getByRole('button', { name: /pagar fatura/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contaBancariaId: 'cb1', dataEfetiva: '2026-08-20' })
  })
})
