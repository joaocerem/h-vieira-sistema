import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ObraForm } from './ObraForm'
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'

vi.mock('@/shared/hooks/useClienteOptions', () => ({ useClienteOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ObraForm', () => {
  it('exige cliente, nome, valor e datas no modo criar', async () => {
    vi.mocked(useClienteOptions).mockReturnValue({
      data: [{ id: 'c1', nome: 'Construtora XYZ' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteOptions>)

    const user = userEvent.setup()
    renderWithQueryClient(
      <ObraForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/cliente é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor contratado deve ser um valor monetário positivo/i)).toBeInTheDocument()
    expect(screen.getByText(/data de início é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/data prevista de término é obrigatória/i)).toBeInTheDocument()
  })

  it('não mostra o campo cliente no modo editar', () => {
    vi.mocked(useClienteOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteOptions>)

    renderWithQueryClient(
      <ObraForm
        modo="editar"
        defaultValues={{
          clienteId: undefined,
          nome: 'Obra A',
          valorContratado: 1000,
          dataInicio: '2026-01-01',
          dataPrevistaTermino: '2026-12-01',
          dataRealTermino: '',
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByLabelText(/cliente/i)).not.toBeInTheDocument()
  })

  it('envia os valores preenchidos, incluindo data real de término opcional', async () => {
    vi.mocked(useClienteOptions).mockReturnValue({
      data: [{ id: 'c1', nome: 'Construtora XYZ' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteOptions>)

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <ObraForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/cliente/i), 'c1')
    await user.type(screen.getByLabelText(/^nome$/i), 'Duplicação BR-101')
    await user.type(screen.getByLabelText(/valor contratado/i), '500000')
    await user.type(screen.getByLabelText(/data de início/i), '2026-01-01')
    await user.type(screen.getByLabelText(/data prevista de término/i), '2026-12-31')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      clienteId: 'c1',
      nome: 'Duplicação BR-101',
      valorContratado: 500000,
      dataInicio: '2026-01-01',
      dataPrevistaTermino: '2026-12-31',
    })
  })
})
