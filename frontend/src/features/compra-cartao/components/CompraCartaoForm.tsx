import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CurrencyInput } from '@/shared/components/form/CurrencyInput'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'
import type { FieldError } from '@/shared/api/errors'

const CLASSIFICACOES = [
  'Terraplanagem',
  'Fora da Operação',
  'Transferência Interna',
  'Retirada do Patrão',
  'Não Classificada',
] as const

/**
 * `cartaoId`, `valor` e `numeroParcelas` exigidos só no modo `criar` — imutáveis depois
 * (`AtualizarCompraCartaoRequest`, backend, não tem esses três campos; mesmo padrão já usado em
 * `CartaoCreditoForm.tsx` para `contaBancariaId`). `valor` via `z.number()` direto, não
 * `z.coerce.number()` — preenchido por `CurrencyInput`/`Controller`
 * (`shared/components/form/CurrencyInput.tsx`), que já entrega `number | undefined`, nunca uma
 * string. `numeroParcelas` segue o mesmo padrão de `diaFechamento`/`diaVencimento` de
 * `CartaoCreditoForm.tsx` (`z.number().int()` + `valueAsNumber: true`, não `z.coerce`) — é uma
 * contagem inteira, não um valor monetário.
 */
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    cartaoId: modo === 'criar' ? z.string().min(1, 'Cartão é obrigatório') : z.string().optional(),
    fornecedorId: z.string().min(1, 'Fornecedor é obrigatório'),
    valor:
      modo === 'criar'
        ? z
            .number({ message: 'Valor é obrigatório' })
            .positive('Valor deve ser um valor monetário positivo')
        : z.number().optional(),
    data: z.string().min(1, 'Data é obrigatória'),
    categoriaId: z.string().min(1, 'Categoria é obrigatória'),
    classificacao: z.enum(CLASSIFICACOES, { message: 'Classificação é obrigatória' }),
    obraId: z.string().optional(),
    veiculoId: z.string().optional(),
    numeroParcelas:
      modo === 'criar'
        ? z.number({ message: 'Número de parcelas é obrigatório' }).int().positive('Número de parcelas deve ser um número inteiro positivo')
        : z.number().optional(),
  })
}

// `z.output`, não `z.infer` — `cartaoId`/`numeroParcelas`/`valor` variam entre obrigatório e
// opcional conforme o modo (ternário no schema); `z.output` deixa isso explícito no tipo.
export type CompraCartaoFormValues = z.output<ReturnType<typeof buildSchema>>

export function CompraCartaoForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: CompraCartaoFormValues
  onSubmit: (values: CompraCartaoFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: cartoes, isLoading: isLoadingCartoes } = useCartaoCreditoOptions()
  const { data: fornecedores, isLoading: isLoadingFornecedores } = useFornecedorOptions()
  const { data: categorias, isLoading: isLoadingCategorias } = useCategoriaOptions()
  const { data: obras, isLoading: isLoadingObras } = useObraOptions()
  const { data: veiculos, isLoading: isLoadingVeiculos } = useVeiculoOptions()

  const schema = buildSchema(modo)

  const form = useForm<CompraCartaoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      cartaoId: '',
      fornecedorId: '',
      valor: undefined,
      data: '',
      categoriaId: '',
      classificacao: 'Não Classificada',
      obraId: '',
      veiculoId: '',
      numeroParcelas: 1,
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof CompraCartaoFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form, schema])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      {modo === 'criar' && (
        <SelectField
          id="cartaoId"
          label="Cartão"
          placeholder={isLoadingCartoes ? 'Carregando...' : 'Selecione o cartão'}
          options={(cartoes ?? []).map((cartao) => ({
            value: cartao.id,
            label: `${cartao.banco} — ${cartao.apelido}`,
          }))}
          error={form.formState.errors.cartaoId?.message}
          disabled={isLoadingCartoes}
          {...form.register('cartaoId')}
        />
      )}

      <SelectField
        id="fornecedorId"
        label="Fornecedor"
        placeholder={isLoadingFornecedores ? 'Carregando...' : 'Selecione o fornecedor'}
        options={(fornecedores ?? []).map((fornecedor) => ({ value: fornecedor.id, label: fornecedor.nome }))}
        error={form.formState.errors.fornecedorId?.message}
        disabled={isLoadingFornecedores}
        {...form.register('fornecedorId')}
      />

      {modo === 'criar' && (
        <FormField id="valor" label="Valor" error={form.formState.errors.valor?.message}>
          <Controller
            control={form.control}
            name="valor"
            render={({ field }) => (
              <CurrencyInput id="valor" value={field.value} onValueChange={field.onChange} />
            )}
          />
        </FormField>
      )}

      <FormField id="data" label="Data" error={form.formState.errors.data?.message}>
        <Input id="data" type="date" {...form.register('data')} />
      </FormField>

      <SelectField
        id="categoriaId"
        label="Categoria"
        placeholder={isLoadingCategorias ? 'Carregando...' : 'Selecione a categoria'}
        options={(categorias ?? []).map((categoria) => ({
          value: categoria.id,
          label: `${categoria.nome} (${categoria.tipo})`,
        }))}
        error={form.formState.errors.categoriaId?.message}
        disabled={isLoadingCategorias}
        {...form.register('categoriaId')}
      />

      <SelectField
        id="classificacao"
        label="Classificação"
        placeholder="Selecione a classificação"
        options={CLASSIFICACOES.map((valor) => ({ value: valor, label: valor }))}
        error={form.formState.errors.classificacao?.message}
        {...form.register('classificacao')}
      />

      <SelectField
        id="obraId"
        label="Obra"
        placeholder={isLoadingObras ? 'Carregando...' : 'Sem obra atribuída'}
        options={(obras ?? []).map((obra) => ({ value: obra.id, label: obra.nome }))}
        error={form.formState.errors.obraId?.message}
        disabled={isLoadingObras}
        {...form.register('obraId')}
      />

      {/*
        Sem filtro por Empresa (diferente de `LancamentoForm.tsx`) — `CompraCartaoService`
        (`criar`/`atualizar`) não valida consistência entre `veiculoId` e a Empresa do Cartão;
        `Compra Cartão` não tem campo `empresaId` próprio (é derivado só depois, na geração do
        Lançamento, via Cartão→Conta Bancária→Empresa). Filtrar aqui seria inventar uma regra
        que o backend não tem.
      */}
      <SelectField
        id="veiculoId"
        label="Veículo"
        placeholder={isLoadingVeiculos ? 'Carregando...' : 'Sem veículo atribuído'}
        options={(veiculos ?? []).map((veiculo) => ({
          value: veiculo.id,
          label: `${veiculo.nomeIdentificacao} (${veiculo.tipo})`,
        }))}
        error={form.formState.errors.veiculoId?.message}
        disabled={isLoadingVeiculos}
        {...form.register('veiculoId')}
      />

      {modo === 'criar' && (
        <FormField
          id="numeroParcelas"
          label="Número de parcelas"
          error={form.formState.errors.numeroParcelas?.message}
        >
          <Input
            id="numeroParcelas"
            type="number"
            min={1}
            step={1}
            {...form.register('numeroParcelas', { valueAsNumber: true })}
          />
        </FormField>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
