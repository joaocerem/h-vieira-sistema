import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { CurrencyInput } from '@/shared/components/form/CurrencyInput'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useVeiculoOptions } from '@/shared/hooks/useVeiculoOptions'
import type { FieldError } from '@/shared/api/errors'

const TIPOS = ['Financiamento', 'Consórcio'] as const

/**
 * `tipo`, `empresaId`, `contaBancariaId`, `valorContratado`, `numeroParcelas` e
 * `dataVencimentoPrimeiraParcela` exigidos só no modo `criar` — imutáveis depois
 * (`AtualizarContratoFinanceiroRequest`, backend, não tem esses seis campos; mesmo padrão já
 * usado em `CartaoCreditoForm.tsx`/`CompraCartaoForm.tsx`). `taxa`/`grupoCota`/`contemplado`/
 * `veiculoId` ficam sempre opcionais no schema — a exigência condicional por `tipo` (não por
 * `modo`) é checada manualmente no `onSubmit`, não via `.superRefine()` (mesmo achado de Zod 4 +
 * `invalid_type` já documentado em `arquitetura-tecnica-frontend.md`, Seção 5).
 */
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    tipo: modo === 'criar' ? z.enum(TIPOS, { message: 'Tipo é obrigatório' }) : z.string().optional(),
    empresaId: modo === 'criar' ? z.string().min(1, 'Empresa é obrigatória') : z.string().optional(),
    contaBancariaId:
      modo === 'criar' ? z.string().min(1, 'Conta bancária é obrigatória') : z.string().optional(),
    fornecedorId: z.string().min(1, 'Fornecedor é obrigatório'),
    // `z.number()` direto, não `z.coerce.number()` — preenchido por `CurrencyInput`/
    // `Controller` (`shared/components/form/CurrencyInput.tsx`), que já entrega
    // `number | undefined`. `taxa`, abaixo, continua com `z.coerce.number()` — é uma taxa
    // percentual, não um valor monetário, então a máscara de moeda não se aplica a ela.
    valorContratado:
      modo === 'criar'
        ? z
            .number({ message: 'Valor contratado é obrigatório' })
            .positive('Valor contratado deve ser um valor monetário positivo')
        : z.number().optional(),
    numeroParcelas:
      modo === 'criar'
        ? z
            .number({ message: 'Número de parcelas é obrigatório' })
            .int()
            .positive('Número de parcelas deve ser um número inteiro positivo')
        : z.number().optional(),
    dataVencimentoPrimeiraParcela:
      modo === 'criar'
        ? z.string().min(1, 'Data de vencimento da primeira parcela é obrigatória')
        : z.string().optional(),
    taxa: z.coerce.number().optional(),
    grupoCota: z.string().optional(),
    contemplado: z.boolean().optional(),
    veiculoId: z.string().optional(),
  })
}

// `z.output`, não `z.infer` — vários campos variam de tipo de entrada (`z.coerce`/opcional)
// conforme o modo; mesmo motivo documentado em `CompraCartaoForm.tsx`.
export type ContratoFinanceiroFormValues = z.output<ReturnType<typeof buildSchema>>

export function ContratoFinanceiroForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: ContratoFinanceiroFormValues
  onSubmit: (values: ContratoFinanceiroFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresaOptions()
  const { data: contasBancarias, isLoading: isLoadingContasBancarias } = useContaBancariaOptions()
  const { data: fornecedores, isLoading: isLoadingFornecedores } = useFornecedorOptions()
  const { data: veiculos, isLoading: isLoadingVeiculos } = useVeiculoOptions()

  const schema = buildSchema(modo)

  const form = useForm<z.input<typeof schema>, unknown, ContratoFinanceiroFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      tipo: 'Financiamento',
      empresaId: '',
      contaBancariaId: '',
      fornecedorId: '',
      valorContratado: undefined,
      numeroParcelas: undefined,
      dataVencimentoPrimeiraParcela: '',
      taxa: undefined,
      grupoCota: '',
      contemplado: false,
      veiculoId: '',
    },
  })

  // No modo `editar`, `tipo` não é campo do formulário (imutável) — viaja como campo oculto,
  // preenchido a partir de `defaultValues.tipo`, só para as regras de exibição condicional
  // abaixo continuarem funcionando (mesmo padrão de `tipo` em `LancamentoForm.tsx`).
  const tipo = form.watch('tipo')

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof ContratoFinanceiroFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form, schema])

  function handleValidSubmit(values: ContratoFinanceiroFormValues) {
    // Exigência cruzada por `tipo` (Seção 4 do documento de domínio;
    // `ContratoFinanceiroService#validarCamposPorTipo`) — checada manualmente, só no modo
    // `criar` (no modo `editar`, `taxa`/`grupoCota` não são mais editáveis).
    if (modo === 'criar') {
      if (values.tipo === 'Financiamento' && !(values.taxa && values.taxa > 0)) {
        form.setError('taxa', { type: 'manual', message: 'Taxa é obrigatória quando tipo = Financiamento' })
        return
      }
      if (values.tipo === 'Consórcio' && !values.grupoCota?.trim()) {
        form.setError('grupoCota', { type: 'manual', message: 'Grupo-cota é obrigatório quando tipo = Consórcio' })
        return
      }
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
          options={TIPOS.map((valor) => ({ value: valor, label: valor }))}
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

      {modo === 'criar' && (
        <SelectField
          id="empresaId"
          label="Empresa"
          placeholder={isLoadingEmpresas ? 'Carregando...' : 'Selecione a empresa'}
          options={(empresas ?? []).map((empresa) => ({ value: empresa.id, label: empresa.nome }))}
          error={form.formState.errors.empresaId?.message}
          disabled={isLoadingEmpresas}
          {...form.register('empresaId')}
        />
      )}

      {modo === 'criar' && (
        <SelectField
          id="contaBancariaId"
          label="Conta bancária"
          placeholder={isLoadingContasBancarias ? 'Carregando...' : 'Selecione a conta bancária'}
          options={(contasBancarias ?? []).map((conta) => ({
            value: conta.id,
            label: `${conta.banco} — ${conta.apelido}`,
          }))}
          error={form.formState.errors.contaBancariaId?.message}
          disabled={isLoadingContasBancarias}
          {...form.register('contaBancariaId')}
        />
      )}

      <SelectField
        id="fornecedorId"
        label="Fornecedor (credor)"
        placeholder={isLoadingFornecedores ? 'Carregando...' : 'Selecione o fornecedor'}
        options={(fornecedores ?? []).map((fornecedor) => ({ value: fornecedor.id, label: fornecedor.nome }))}
        error={form.formState.errors.fornecedorId?.message}
        disabled={isLoadingFornecedores}
        {...form.register('fornecedorId')}
      />

      {modo === 'criar' && (
        <FormField
          id="valorContratado"
          label="Valor contratado"
          error={form.formState.errors.valorContratado?.message}
        >
          <Controller
            control={form.control}
            name="valorContratado"
            render={({ field }) => (
              <CurrencyInput
                id="valorContratado"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </FormField>
      )}

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

      {modo === 'criar' && (
        <FormField
          id="dataVencimentoPrimeiraParcela"
          label="Vencimento da 1ª parcela"
          error={form.formState.errors.dataVencimentoPrimeiraParcela?.message}
        >
          <Input id="dataVencimentoPrimeiraParcela" type="date" {...form.register('dataVencimentoPrimeiraParcela')} />
        </FormField>
      )}

      {modo === 'criar' && tipo === 'Financiamento' && (
        <FormField id="taxa" label="Taxa (%)" error={form.formState.errors.taxa?.message}>
          <Input id="taxa" type="number" step="0.01" {...form.register('taxa')} />
        </FormField>
      )}

      {modo === 'criar' && tipo === 'Consórcio' && (
        <FormField id="grupoCota" label="Grupo-cota" error={form.formState.errors.grupoCota?.message}>
          <Input id="grupoCota" placeholder="ex.: Grupo 123 / Cota 45" {...form.register('grupoCota')} />
        </FormField>
      )}

      {modo === 'criar' && tipo === 'Consórcio' && (
        <div className="flex items-center gap-2">
          <input
            id="contemplado"
            type="checkbox"
            className="h-4 w-4 rounded border border-input"
            {...form.register('contemplado')}
          />
          <Label htmlFor="contemplado">Já contemplado</Label>
        </div>
      )}

      {/*
        Veículo só se aplica a Consórcio contemplado — no modo criar, depende do checkbox
        marcado nesta mesma tela; no modo editar, depende do estado real já persistido
        (`defaultValues.tipo`/`defaultValues.contemplado`, já que `tipo` não é mais escolhido
        aqui e `contemplado` só muda pela ação dedicada `contemplar`, fora deste formulário).
        Sem filtro por Empresa (mesmo motivo já documentado em `CompraCartaoForm.tsx`) —
        `ContratoFinanceiroService` não valida consistência entre `veiculoId` e a Empresa do
        Contrato.
      */}
      {((modo === 'criar' && tipo === 'Consórcio' && form.watch('contemplado')) ||
        (modo === 'editar' && defaultValues?.tipo === 'Consórcio' && defaultValues?.contemplado === true)) && (
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
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
