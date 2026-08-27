import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompraCartaoForm } from './CompraCartaoForm'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'

vi.mock('@/shared/hooks/useCartaoCreditoOptions', () => ({ useCartaoCreditoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))
vi.mock('@/shared/hooks/useCategoriaOptions', () => ({ useCategoriaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useObraOptions', () => ({ useObraOptions: vi.fn() }))
vi.mock('@/shared/hooks/useVeiculoOptions', () => ({ useVeiculoOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useCartaoCreditoOptions).mockReturnValue({
    data: [{ id: 'cc1', contaBancariaId: 'cb1', banco: 'Itaú', apelido: 'Corporativo', diaFechamento: 10, diaVencimento: 17 }],
    isLoading: false,
  } as unknown as ReturnType<typeof useCartaoCreditoOptions>)
  vi.mocked(useFornecedorOptions).mockReturnValue({
    data: [{ id: 'f1', nome: 'Posto Shell' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useFornecedorOptions>)
  vi.mocked(useCategoriaOptions).mockReturnValue({
    data: [{ id: 'cat1', nome: 'Combustível', tipo: 'Despesa' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useCategoriaOptions>)
  vi.mocked(useObraOptions).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useObraOptions>)
  vi.mocked(useVeiculoOptions).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useVeiculoOptions>)
}

describe('CompraCartaoForm', () => {
  it('exige cartão, fornecedor, valor, data, categoria, classificação e número de parcelas no modo criar', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(
      <CompraCartaoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar compra" />,
    )

    await user.click(screen.getByRole('button', { name: /criar compra/i }))

    expect(await screen.findByText(/cartão é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/fornecedor é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/data é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument()
  })

  it('não mostra os campos cartão, valor e número de parcelas no modo editar (imutáveis)', () => {
    setupMocks()
    renderWithQueryClient(
      <CompraCartaoForm
        modo="editar"
        defaultValues={{
          cartaoId: undefined,
          fornecedorId: 'f1',
          valor: undefined,
          data: '2026-08-01',
          categoriaId: 'cat1',
          classificacao: 'Terraplanagem',
          obraId: '',
          veiculoId: '',
          numeroParcelas: undefined,
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByLabelText(/^cartão$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^valor$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/número de parcelas/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/fornecedor/i)).toBeInTheDocument()
  })

  it('envia os valores preenchidos no modo criar', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <CompraCartaoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar compra" />,
    )

    await user.selectOptions(screen.getByLabelText(/^cartão$/i), 'cc1')
    await user.selectOptions(screen.getByLabelText(/fornecedor/i), 'f1')
    // Máscara de dígitos: "90000" → R$ 900,00, mesmo comportamento de caixa eletrônico.
    await user.type(screen.getByLabelText(/^valor$/i), '90000')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-05')
    await user.selectOptions(screen.getByLabelText(/categoria/i), 'cat1')
    await user.selectOptions(screen.getByLabelText(/classificação/i), 'Terraplanagem')
    await user.clear(screen.getByLabelText(/número de parcelas/i))
    await user.type(screen.getByLabelText(/número de parcelas/i), '3')
    await user.click(screen.getByRole('button', { name: /criar compra/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      cartaoId: 'cc1',
      fornecedorId: 'f1',
      valor: 900,
      data: '2026-08-05',
      categoriaId: 'cat1',
      classificacao: 'Terraplanagem',
      numeroParcelas: 3,
    })
  })
})
