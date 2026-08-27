import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CurrencyInput } from '@/shared/components/form/CurrencyInput'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'

// Campo monetário via `CurrencyInput`/`Controller` (`shared/components/form/CurrencyInput.tsx`)
// com `allowNegative` — diferente de Lançamento/Liquidação, o sinal é significativo aqui
// (saída/entrada — ver `docs/modelagem-fisica/12-conciliacao-bancaria.md`). Sem
// `.positive()`/mensagem de obrigatoriedade: o backend não impõe positividade nem não-zero
// (sem `CHECK`) — replicar uma exigência que o domínio não tem seria antecipar regra. Campo em
// branco (`undefined`, o que `CurrencyInput` entrega quando vazio) vira `0` via `.transform()`,
// preservando o mesmo comportamento que `z.coerce.number()` já tinha (string vazia coagia para
// `0`, nunca gerava erro).
const itemSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().optional().transform((valor) => valor ?? 0),
})

const schema = z.object({
  contaBancariaId: z.string().min(1, 'Conta bancária é obrigatória'),
  itens: z.array(itemSchema).min(1, 'Informe ao menos um item para importar'),
})

// `z.output`, não `z.infer` — mesmo motivo de `LiquidacaoForm.tsx`/`LancamentoForm.tsx`.
export type ImportarMovimentacoesFormValues = z.output<typeof schema>

/**
 * Lote de importação de extrato — Movimentação Bancária nunca é digitada livremente como um
 * fato isolado (`docs/domain-model/12-movimentacao-bancaria.md`, Seção 4), sempre em lote;
 * mesmo padrão de array dinâmico já usado para `aplicacoes` em `LiquidacaoForm.tsx`.
 */
export function ImportarMovimentacoesForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: ImportarMovimentacoesFormValues) => void
  isSubmitting: boolean
}) {
  const { data: contasBancarias, isLoading: isLoadingContasBancarias } = useContaBancariaOptions()

  const form = useForm<z.input<typeof schema>, unknown, ImportarMovimentacoesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contaBancariaId: '',
      itens: [{ data: '', descricao: '', valor: undefined }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'itens' })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-3xl gap-4">
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
          <span className="text-sm font-medium">Itens do extrato</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ data: '', descricao: '', valor: undefined })}
          >
            Adicionar item
          </Button>
        </div>

        {form.formState.errors.itens?.message && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.itens.message}
          </p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_2fr_1fr_auto] items-end gap-2">
            <FormField
              id={`itens.${index}.data`}
              label={index === 0 ? 'Data' : ''}
              error={form.formState.errors.itens?.[index]?.data?.message}
            >
              <Input id={`itens.${index}.data`} type="date" {...form.register(`itens.${index}.data`)} />
            </FormField>

            <FormField
              id={`itens.${index}.descricao`}
              label={index === 0 ? 'Descrição' : ''}
              error={form.formState.errors.itens?.[index]?.descricao?.message}
            >
              <Input id={`itens.${index}.descricao`} {...form.register(`itens.${index}.descricao`)} />
            </FormField>

            <FormField
              id={`itens.${index}.valor`}
              label={index === 0 ? 'Valor' : ''}
              error={form.formState.errors.itens?.[index]?.valor?.message}
            >
              <Controller
                control={form.control}
                name={`itens.${index}.valor`}
                render={({ field }) => (
                  <CurrencyInput
                    id={`itens.${index}.valor`}
                    value={field.value}
                    onValueChange={field.onChange}
                    allowNegative
                  />
                )}
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

      <p className="text-sm text-muted-foreground">
        Valor negativo representa saída (pagamento); positivo, entrada (recebimento) — mesma
        convenção de sinal do extrato bancário (fora do escopo do conceitual, decisão de
        representação técnica já registrada em `docs/modelagem-fisica/12-conciliacao-bancaria.md`).
      </p>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Importando...' : 'Importar movimentações'}
        </Button>
      </div>
    </form>
  )
}
