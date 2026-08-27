import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import type { FieldError } from '@/shared/api/errors'

// Sem validação de faixa (1-31) de propósito — o backend também não valida
// (`domain/cartaocredito/CartaoCredito.java`: "evita inventar regra de negócio", já que o
// documento de domínio marca essa faixa como inferência não confirmada). Só exige número
// inteiro presente, mesmo critério do backend.
//
// `contaBancariaId` exigido só no modo `criar` — campo required/optional trocado diretamente
// no shape do schema, não via `.superRefine()`: em Zod 4, o efeito de `superRefine` não roda
// de forma confiável quando o objeto já tem outro campo com erro de tipo — e é exatamente o
// caso aqui, quando `diaFechamento`/`diaVencimento` ficam vazios (`NaN`, de `valueAsNumber`)
// ao mesmo tempo que `contaBancariaId`. Achado durante a implementação desta feature,
// confirmado isolando o resolver fora do componente — registrado no relatório desta sessão.
// `FormValues` é inferido do próprio schema (`z.infer`), nunca escrito à mão — evita o schema
// e o tipo do formulário divergirem entre os dois modos.
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    contaBancariaId:
      modo === 'criar'
        ? z.string().min(1, 'Conta bancária é obrigatória')
        : z.string().optional(),
    banco: z.string().trim().min(1, 'Banco é obrigatório'),
    apelido: z.string().trim().min(1, 'Apelido é obrigatório'),
    // `z.number()` puro, não `z.coerce.number()` — coerce faz o tipo de entrada do resolver
    // ficar `unknown`. A conversão de string para número é feita pelo próprio react-hook-form
    // (`valueAsNumber: true` no `register`, abaixo), não pelo Zod.
    diaFechamento: z.number({ message: 'Dia de fechamento é obrigatório' }).int(),
    diaVencimento: z.number({ message: 'Dia de vencimento é obrigatório' }).int(),
  })
}

export type CartaoCreditoFormValues = z.infer<ReturnType<typeof buildSchema>>

export function CartaoCreditoForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: CartaoCreditoFormValues
  onSubmit: (values: CartaoCreditoFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: contasBancarias, isLoading: isLoadingContasBancarias } = useContaBancariaOptions()

  const form = useForm<CartaoCreditoFormValues>({
    resolver: zodResolver(buildSchema(modo)),
    defaultValues: defaultValues ?? {
      contaBancariaId: '',
      banco: '',
      apelido: '',
      diaFechamento: undefined,
      diaVencimento: undefined,
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof CartaoCreditoFormValues
      if (['contaBancariaId', 'banco', 'apelido', 'diaFechamento', 'diaVencimento'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
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

      <FormField id="banco" label="Banco" error={form.formState.errors.banco?.message}>
        <Input id="banco" autoFocus={modo === 'editar'} {...form.register('banco')} />
      </FormField>

      <FormField id="apelido" label="Apelido" error={form.formState.errors.apelido?.message}>
        <Input id="apelido" placeholder="ex.: Cartão Corporativo" {...form.register('apelido')} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="diaFechamento"
          label="Dia de fechamento"
          error={form.formState.errors.diaFechamento?.message}
        >
          <Input
            id="diaFechamento"
            type="number"
            {...form.register('diaFechamento', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          id="diaVencimento"
          label="Dia de vencimento"
          error={form.formState.errors.diaVencimento?.message}
        >
          <Input
            id="diaVencimento"
            type="number"
            {...form.register('diaVencimento', { valueAsNumber: true })}
          />
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
