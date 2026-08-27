import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import type { FieldError } from '@/shared/api/errors'

const schema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
})

export interface NomeUnicoFormValues {
  nome: string
}

/**
 * Formulário compartilhado para entidades de cadastro simples cujo único campo é `nome`
 * (Empresa, Fornecedor, Cliente — mesmo shape de `Request` no backend: `{nome}`, `nome`
 * `@NotBlank`). Extraído durante a implementação dos Cadastros Base, depois de confirmado que
 * as três features precisavam exatamente do mesmo formulário, sem nenhuma variação — reuso
 * real, não antecipado.
 */
export function NomeUnicoForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  defaultValues?: NomeUnicoFormValues
  onSubmit: (values: NomeUnicoFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const form = useForm<NomeUnicoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { nome: '' },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      if (fieldError.field === 'nome') {
        form.setError('nome', { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <FormField id="nome" label="Nome" error={form.formState.errors.nome?.message}>
        <Input id="nome" autoFocus {...form.register('nome')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
