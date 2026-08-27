import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import type { FieldError } from '@/shared/api/errors'

// `empresaId` exigido só no modo `criar` — campo required/optional trocado diretamente no
// shape do schema (não via `superRefine`): `.superRefine()` não é confiável aqui porque, em
// Zod 4, o efeito não roda quando o objeto já tem outro campo com erro de tipo (`diaFechamento`
// não se aplica a este formulário, mas o mesmo padrão é usado em `CartaoCreditoForm.tsx`,
// onde isso foi observado — achado registrado no relatório desta sessão). `FormValues` é
// inferido do próprio schema (`z.infer`), nunca escrito à mão — evita o schema e o tipo do
// formulário divergirem entre os dois modos.
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    empresaId:
      modo === 'criar' ? z.string().min(1, 'Empresa é obrigatória') : z.string().optional(),
    banco: z.string().trim().min(1, 'Banco é obrigatório'),
    apelido: z.string().trim().min(1, 'Apelido é obrigatório'),
  })
}

export type ContaBancariaFormValues = z.infer<ReturnType<typeof buildSchema>>

/**
 * `empresaId` só aparece no modo `criar` — Conta Bancária não permite reatribuir a Empresa
 * depois de criada (`AtualizarContaBancariaRequest`, backend, não tem esse campo).
 */
export function ContaBancariaForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: ContaBancariaFormValues
  onSubmit: (values: ContaBancariaFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresaOptions()

  const form = useForm<ContaBancariaFormValues>({
    resolver: zodResolver(buildSchema(modo)),
    defaultValues: defaultValues ?? { empresaId: '', banco: '', apelido: '' },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      if (fieldError.field === 'empresaId' || fieldError.field === 'banco' || fieldError.field === 'apelido') {
        form.setError(fieldError.field, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
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

      <FormField id="banco" label="Banco" error={form.formState.errors.banco?.message}>
        <Input id="banco" autoFocus={modo === 'editar'} {...form.register('banco')} />
      </FormField>

      <FormField id="apelido" label="Apelido" error={form.formState.errors.apelido?.message}>
        <Input id="apelido" placeholder="ex.: Conta Movimento" {...form.register('apelido')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
