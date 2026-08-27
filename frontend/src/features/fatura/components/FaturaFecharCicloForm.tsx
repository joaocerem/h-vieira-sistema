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
import type { FieldError } from '@/shared/api/errors'

const schema = z.object({
  cartaoId: z.string().min(1, 'Cartão é obrigatório'),
  // `input type="month"` já entrega o valor no formato `AAAA-MM` esperado pelo backend
  // (`FaturaService#parseCiclo`, `YearMonth.parse`) — sem transformação adicional.
  ciclo: z.string().min(1, 'Ciclo é obrigatório'),
  // `z.number()` direto, não `z.coerce.number()` — preenchido por `CurrencyInput`/`Controller`
  // (`shared/components/form/CurrencyInput.tsx`), que já entrega `number | undefined`.
  valorCobrado: z
    .number({ message: 'Valor cobrado é obrigatório' })
    .positive('Valor cobrado deve ser um valor monetário positivo'),
})

export type FaturaFecharCicloFormValues = z.infer<typeof schema>

/**
 * A Fatura só nasce pelo fechamento do ciclo — sem campo/tela de "criação" livre
 * (`docs/domain-model/19-fatura.md`, Seção 1).
 */
export function FaturaFecharCicloForm({
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: {
  onSubmit: (values: FaturaFecharCicloFormValues) => void
  isSubmitting: boolean
  serverFieldErrors?: FieldError[]
}) {
  const { data: cartoes, isLoading: isLoadingCartoes } = useCartaoCreditoOptions()

  const form = useForm<FaturaFecharCicloFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cartaoId: '', ciclo: '', valorCobrado: undefined },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof FaturaFecharCicloFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
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

      <FormField id="ciclo" label="Ciclo" error={form.formState.errors.ciclo?.message}>
        <Input id="ciclo" type="month" {...form.register('ciclo')} />
      </FormField>

      <FormField
        id="valorCobrado"
        label="Valor cobrado"
        error={form.formState.errors.valorCobrado?.message}
      >
        <Controller
          control={form.control}
          name="valorCobrado"
          render={({ field }) => (
            <CurrencyInput id="valorCobrado" value={field.value} onValueChange={field.onChange} />
          )}
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Fechando...' : 'Fechar ciclo'}
        </Button>
      </div>
    </form>
  )
}
