import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FaturaFecharCicloForm } from './FaturaFecharCicloForm'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('@/shared/hooks/useCartaoCreditoOptions', () => ({ useCartaoCreditoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useCartaoCreditoOptions).mockReturnValue({
    data: [{ id: 'cc1', contaBancariaId: 'cb1', banco: 'Itaú', diaFechamento: 10, diaVencimento: 17 }],
    isLoading: false,
  } as unknown as ReturnType<typeof useCartaoCreditoOptions>)
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', empresaId: 'e1', banco: 'Itaú' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H Vieira' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
}

describe('FaturaFecharCicloForm', () => {
  it('exige cartão, ciclo e valor cobrado', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<FaturaFecharCicloForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /fechar ciclo/i }))

    expect(await screen.findByText(/cartão é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/ciclo é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor cobrado é obrigatório/i)).toBeInTheDocument()
  })

  it('envia cartaoId, ciclo (AAAA-MM) e valorCobrado preenchidos', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<FaturaFecharCicloForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/cartão/i), 'cc1')
    await user.type(screen.getByLabelText(/ciclo/i), '2026-08')
    await user.type(screen.getByLabelText(/valor cobrado/i), '1250.90')
    await user.click(screen.getByRole('button', { name: /fechar ciclo/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      cartaoId: 'cc1',
      ciclo: '2026-08',
      valorCobrado: 1250.9,
    })
  })
})
