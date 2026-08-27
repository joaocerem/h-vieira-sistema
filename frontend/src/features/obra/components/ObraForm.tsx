import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'
import type { FieldError } from '@/shared/api/errors'

// `valorContratado` usa `z.coerce.number()`, nunca `valueAsNumber` — ver nota de padrão em
// `arquitetura-tecnica-frontend.md`, Seção 5 (achado Zod 4 + `.superRefine()`/`NaN`).
// `clienteId` exigido só no modo `criar` — mesmo padrão de `ContaBancariaForm.tsx`.
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    clienteId: modo === 'criar' ? z.string().min(1, 'Cliente é obrigatório') : z.string().optional(),
    nome: z.string().trim().min(1, 'Nome é obrigatório'),
    valorContratado: z.coerce.number().positive('Valor contratado deve ser um valor monetário positivo'),
    dataInicio: z.string().min(1, 'Data de início é obrigatória'),
    dataPrevistaTermino: z.string().min(1, 'Data prevista de término é obrigatória'),
    dataRealTermino: z.string().optional(),
  })
}

export type ObraFormValues = z.output<ReturnType<typeof buildSchema>>

/**
 * `clienteId` só aparece no modo `criar` — Obra não permite reatribuir o Cliente depois de
 * criada (`AtualizarObraRequest`, backend, não tem esse campo). `status` não é campo deste
 * formulário — só muda via ação dedicada de transição (`ObraStatusActions`, na página).
 */
export function ObraForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: ObraFormValues
  onSubmit: (values: ObraFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: clientes, isLoading: isLoadingClientes } = useClienteOptions()

  const form = useForm<z.input<ReturnType<typeof buildSchema>>, unknown, ObraFormValues>({
    resolver: zodResolver(buildSchema(modo)),
    defaultValues: defaultValues ?? {
      clienteId: '',
      nome: '',
      valorContratado: undefined,
      dataInicio: '',
      dataPrevistaTermino: '',
      dataRealTermino: '',
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof ObraFormValues
      if (['clienteId', 'nome', 'valorContratado', 'dataInicio', 'dataPrevistaTermino', 'dataRealTermino'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      {modo === 'criar' && (
        <SelectField
          id="clienteId"
          label="Cliente"
          placeholder={isLoadingClientes ? 'Carregando...' : 'Selecione o cliente'}
          options={(clientes ?? []).map((cliente) => ({ value: cliente.id, label: cliente.nome }))}
          error={form.formState.errors.clienteId?.message}
          disabled={isLoadingClientes}
          {...form.register('clienteId')}
        />
      )}

      <FormField id="nome" label="Nome" error={form.formState.errors.nome?.message}>
        <Input id="nome" autoFocus={modo === 'editar'} {...form.register('nome')} />
      </FormField>

      <FormField
        id="valorContratado"
        label="Valor contratado"
        error={form.formState.errors.valorContratado?.message}
      >
        <Input id="valorContratado" type="number" step="0.01" {...form.register('valorContratado')} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="dataInicio"
          label="Data de início"
          error={form.formState.errors.dataInicio?.message}
        >
          <Input id="dataInicio" type="date" {...form.register('dataInicio')} />
        </FormField>

        <FormField
          id="dataPrevistaTermino"
          label="Data prevista de término"
          error={form.formState.errors.dataPrevistaTermino?.message}
        >
          <Input id="dataPrevistaTermino" type="date" {...form.register('dataPrevistaTermino')} />
        </FormField>
      </div>

      <FormField
        id="dataRealTermino"
        label="Data real de término"
        error={form.formState.errors.dataRealTermino?.message}
      >
        <Input id="dataRealTermino" type="date" {...form.register('dataRealTermino')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
