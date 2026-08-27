import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import { TIPOS_VEICULO } from '../types'
import type { FieldError } from '@/shared/api/errors'

/**
 * `empresaId` exigido só no modo `criar` — mesmo padrão de `ContaBancariaForm.tsx`. `tipo` usa
 * lista fechada de 8 valores (D10, `decisions.md` decisão #31) — `z.enum`, não texto livre.
 * `obraAtualId` sempre opcional, em qualquer modo — alocação pode mudar a qualquer momento,
 * sem limite de trocas (`docs/domain-model/07-veiculo.md`, Seção 2).
 */
function buildSchema(modo: 'criar' | 'editar') {
  return z.object({
    empresaId:
      modo === 'criar' ? z.string().min(1, 'Empresa é obrigatória') : z.string().optional(),
    nomeIdentificacao: z.string().trim().min(1, 'Nome/identificação é obrigatório'),
    tipo: z.enum(TIPOS_VEICULO, { message: 'Tipo é obrigatório' }),
    obraAtualId: z.string().optional(),
  })
}

export type VeiculoFormValues = z.output<ReturnType<typeof buildSchema>>

export function VeiculoForm({
  modo,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverFieldErrors,
}: {
  modo: 'criar' | 'editar'
  defaultValues?: VeiculoFormValues
  onSubmit: (values: VeiculoFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  serverFieldErrors?: FieldError[]
}) {
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresaOptions()
  const { data: obras, isLoading: isLoadingObras } = useObraOptions()

  const form = useForm<z.input<ReturnType<typeof buildSchema>>, unknown, VeiculoFormValues>({
    resolver: zodResolver(buildSchema(modo)),
    defaultValues: defaultValues ?? {
      empresaId: '',
      nomeIdentificacao: '',
      tipo: undefined,
      obraAtualId: '',
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof VeiculoFormValues
      if (['empresaId', 'nomeIdentificacao', 'tipo', 'obraAtualId'].includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
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

      <FormField
        id="nomeIdentificacao"
        label="Nome/identificação"
        error={form.formState.errors.nomeIdentificacao?.message}
      >
        <Input id="nomeIdentificacao" autoFocus {...form.register('nomeIdentificacao')} />
      </FormField>

      <SelectField
        id="tipo"
        label="Tipo"
        placeholder="Selecione o tipo"
        options={TIPOS_VEICULO.map((tipo) => ({ value: tipo, label: tipo }))}
        error={form.formState.errors.tipo?.message}
        {...form.register('tipo')}
      />

      <SelectField
        id="obraAtualId"
        label="Obra atual (alocação)"
        placeholder={isLoadingObras ? 'Carregando...' : 'Sem alocação corrente'}
        options={(obras ?? []).map((obra) => ({ value: obra.id, label: obra.nome }))}
        error={form.formState.errors.obraAtualId?.message}
        disabled={isLoadingObras}
        {...form.register('obraAtualId')}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
