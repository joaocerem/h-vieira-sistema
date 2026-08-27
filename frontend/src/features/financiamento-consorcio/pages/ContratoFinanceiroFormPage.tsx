import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useContratoFinanceiro } from '../hooks/useContratoFinanceiro'
import { useCriarContratoFinanceiro } from '../hooks/useCriarContratoFinanceiro'
import { useAtualizarContratoFinanceiro } from '../hooks/useAtualizarContratoFinanceiro'
import { useContemplarContratoFinanceiro } from '../hooks/useContemplarContratoFinanceiro'
import { ContratoFinanceiroForm, type ContratoFinanceiroFormValues } from '../components/ContratoFinanceiroForm'

export function ContratoFinanceiroFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: contrato, isLoading: isLoadingContrato } = useContratoFinanceiro(id)
  const criar = useCriarContratoFinanceiro()
  const atualizar = useAtualizarContratoFinanceiro()
  const contemplar = useContemplarContratoFinanceiro()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: ContratoFinanceiroFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    // `veiculoId` chega do <select> como string vazia quando não preenchido — o backend espera
    // `null`, não `""`, para "ausente" (mesmo padrão de `LancamentoFormPage`).
    const veiculoId = values.veiculoId || null

    if (isEdicao && id) {
      // `tipo`/`empresaId`/`contaBancariaId`/`valorContratado`/`numeroParcelas`/
      // `dataVencimentoPrimeiraParcela` não existem em `AtualizarContratoFinanceiroRequest` —
      // nunca enviados na edição.
      atualizar.mutate(
        { id, values: { fornecedorId: values.fornecedorId, veiculoId } },
        {
          onError,
          onSuccess: () => {
            toast.success('Contrato financeiro atualizado com sucesso.')
            navigate('/contratos-financeiros')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        tipo: values.tipo as 'Financiamento' | 'Consórcio',
        empresaId: values.empresaId as string,
        contaBancariaId: values.contaBancariaId as string,
        fornecedorId: values.fornecedorId,
        valorContratado: values.valorContratado as number,
        numeroParcelas: values.numeroParcelas as number,
        dataVencimentoPrimeiraParcela: values.dataVencimentoPrimeiraParcela as string,
        // Campos condicionais por `tipo` — `null` explícito para o lado que não se aplica
        // (`ContratoFinanceiroService#validarCamposPorTipo` recusa envio cruzado).
        taxa: values.tipo === 'Financiamento' ? (values.taxa as number) : null,
        grupoCota: values.tipo === 'Consórcio' ? (values.grupoCota ?? null) : null,
        contemplado: values.tipo === 'Consórcio' ? Boolean(values.contemplado) : null,
        veiculoId: values.tipo === 'Consórcio' && values.contemplado ? veiculoId : null,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Contrato financeiro criado com sucesso.')
          navigate('/contratos-financeiros')
        },
      },
    )
  }

  function handleContemplar() {
    if (!id) return
    contemplar.mutate(id, {
      onSuccess: () => toast.success('Contrato marcado como contemplado.'),
      // Erro (ex. tipo não é Consórcio, ou já contemplado) já aparece no toast global (QueryProvider).
    })
  }

  if (isEdicao && isLoadingContrato) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {isEdicao ? 'Editar contrato financeiro' : 'Novo contrato financeiro'}
        </h1>
        {isEdicao && contrato?.tipo === 'Consórcio' && !contrato.contemplado && (
          <Button type="button" variant="outline" onClick={handleContemplar} disabled={contemplar.isPending}>
            {contemplar.isPending ? 'Contemplando...' : 'Marcar como contemplado'}
          </Button>
        )}
      </div>

      <ContratoFinanceiroForm
        // Remonta o formulário quando `contemplado` muda (ação `contemplar`, fora deste
        // formulário) — garante que `defaultValues` (usados para decidir se `veiculoId` aparece
        // no modo editar) reflitam o estado mais recente, sem lógica extra de `form.reset()`.
        key={contrato ? `${contrato.id}-${contrato.contemplado}` : 'novo'}
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          contrato
            ? {
                tipo: contrato.tipo,
                empresaId: undefined,
                contaBancariaId: undefined,
                fornecedorId: contrato.fornecedorId,
                valorContratado: undefined,
                numeroParcelas: undefined,
                dataVencimentoPrimeiraParcela: undefined,
                taxa: contrato.taxa ?? undefined,
                grupoCota: contrato.grupoCota ?? '',
                contemplado: contrato.contemplado ?? false,
                veiculoId: contrato.veiculoId ?? '',
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar contrato'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
