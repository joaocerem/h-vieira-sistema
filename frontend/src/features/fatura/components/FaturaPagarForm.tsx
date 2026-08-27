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

const schema = z.object({
  contaBancariaId: z.string().min(1, 'Conta bancária é obrigatória'),
  dataEfetiva: z.string().min(1, 'Data efetiva é obrigatória'),
})

export type FaturaPagarFormValues = z.output<typeof schema>

/**
 * `FaturaService#pagar` cria a Liquidação pelo valor já congelado em `valorCobrado` — não é um
 * campo deste formulário (o usuário só escolhe conta bancária e data efetiva do pagamento).
 */
export function FaturaPagarForm({
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: {
  onSubmit: (values: FaturaPagarFormValues) => void
  isSubmitting: boolean
  serverFieldErrors?: FieldError[]
}) {
  const { data: contasBancarias, isLoading: isLoadingContasBancarias } = useContaBancariaOptions()

  const form = useForm<FaturaPagarFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contaBancariaId: '', dataEfetiva: '' },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof FaturaPagarFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
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

      <FormField id="dataEfetiva" label="Data efetiva" error={form.formState.errors.dataEfetiva?.message}>
        <Input id="dataEfetiva" type="date" {...form.register('dataEfetiva')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Pagar fatura'}
        </Button>
      </div>
    </form>
  )
}
