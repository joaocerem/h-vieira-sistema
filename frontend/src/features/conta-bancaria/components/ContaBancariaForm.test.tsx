import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContaBancariaForm } from './ContaBancariaForm'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'

vi.mock('@/shared/hooks/useEmpresaOptions', () => ({
  useEmpresaOptions: vi.fn(),
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ContaBancariaForm', () => {
  it('exige empresa, banco e apelido no modo criar', async () => {
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: '1', nome: 'H Vieira Terraplanagem' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    const user = userEvent.setup()
    renderWithQueryClient(
      <ContaBancariaForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/empresa é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/banco é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/apelido é obrigatório/i)).toBeInTheDocument()
  })

  it('não mostra nem exige o campo empresa no modo editar', () => {
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    renderWithQueryClient(
      <ContaBancariaForm
        modo="editar"
        defaultValues={{ empresaId: undefined, banco: 'Itaú', apelido: 'Conta Movimento' }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByLabelText(/empresa/i)).not.toBeInTheDocument()
  })

  it('envia empresaId, banco e apelido preenchidos no modo criar', async () => {
    vi.mocked(useEmpresaOptions).mockReturnValue({
      data: [{ id: '1', nome: 'H Vieira Terraplanagem' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmpresaOptions>)

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <ContaBancariaForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/empresa/i), '1')
    await user.type(screen.getByLabelText(/banco/i), 'Itaú')
    await user.type(screen.getByLabelText(/apelido/i), 'Conta Movimento')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit.mock.calls[0][0]).toEqual({
      empresaId: '1',
      banco: 'Itaú',
      apelido: 'Conta Movimento',
    })
  })
})
