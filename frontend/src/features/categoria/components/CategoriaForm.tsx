import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import type { FieldError } from '@/shared/api/errors'
import type { CategoriaFormValues } from '../types'

const schema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  tipo: z.string().trim().min(1, 'Tipo é obrigatório'),
})

export function CategoriaForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  defaultValues?: CategoriaFormValues
  onSubmit: (values: CategoriaFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { nome: '', tipo: '' },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      if (fieldError.field === 'nome' || fieldError.field === 'tipo') {
        form.setError(fieldError.field, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <FormField id="nome" label="Nome" error={form.formState.errors.nome?.message}>
        <Input id="nome" autoFocus {...form.register('nome')} />
      </FormField>

      <FormField id="tipo" label="Tipo" error={form.formState.errors.tipo?.message}>
        <Input id="tipo" placeholder="ex.: Receita, Despesa" {...form.register('tipo')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
