import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartaoCreditoForm } from './CartaoCreditoForm'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({
  useContaBancariaOptions: vi.fn(),
}))
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({
  useEmpresaOptions: vi.fn(),
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: '1', empresaId: 'e1', banco: 'Itaú' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H Vieira' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
}

describe('CartaoCreditoForm', () => {
  it('exige conta bancária, banco e dias no modo criar', async () => {
    setupMocks()

    const user = userEvent.setup()
    renderWithQueryClient(
      <CartaoCreditoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/banco é obrigatório/i)).toBeInTheDocument()
  })

  it('envia os valores preenchidos, incluindo os dias como número', async () => {
    setupMocks()

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <CartaoCreditoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/conta bancária/i), '1')
    await user.type(screen.getByLabelText(/^banco$/i), 'Nubank')
    await user.type(screen.getByLabelText(/dia de fechamento/i), '10')
    await user.type(screen.getByLabelText(/dia de vencimento/i), '17')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit.mock.calls[0][0]).toEqual({
      contaBancariaId: '1',
      banco: 'Nubank',
      diaFechamento: 10,
      diaVencimento: 17,
    })
  })
})
