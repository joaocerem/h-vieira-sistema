import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { FieldError } from '@/shared/api/errors'

// Todo campo monetário usa `z.coerce.number()`, nunca `register(..., { valueAsNumber: true })`
// — ver comentário equivalente em `LancamentoForm.tsx` (achado da sessão anterior sobre
// `.superRefine()` + `NaN`). Esta tela nem chega a precisar de `.superRefine()` — nenhuma
// exigência cruzada além do array `aplicacoes` ter ao menos um item, já expressa via `.min(1)`
// direto no array, sem efeito adicional.
const aplicacaoSchema = z.object({
  lancamentoFinanceiroId: z.string().min(1, 'Lançamento é obrigatório'),
  valorAplicado: z.coerce.number().positive('Valor aplicado deve ser um valor monetário positivo'),
})

const schema = z.object({
  tipo: z.enum(['Pagamento', 'Recebimento'], { message: 'Tipo é obrigatório' }),
  dataEfetiva: z.string().min(1, 'Data efetiva é obrigatória'),
  valor: z.coerce.number().positive('Valor deve ser um valor monetário positivo'),
  contaBancariaId: z.string().min(1, 'Conta bancária é obrigatória'),
  aplicacoes: z
    .array(aplicacaoSchema)
    .min(1, 'Informe ao menos um lançamento coberto por esta liquidação'),
})

// `z.output`, não `z.infer` — mesmo motivo de `LancamentoForm.tsx`: o tipo que `onSubmit`
// recebe, já com os campos monetários convertidos para `number` pelo `z.coerce`.
export type LiquidacaoFormValues = z.output<typeof schema>

/**
 * Liquidação Financeira é imutável desde a criação (D12) — este formulário só existe no modo
 * "criar", sem `modo`/`defaultValues` de edição (diferente dos demais formulários desta Fase).
 * O array `aplicacoes` reflete diretamente `docs/domain-model/11-aplicacao-de-liquidacao.md`:
 * não é uma tela própria de Aplicação de Liquidação (que não existe, nem no backend) — é a
 * lista de "quais Lançamentos esta Liquidação cobre, e em que valor", preenchida no mesmo ato
 * de criar a Liquidação, exatamente como o domínio descreve.
 */
export function LiquidacaoForm({
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: {
  onSubmit: (values: LiquidacaoFormValues) => void
  isSubmitting: boolean
  serverFieldErrors?: FieldError[]
}) {
  const { data: contasBancarias, isLoading: isLoadingContasBancarias } = useContaBancariaOptions()
  const { data: lancamentos, isLoading: isLoadingLancamentos } = useLancamentoOptions()

  // Três generics — ver comentário equivalente em `LancamentoForm.tsx`.
  const form = useForm<z.input<typeof schema>, unknown, LiquidacaoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'Pagamento',
      dataEfetiva: '',
      valor: undefined,
      contaBancariaId: '',
      aplicacoes: [{ lancamentoFinanceiroId: '', valorAplicado: undefined }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'aplicacoes' })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof LiquidacaoFormValues
      if (['tipo', 'dataEfetiva', 'valor', 'contaBancariaId'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  const lancamentoOptions = (lancamentos ?? []).map((lancamento) => ({
    value: lancamento.id,
    label: `${lancamento.tipo} • ${formatCurrency(lancamento.valor)} • vence ${formatDate(lancamento.vencimento)} • ${lancamento.statusFinanceiro}`,
  }))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
      <SelectField
        id="tipo"
        label="Tipo"
        placeholder="Selecione o tipo"
        options={[
          { value: 'Pagamento', label: 'Pagamento' },
          { value: 'Recebimento', label: 'Recebimento' },
        ]}
        error={form.formState.errors.tipo?.message}
        {...form.register('tipo')}
      />

      <FormField
        id="dataEfetiva"
        label="Data efetiva"
        error={form.formState.errors.dataEfetiva?.message}
      >
        <Input id="dataEfetiva" type="date" {...form.register('dataEfetiva')} />
      </FormField>

      <FormField id="valor" label="Valor total" error={form.formState.errors.valor?.message}>
        <Input id="valor" type="number" step="0.01" {...form.register('valor')} />
      </FormField>

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

      <div className="grid gap-2 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Lançamentos cobertos por esta liquidação</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ lancamentoFinanceiroId: '', valorAplicado: undefined as unknown as number })}
          >
            Adicionar lançamento
          </Button>
        </div>

        {form.formState.errors.aplicacoes?.message && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.aplicacoes.message}
          </p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
            <SelectField
              id={`aplicacoes.${index}.lancamentoFinanceiroId`}
              label={index === 0 ? 'Lançamento' : ''}
              placeholder={isLoadingLancamentos ? 'Carregando...' : 'Selecione o lançamento'}
              options={lancamentoOptions}
              error={form.formState.errors.aplicacoes?.[index]?.lancamentoFinanceiroId?.message}
              disabled={isLoadingLancamentos}
              {...form.register(`aplicacoes.${index}.lancamentoFinanceiroId`)}
            />

            <FormField
              id={`aplicacoes.${index}.valorAplicado`}
              label={index === 0 ? 'Valor aplicado' : ''}
              error={form.formState.errors.aplicacoes?.[index]?.valorAplicado?.message}
              className="w-36"
            >
              <Input
                id={`aplicacoes.${index}.valorAplicado`}
                type="number"
                step="0.01"
                {...form.register(`aplicacoes.${index}.valorAplicado`)}
              />
            </FormField>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Criar liquidação'}
        </Button>
      </div>
    </form>
  )
}
