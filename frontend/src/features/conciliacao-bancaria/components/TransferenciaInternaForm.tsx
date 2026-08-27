import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CurrencyInput } from '@/shared/components/form/CurrencyInput'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useMovimentacoes } from '../hooks/useMovimentacoes'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { FieldError } from '@/shared/api/errors'

// `valor` usa `z.number()` direto, não `z.coerce.number()` — preenchido por
// `CurrencyInput`/`Controller` (`shared/components/form/CurrencyInput.tsx`), que já entrega
// `number | undefined`.
const schema = z.object({
  movimentacaoOrigemId: z.string().min(1, 'Movimentação de origem é obrigatória'),
  movimentacaoDestinoId: z.string().min(1, 'Movimentação de destino é obrigatória'),
  valor: z
    .number({ message: 'Valor é obrigatório' })
    .positive('Valor deve ser um valor monetário positivo'),
  data: z.string().min(1, 'Data é obrigatória'),
})

export type TransferenciaInternaFormValues = z.infer<typeof schema>

/**
 * Origem e destino mutuamente exclusivas (`docs/domain-model/13-transferencia-interna.md`,
 * Seção 4) — checado manualmente no `onSubmit`, não via `.superRefine()` (mesmo padrão já
 * documentado em `arquitetura-tecnica-frontend.md`, Seção 5, para evitar o achado de Zod 4 +
 * `invalid_type`). O backend também valida (`TransferenciaInternaService#criar`) — checagem
 * client-side só antecipa a mensagem para o caso mais comum, sem substituir a validação real.
 */
export function TransferenciaInternaForm({
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: {
  onSubmit: (values: TransferenciaInternaFormValues) => void
  isSubmitting: boolean
  serverFieldErrors?: FieldError[]
}) {
  const { data: movimentacoes, isLoading: isLoadingMovimentacoes } = useMovimentacoes()

  const form = useForm<TransferenciaInternaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      movimentacaoOrigemId: '',
      movimentacaoDestinoId: '',
      valor: undefined,
      data: '',
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof TransferenciaInternaFormValues
      if (['movimentacaoOrigemId', 'movimentacaoDestinoId', 'valor', 'data'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  const movimentacaoOptions = (movimentacoes ?? []).map((movimentacao) => ({
    value: movimentacao.id,
    label: `${formatDate(movimentacao.data)} • ${movimentacao.descricao} • ${formatCurrency(movimentacao.valor)}`,
  }))

  function handleSubmit(values: TransferenciaInternaFormValues) {
    if (values.movimentacaoOrigemId === values.movimentacaoDestinoId) {
      form.setError('movimentacaoDestinoId', {
        type: 'manual',
        message: 'Movimentação de destino deve ser diferente da origem',
      })
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid max-w-2xl gap-4">
      <SelectField
        id="movimentacaoOrigemId"
        label="Movimentação de origem (saída)"
        placeholder={isLoadingMovimentacoes ? 'Carregando...' : 'Selecione a movimentação de origem'}
        options={movimentacaoOptions}
        error={form.formState.errors.movimentacaoOrigemId?.message}
        disabled={isLoadingMovimentacoes}
        {...form.register('movimentacaoOrigemId')}
      />

      <SelectField
        id="movimentacaoDestinoId"
        label="Movimentação de destino (entrada)"
        placeholder={isLoadingMovimentacoes ? 'Carregando...' : 'Selecione a movimentação de destino'}
        options={movimentacaoOptions}
        error={form.formState.errors.movimentacaoDestinoId?.message}
        disabled={isLoadingMovimentacoes}
        {...form.register('movimentacaoDestinoId')}
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

      <FormField id="data" label="Data" error={form.formState.errors.data?.message}>
        <Input id="data" type="date" {...form.register('data')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Criar transferência'}
        </Button>
      </div>
    </form>
  )
}
