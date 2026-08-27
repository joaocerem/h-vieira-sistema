import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VeiculoForm } from './VeiculoForm'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'

vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useObraOptions', () => ({ useObraOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H Vieira' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
  vi.mocked(useObraOptions).mockReturnValue({
    data: [{ id: 'o1', nome: 'Duplicação BR-101' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useObraOptions>)
}

describe('VeiculoForm', () => {
  it('exige empresa, nome/identificação e tipo no modo criar; obra atual é opcional', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(
      <VeiculoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(await screen.findByText(/empresa é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/nome\/identificação é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/tipo é obrigatório/i)).toBeInTheDocument()
    expect(screen.queryByText(/obra atual.*obrigat/i)).not.toBeInTheDocument()
  })

  it('lista os 8 tipos fechados de veículo (D10)', () => {
    setupMocks()
    renderWithQueryClient(
      <VeiculoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    const select = screen.getByLabelText(/^tipo$/i) as HTMLSelectElement
    const opcoes = Array.from(select.options).map((o) => o.value)
    expect(opcoes).toEqual([
      '',
      'Caminhão',
      'Escavadeira',
      'Pá carregadeira',
      'Trator',
      'Rolo compactador',
      'Veículo leve',
      'Terceiro',
      'Outro',
    ])
  })

  it('envia os valores preenchidos, sem obra atual selecionada', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <VeiculoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await user.type(screen.getByLabelText(/nome\/identificação/i), 'Caminhão 01')
    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Caminhão')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      empresaId: 'e1',
      nomeIdentificacao: 'Caminhão 01',
      tipo: 'Caminhão',
    })
  })
})
