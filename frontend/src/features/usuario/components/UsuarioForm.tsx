import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import type { FieldError } from '@/shared/api/errors'

// `identificadorDeAcesso` exigido só no modo `criar` — campo required/optional trocado
// diretamente no shape do schema, não via `.superRefine()` (ver nota em `CartaoCreditoForm.tsx`
// sobre por que `superRefine` não é usado para essa checagem neste projeto). `FormValues` é
// inferido do próprio schema (`z.infer`), nunca escrito à mão.
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    nome: z.string().trim().min(1, 'Nome é obrigatório'),
    identificadorDeAcesso:
      modo === 'criar'
        ? z.string().trim().min(1, 'Identificador de acesso é obrigatório')
        : z.string().trim().optional(),
    // Texto livre de propósito — "situação de acesso" não tem enumeração confirmada no
    // domínio (`docs/domain-model/02-usuario.md`: "ex. Ativo/Inativo", explicitamente não
    // confirmado pelo conceitual); o backend também não valida (campo opcional, sem
    // `@NotBlank`).
    situacaoDeAcesso: z.string().trim(),
  })
}

export type UsuarioFormValues = z.infer<ReturnType<typeof buildSchema>>

/**
 * `identificadorDeAcesso` só aparece no modo `criar` — imutável depois de criado
 * (`AtualizarUsuarioRequest`, backend, não tem esse campo).
 */
export function UsuarioForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: UsuarioFormValues
  onSubmit: (values: UsuarioFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(buildSchema(modo)),
    defaultValues: defaultValues ?? { nome: '', identificadorDeAcesso: '', situacaoDeAcesso: '' },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof UsuarioFormValues
      if (['nome', 'identificadorDeAcesso', 'situacaoDeAcesso'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <FormField id="nome" label="Nome" error={form.formState.errors.nome?.message}>
        <Input id="nome" autoFocus {...form.register('nome')} />
      </FormField>

      {modo === 'criar' && (
        <FormField
          id="identificadorDeAcesso"
          label="Identificador de acesso"
          error={form.formState.errors.identificadorDeAcesso?.message}
        >
          <Input id="identificadorDeAcesso" {...form.register('identificadorDeAcesso')} />
        </FormField>
      )}

      <FormField
        id="situacaoDeAcesso"
        label="Situação de acesso"
        error={form.formState.errors.situacaoDeAcesso?.message}
      >
        <Input
          id="situacaoDeAcesso"
          placeholder="ex.: Ativo, Inativo"
          {...form.register('situacaoDeAcesso')}
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
