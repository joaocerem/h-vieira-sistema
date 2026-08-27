import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LancamentoForm } from './LancamentoForm'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'
import { useCriarFornecedorRapido } from '@/shared/hooks/useCriarFornecedorRapido'
import { useCriarCategoriaRapida } from '@/shared/hooks/useCriarCategoriaRapida'

vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useCategoriaOptions', () => ({ useCategoriaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))
vi.mock('@/shared/hooks/useClienteOptions', () => ({ useClienteOptions: vi.fn() }))
vi.mock('@/shared/hooks/useObraOptions', () => ({ useObraOptions: vi.fn() }))
vi.mock('@/shared/hooks/useVeiculoOptions', () => ({ useVeiculoOptions: vi.fn() }))
vi.mock('@/shared/hooks/useCriarFornecedorRapido', () => ({ useCriarFornecedorRapido: vi.fn() }))
vi.mock('@/shared/hooks/useCriarCategoriaRapida', () => ({ useCriarCategoriaRapida: vi.fn() }))

function mockOptions(data: unknown[]) {
  return { data, isLoading: false } as never
}

function setupMocks() {
  vi.mocked(useEmpresaOptions).mockReturnValue(mockOptions([{ id: 'e1', nome: 'H Vieira' }]))
  vi.mocked(useCategoriaOptions).mockReturnValue(
    mockOptions([{ id: 'c1', nome: 'Combustível', tipo: 'Despesa' }]),
  )
  vi.mocked(useFornecedorOptions).mockReturnValue(mockOptions([{ id: 'f1', nome: 'Posto ABC' }]))
  vi.mocked(useClienteOptions).mockReturnValue(mockOptions([{ id: 'cl1', nome: 'Construtora XYZ' }]))
  vi.mocked(useObraOptions).mockReturnValue(mockOptions([{ id: 'o1', nome: 'Duplicação BR-101' }]))
  vi.mocked(useVeiculoOptions).mockReturnValue(
    mockOptions([{ id: 'v1', empresaId: 'e1', nomeIdentificacao: 'Caminhão 01', tipo: 'Caminhão' }]),
  )
  vi.mocked(useCriarFornecedorRapido).mockReturnValue({ mutateAsync: vi.fn() } as never)
  vi.mocked(useCriarCategoriaRapida).mockReturnValue({ mutateAsync: vi.fn() } as never)
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

/**
 * Categoria/Fornecedor agora são `AutocompleteField` (Sprint 2), não `<select>` — em vez de
 * `user.selectOptions`, clica no campo (abre o painel com todas as opções) e clica na opção
 * desejada.
 */
async function selecionarNoAutocomplete(
  user: ReturnType<typeof userEvent.setup>,
  campoRegex: RegExp,
  opcaoLabel: string,
) {
  await user.click(screen.getByLabelText(campoRegex))
  await user.click(await screen.findByRole('option', { name: opcaoLabel }))
}

describe('LancamentoForm', () => {
  it('mostra o seletor de Fornecedor quando tipo é Despesa e de Cliente quando é Receita', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    expect(screen.getByLabelText(/fornecedor/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^cliente$/i)).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Receita')

    expect(screen.queryByLabelText(/fornecedor/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^cliente$/i)).toBeInTheDocument()
  })

  it('exige fornecedor para Despesa mesmo com os demais campos preenchidos', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await selecionarNoAutocomplete(user, /categoria/i, 'Combustível (Despesa)')
    await user.type(screen.getByLabelText(/valor/i), '100')
    await user.type(screen.getByLabelText(/data de competência/i), '2026-08-01')
    await user.type(screen.getByLabelText(/vencimento/i), '2026-08-10')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(
      await screen.findByText(/fornecedor é obrigatório para lançamento do tipo despesa/i),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os valores preenchidos para uma Despesa válida', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await selecionarNoAutocomplete(user, /categoria/i, 'Combustível (Despesa)')
    await selecionarNoAutocomplete(user, /fornecedor/i, 'Posto ABC')
    await user.type(screen.getByLabelText(/valor/i), '150.50')
    await user.type(screen.getByLabelText(/data de competência/i), '2026-08-01')
    await user.type(screen.getByLabelText(/vencimento/i), '2026-08-10')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      tipo: 'Despesa',
      empresaId: 'e1',
      categoriaId: 'c1',
      fornecedorId: 'f1',
      valor: 150.5,
      dataCompetencia: '2026-08-01',
      vencimento: '2026-08-10',
    })
  })

  it('envia descrição e documento preenchidos, junto com o Valor via CurrencyInput', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await selecionarNoAutocomplete(user, /categoria/i, 'Combustível (Despesa)')
    await selecionarNoAutocomplete(user, /fornecedor/i, 'Posto ABC')
    // Máscara de dígitos: "15050" → R$ 150,50, mesmo comportamento de caixa eletrônico.
    await user.type(screen.getByLabelText(/^valor$/i), '15050')
    await user.type(screen.getByLabelText(/descrição/i), 'Combustível caminhão 01')
    await user.type(screen.getByLabelText(/documento/i), 'NF 12345')
    await user.type(screen.getByLabelText(/data de competência/i), '2026-08-01')
    await user.type(screen.getByLabelText(/vencimento/i), '2026-08-10')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      valor: 150.5,
      descricao: 'Combustível caminhão 01',
      documento: 'NF 12345',
    })
  })

  it('no modo editar, exibe o tipo como texto (não editável)', () => {
    setupMocks()
    renderWithQueryClient(
      <LancamentoForm
        modo="editar"
        defaultValues={{
          tipo: 'Despesa',
          empresaId: 'e1',
          categoriaId: 'c1',
          fornecedorId: 'f1',
          clienteId: '',
          valor: 100,
          dataCompetencia: '2026-08-01',
          vencimento: '2026-08-10',
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByRole('combobox', { name: /^tipo$/i })).not.toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
  })

  it('filtra o seletor de Veículo pela Empresa selecionada, e pede para selecionar a empresa antes', async () => {
    setupMocks()
    vi.mocked(useVeiculoOptions).mockReturnValue(
      mockOptions([
        { id: 'v1', empresaId: 'e1', nomeIdentificacao: 'Caminhão 01', tipo: 'Caminhão' },
        { id: 'v2', empresaId: 'e2', nomeIdentificacao: 'Caminhão 02', tipo: 'Caminhão' },
      ]),
    )
    const user = userEvent.setup()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    expect(screen.getByLabelText(/veículo/i)).toBeDisabled()

    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')

    const veiculoSelect = screen.getByLabelText(/veículo/i) as HTMLSelectElement
    expect(veiculoSelect).not.toBeDisabled()
    const opcoes = Array.from(veiculoSelect.options).map((o) => o.textContent)
    expect(opcoes).toContain('Caminhão 01 (Caminhão)')
    expect(opcoes).not.toContain('Caminhão 02 (Caminhão)')
  })

  it('cadastra um Fornecedor novo direto do autocomplete, sem sair da tela', async () => {
    setupMocks()
    const criarFornecedor = vi.fn().mockResolvedValue({ id: 'f9', nome: 'Fornecedor Novo Ltda' })
    vi.mocked(useCriarFornecedorRapido).mockReturnValue({ mutateAsync: criarFornecedor } as never)
    const user = userEvent.setup()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.click(screen.getByLabelText(/fornecedor/i))
    await user.type(screen.getByLabelText(/fornecedor/i), 'Fornecedor Novo Ltda')
    await user.click(await screen.findByRole('option', { name: /criar/i }))

    expect(criarFornecedor).toHaveBeenCalledWith('Fornecedor Novo Ltda')
    expect(await screen.findByLabelText(/fornecedor/i)).toHaveValue('Fornecedor Novo Ltda')
  })

  it('cadastra uma Categoria nova usando o tipo (Despesa/Receita) já selecionado no Lançamento', async () => {
    setupMocks()
    const criarCategoria = vi.fn().mockResolvedValue({ id: 'c9', nome: 'Pedágio', tipo: 'Despesa' })
    vi.mocked(useCriarCategoriaRapida).mockReturnValue({ mutateAsync: criarCategoria } as never)
    const user = userEvent.setup()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    // `tipo` nasce como "Despesa" (default do formulário) — não precisa trocar para testar isso.
    await user.click(screen.getByLabelText(/categoria/i))
    await user.type(screen.getByLabelText(/categoria/i), 'Pedágio')
    await user.click(await screen.findByRole('option', { name: /criar/i }))

    // A categoria nasce com o `tipo` do Lançamento (Despesa), sem pedir essa escolha de novo.
    expect(criarCategoria).toHaveBeenCalledWith({ nome: 'Pedágio', tipo: 'Despesa' })
  })

  it('cadastra uma Categoria nova com tipo Receita, quando o Lançamento é do tipo Receita', async () => {
    setupMocks()
    const criarCategoria = vi.fn().mockResolvedValue({ id: 'c9', nome: 'Serviço', tipo: 'Receita' })
    vi.mocked(useCriarCategoriaRapida).mockReturnValue({ mutateAsync: criarCategoria } as never)
    const user = userEvent.setup()
    renderWithQueryClient(
      <LancamentoForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar" />,
    )

    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Receita')
    await user.click(screen.getByLabelText(/categoria/i))
    await user.type(screen.getByLabelText(/categoria/i), 'Serviço')
    await user.click(await screen.findByRole('option', { name: /criar/i }))

    expect(criarCategoria).toHaveBeenCalledWith({ nome: 'Serviço', tipo: 'Receita' })
  })
})
