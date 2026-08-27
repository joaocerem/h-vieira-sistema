import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContratoFinanceiroForm } from './ContratoFinanceiroForm'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'

vi.mock('@/shared/hooks/useEmpresaOptions', () => ({ useEmpresaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useContaBancariaOptions', () => ({ useContaBancariaOptions: vi.fn() }))
vi.mock('@/shared/hooks/useFornecedorOptions', () => ({ useFornecedorOptions: vi.fn() }))
vi.mock('@/shared/hooks/useVeiculoOptions', () => ({ useVeiculoOptions: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useEmpresaOptions).mockReturnValue({
    data: [{ id: 'e1', nome: 'H. Vieira Terraplanagem' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useEmpresaOptions>)
  vi.mocked(useContaBancariaOptions).mockReturnValue({
    data: [{ id: 'cb1', banco: 'Itaú', apelido: 'Conta Movimento' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useContaBancariaOptions>)
  vi.mocked(useFornecedorOptions).mockReturnValue({
    data: [{ id: 'f1', nome: 'Banco XYZ' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useFornecedorOptions>)
  vi.mocked(useVeiculoOptions).mockReturnValue({
    data: [{ id: 'v1', empresaId: 'e1', nomeIdentificacao: 'Caminhão 01', tipo: 'Caminhão' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useVeiculoOptions>)
}

describe('ContratoFinanceiroForm', () => {
  it('exige tipo, empresa, conta bancária, fornecedor, valor, número de parcelas e vencimento no modo criar', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(
      <ContratoFinanceiroForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar contrato" />,
    )

    // `tipo` já nasce pré-selecionado como "Financiamento" (mesmo padrão de `LancamentoForm`/
    // `LiquidacaoForm` para campos enum obrigatórios de dois valores) — não fica em branco, então
    // não há mensagem "obrigatório" para ele nesse fluxo.
    await user.click(screen.getByRole('button', { name: /criar contrato/i }))

    expect(await screen.findByText(/empresa é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/conta bancária é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/fornecedor é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/valor contratado é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/data de vencimento da primeira parcela é obrigatória/i)).toBeInTheDocument()
    // A checagem manual de `taxa` só roda depois que o Zod validar o resto — não aparece
    // junto dos erros acima nesse mesmo submit; coberta isoladamente no teste seguinte.
  })

  it('exige taxa quando tipo = Financiamento (checagem manual, não Zod)', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <ContratoFinanceiroForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar contrato" />,
    )

    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Financiamento')
    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await user.selectOptions(screen.getByLabelText(/conta bancária/i), 'cb1')
    await user.selectOptions(screen.getByLabelText(/fornecedor/i), 'f1')
    await user.type(screen.getByLabelText(/valor contratado/i), '10000')
    await user.clear(screen.getByLabelText(/número de parcelas/i))
    await user.type(screen.getByLabelText(/número de parcelas/i), '12')
    await user.type(screen.getByLabelText(/vencimento da 1ª parcela/i), '2026-09-10')
    await user.click(screen.getByRole('button', { name: /criar contrato/i }))

    expect(await screen.findByText(/taxa é obrigatória quando tipo = financiamento/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mostra grupo-cota e "já contemplado" só quando tipo = Consórcio, e o veículo só quando marcado', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(
      <ContratoFinanceiroForm modo="criar" onSubmit={vi.fn()} isSubmitting={false} submitLabel="Criar contrato" />,
    )

    // `tipo` já nasce "Financiamento" (default) — `taxa` visível, grupo-cota/contemplado não.
    expect(screen.getByLabelText(/^taxa/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/grupo-cota/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/já contemplado/i)).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Consórcio')

    expect(screen.getByLabelText(/grupo-cota/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/já contemplado/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^taxa/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/veículo/i)).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/já contemplado/i))

    expect(screen.getByLabelText(/veículo/i)).toBeInTheDocument()
  })

  it('não mostra os campos imutáveis (tipo/empresa/conta/valor/parcelas/vencimento) no modo editar', () => {
    setupMocks()
    renderWithQueryClient(
      <ContratoFinanceiroForm
        modo="editar"
        defaultValues={{
          tipo: 'Financiamento',
          empresaId: undefined,
          contaBancariaId: undefined,
          fornecedorId: 'f1',
          valorContratado: undefined,
          numeroParcelas: undefined,
          dataVencimentoPrimeiraParcela: undefined,
          taxa: 1.5,
          grupoCota: '',
          contemplado: false,
          veiculoId: '',
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.queryByLabelText(/^empresa$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/conta bancária/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/valor contratado/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/número de parcelas/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/fornecedor/i)).toBeInTheDocument()
    expect(screen.getByText('Financiamento')).toBeInTheDocument()
  })

  it('mostra o campo veículo no modo editar quando o contrato já é Consórcio contemplado', () => {
    setupMocks()
    renderWithQueryClient(
      <ContratoFinanceiroForm
        modo="editar"
        defaultValues={{
          tipo: 'Consórcio',
          empresaId: undefined,
          contaBancariaId: undefined,
          fornecedorId: 'f1',
          valorContratado: undefined,
          numeroParcelas: undefined,
          dataVencimentoPrimeiraParcela: undefined,
          taxa: undefined,
          grupoCota: 'Grupo 10 / Cota 5',
          contemplado: true,
          veiculoId: '',
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Salvar"
      />,
    )

    expect(screen.getByLabelText(/veículo/i)).toBeInTheDocument()
  })

  it('envia os valores preenchidos para um Consórcio contemplado, incluindo veículo', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(
      <ContratoFinanceiroForm modo="criar" onSubmit={onSubmit} isSubmitting={false} submitLabel="Criar contrato" />,
    )

    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'Consórcio')
    await user.selectOptions(screen.getByLabelText(/empresa/i), 'e1')
    await user.selectOptions(screen.getByLabelText(/conta bancária/i), 'cb1')
    await user.selectOptions(screen.getByLabelText(/fornecedor/i), 'f1')
    // Máscara de dígitos: "3000000" → R$ 30.000,00, mesmo comportamento de caixa eletrônico.
    await user.type(screen.getByLabelText(/valor contratado/i), '3000000')
    await user.clear(screen.getByLabelText(/número de parcelas/i))
    await user.type(screen.getByLabelText(/número de parcelas/i), '60')
    await user.type(screen.getByLabelText(/vencimento da 1ª parcela/i), '2026-09-10')
    await user.type(screen.getByLabelText(/grupo-cota/i), 'Grupo 10 / Cota 5')
    await user.click(screen.getByLabelText(/já contemplado/i))
    await user.selectOptions(screen.getByLabelText(/veículo/i), 'v1')
    await user.click(screen.getByRole('button', { name: /criar contrato/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      tipo: 'Consórcio',
      empresaId: 'e1',
      contaBancariaId: 'cb1',
      fornecedorId: 'f1',
      valorContratado: 30000,
      numeroParcelas: 60,
      dataVencimentoPrimeiraParcela: '2026-09-10',
      grupoCota: 'Grupo 10 / Cota 5',
      contemplado: true,
      veiculoId: 'v1',
    })
  })
})
