import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CurrencyInput } from '@/shared/components/form/CurrencyInput'
import { AutocompleteField, type AutocompleteOption } from '@/shared/components/form/AutocompleteField'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'
import { useCriarFornecedorRapido } from '@/shared/hooks/useCriarFornecedorRapido'
import { useCriarCategoriaRapida } from '@/shared/hooks/useCriarCategoriaRapida'
import type { FieldError } from '@/shared/api/errors'

// `valor` usa `z.number()` direto (não `z.coerce.number()`) porque é preenchido via
// `CurrencyInput`/`Controller` (`shared/components/form/CurrencyInput.tsx`), que já entrega
// `number | undefined` — nunca uma string, nunca `NaN`. Isso também elimina a distinção
// `z.input`/`z.output` que `z.coerce` exigia no `useForm` abaixo (achado da sessão anterior,
// `CartaoCreditoForm.tsx`): entrada e saída do formulário agora têm o mesmo tipo. A exigência
// cruzada fornecedor×cliente (abaixo) continua fora do Zod, feita manualmente no `onSubmit` —
// mesmo motivo de sempre (`.superRefine()` deixa de rodar quando outro campo já tem erro
// `invalid_type`, e `valor` ausente é exatamente esse caso).
const schema = z.object({
  tipo: z.enum(['Despesa', 'Receita'], { message: 'Tipo é obrigatório' }),
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  fornecedorId: z.string().optional(),
  clienteId: z.string().optional(),
  obraId: z.string().optional(),
  veiculoId: z.string().optional(),
  valor: z
    .number({ message: 'Valor é obrigatório' })
    .positive('Valor deve ser um valor monetário positivo'),
  dataCompetencia: z.string().min(1, 'Data de competência é obrigatória'),
  vencimento: z.string().min(1, 'Vencimento é obrigatório'),
  // Campos livres (decisão de negócio: Lançamento passa a registrar descrição e
  // documento/NF) — nenhum dos dois é obrigatório, o backend aceita ambos `null`.
  descricao: z.string().optional(),
  documento: z.string().optional(),
})

export type LancamentoFormValues = z.infer<typeof schema>

/**
 * `tipo` só é escolhido no modo `criar` — imutável depois (`AtualizarLancamentoFinanceiroRequest`,
 * backend, não tem esse campo). No modo `editar`, viaja como campo oculto (não `disabled` —
 * `disabled` faria o react-hook-form excluir o valor do submit) para as regras de exibição
 * condicional (fornecedor × cliente) continuarem funcionando; exibido como texto, não como
 * campo editável.
 */
export function LancamentoForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: LancamentoFormValues
  onSubmit: (values: LancamentoFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresaOptions()
  const { data: categorias, isLoading: isLoadingCategorias } = useCategoriaOptions()
  const { data: fornecedores, isLoading: isLoadingFornecedores } = useFornecedorOptions()
  const { data: clientes, isLoading: isLoadingClientes } = useClienteOptions()
  const { data: obras, isLoading: isLoadingObras } = useObraOptions()
  const { data: veiculos, isLoading: isLoadingVeiculos } = useVeiculoOptions()
  const criarFornecedorRapido = useCriarFornecedorRapido()
  const criarCategoriaRapida = useCriarCategoriaRapida()

  const form = useForm<LancamentoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      tipo: 'Despesa',
      empresaId: '',
      categoriaId: '',
      fornecedorId: '',
      clienteId: '',
      obraId: '',
      veiculoId: '',
      valor: undefined,
      dataCompetencia: '',
      vencimento: '',
      descricao: '',
      documento: '',
    },
  })

  const tipo = form.watch('tipo')
  const empresaId = form.watch('empresaId')

  // `veiculoId`, quando informado, precisa pertencer à mesma Empresa do Lançamento
  // (`LancamentoFinanceiroService.resolverEValidarObraEVeiculo`, backend) — filtrado aqui só
  // para experiência de uso; quem valida de fato continua sendo o backend.
  const veiculosDaEmpresa = (veiculos ?? []).filter((veiculo) => veiculo.empresaId === empresaId)

  async function handleQuickCreateFornecedor(nome: string): Promise<AutocompleteOption> {
    const fornecedor = await criarFornecedorRapido.mutateAsync(nome)
    return { value: fornecedor.id, label: fornecedor.nome }
  }

  async function handleQuickCreateCategoria(nome: string): Promise<AutocompleteOption> {
    const categoria = await criarCategoriaRapida.mutateAsync({ nome, tipo })
    return { value: categoria.id, label: `${categoria.nome} (${categoria.tipo})` }
  }

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof LancamentoFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  function handleValidSubmit(values: LancamentoFormValues) {
    // Exigência cruzada (regra 66/documento de domínio) — checada manualmente, não via Zod
    // (ver comentário acima do schema).
    if (values.tipo === 'Despesa' && !values.fornecedorId) {
      form.setError('fornecedorId', {
        type: 'manual',
        message: 'Fornecedor é obrigatório para Lançamento do tipo Despesa',
      })
      return
    }
    if (values.tipo === 'Receita' && !values.clienteId) {
      form.setError('clienteId', {
        type: 'manual',
        message: 'Cliente é obrigatório para Lançamento do tipo Receita',
      })
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit)} className="grid max-w-md gap-4">
      {modo === 'criar' ? (
        <SelectField
          id="tipo"
          label="Tipo"
          placeholder="Selecione o tipo"
          options={[
            { value: 'Despesa', label: 'Despesa' },
            { value: 'Receita', label: 'Receita' },
          ]}
          error={form.formState.errors.tipo?.message}
          {...form.register('tipo')}
        />
      ) : (
        <FormField id="tipo-display" label="Tipo">
          <input type="hidden" {...form.register('tipo')} />
          <p id="tipo-display" className="text-sm">
            {defaultValues?.tipo}
          </p>
        </FormField>
      )}

      <SelectField
        id="empresaId"
        label="Empresa"
        placeholder={isLoadingEmpresas ? 'Carregando...' : 'Selecione a empresa'}
        options={(empresas ?? []).map((empresa) => ({ value: empresa.id, label: empresa.nome }))}
        error={form.formState.errors.empresaId?.message}
        disabled={isLoadingEmpresas}
        {...form.register('empresaId')}
      />

      <Controller
        control={form.control}
        name="categoriaId"
        render={({ field }) => (
          <AutocompleteField
            id="categoriaId"
            label="Categoria"
            value={field.value}
            onValueChange={field.onChange}
            options={(categorias ?? []).map((categoria) => ({
              value: categoria.id,
              label: `${categoria.nome} (${categoria.tipo})`,
            }))}
            placeholder="Digite para buscar ou criar uma categoria"
            isLoading={isLoadingCategorias}
            error={form.formState.errors.categoriaId?.message}
            onQuickCreate={handleQuickCreateCategoria}
          />
        )}
      />

      {tipo === 'Despesa' && (
        <Controller
          control={form.control}
          name="fornecedorId"
          render={({ field }) => (
            <AutocompleteField
              id="fornecedorId"
              label="Fornecedor"
              value={field.value ?? ''}
              onValueChange={field.onChange}
              options={(fornecedores ?? []).map((fornecedor) => ({
                value: fornecedor.id,
                label: fornecedor.nome,
              }))}
              placeholder="Digite para buscar ou criar um fornecedor"
              isLoading={isLoadingFornecedores}
              error={form.formState.errors.fornecedorId?.message}
              onQuickCreate={handleQuickCreateFornecedor}
            />
          )}
        />
      )}

      {tipo === 'Receita' && (
        <SelectField
          id="clienteId"
          label="Cliente"
          placeholder={isLoadingClientes ? 'Carregando...' : 'Selecione o cliente'}
          options={(clientes ?? []).map((cliente) => ({ value: cliente.id, label: cliente.nome }))}
          error={form.formState.errors.clienteId?.message}
          disabled={isLoadingClientes}
          {...form.register('clienteId')}
        />
      )}

      <SelectField
        id="obraId"
        label="Obra"
        placeholder={isLoadingObras ? 'Carregando...' : 'Sem obra atribuída'}
        options={(obras ?? []).map((obra) => ({ value: obra.id, label: obra.nome }))}
        error={form.formState.errors.obraId?.message}
        disabled={isLoadingObras}
        {...form.register('obraId')}
      />

      <SelectField
        id="veiculoId"
        label="Veículo"
        placeholder={
          !empresaId
            ? 'Selecione a empresa primeiro'
            : isLoadingVeiculos
              ? 'Carregando...'
              : 'Sem veículo atribuído'
        }
        options={veiculosDaEmpresa.map((veiculo) => ({
          value: veiculo.id,
          label: `${veiculo.nomeIdentificacao} (${veiculo.tipo})`,
        }))}
        error={form.formState.errors.veiculoId?.message}
        disabled={isLoadingVeiculos || !empresaId}
        {...form.register('veiculoId')}
      />

      <FormField id="valor" label="Valor" error={form.formState.errors.valor?.message}>
        <Controller
          control={form.control}
          name="valor"
          render={({ field }) => (
            <CurrencyInput id="valor" value={field.value} onValueChange={field.onChange} />
          )}
        />
      </FormField>

      <FormField
        id="descricao"
        label="Descrição"
        error={form.formState.errors.descricao?.message}
      >
        <Input id="descricao" type="text" {...form.register('descricao')} />
      </FormField>

      <FormField
        id="documento"
        label="Documento / NF"
        error={form.formState.errors.documento?.message}
      >
        <Input id="documento" type="text" {...form.register('documento')} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="dataCompetencia"
          label="Data de competência"
          error={form.formState.errors.dataCompetencia?.message}
        >
          <Input id="dataCompetencia" type="date" {...form.register('dataCompetencia')} />
        </FormField>

        <FormField
          id="vencimento"
          label="Vencimento"
          error={form.formState.errors.vencimento?.message}
        >
          <Input id="vencimento" type="date" {...form.register('vencimento')} />
        </FormField>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
