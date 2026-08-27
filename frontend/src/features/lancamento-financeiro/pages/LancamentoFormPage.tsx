import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useLancamento } from '../hooks/useLancamento'
import { useCriarLancamento } from '../hooks/useCriarLancamento'
import { useAtualizarLancamento } from '../hooks/useAtualizarLancamento'
import { useCancelarLancamento } from '../hooks/useCancelarLancamento'
import { LancamentoForm, type LancamentoFormValues } from '../components/LancamentoForm'

export function LancamentoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: lancamento, isLoading: isLoadingLancamento } = useLancamento(id)
  const criar = useCriarLancamento()
  const atualizar = useAtualizarLancamento()
  const cancelar = useCancelarLancamento()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: LancamentoFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    // `fornecedorId`/`clienteId`/`obraId`/`veiculoId`/`descricao`/`documento` chegam do
    // formulário como string vazia quando não preenchidos — o backend espera `null`, não `""`,
    // para "ausente".
    const fornecedorId = values.fornecedorId || null
    const clienteId = values.clienteId || null
    const obraId = values.obraId || null
    const veiculoId = values.veiculoId || null
    const descricao = values.descricao || null
    const documento = values.documento || null

    if (isEdicao && id) {
      atualizar.mutate(
        {
          id,
          values: {
            empresaId: values.empresaId,
            categoriaId: values.categoriaId,
            fornecedorId,
            clienteId,
            obraId,
            veiculoId,
            valor: values.valor,
            dataCompetencia: values.dataCompetencia,
            vencimento: values.vencimento,
            descricao,
            documento,
          },
        },
        {
          onError,
          onSuccess: () => {
            toast.success('Lançamento atualizado com sucesso.')
            navigate('/lancamentos-financeiros')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        tipo: values.tipo,
        empresaId: values.empresaId,
        categoriaId: values.categoriaId,
        fornecedorId,
        clienteId,
        obraId,
        veiculoId,
        valor: values.valor,
        dataCompetencia: values.dataCompetencia,
        vencimento: values.vencimento,
        descricao,
        documento,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Lançamento criado com sucesso.')
          navigate('/lancamentos-financeiros')
        },
      },
    )
  }

  function handleCancelar() {
    if (!id) return
    const confirmado = window.confirm(
      'Cancelar este lançamento? Só é possível quando não há nenhuma Aplicação de Liquidação vinculada.',
    )
    if (!confirmado) return

    cancelar.mutate(id, {
      onSuccess: () => toast.success('Lançamento cancelado.'),
      // Erro (ex. já tem Aplicação vinculada) já aparece no toast global (QueryProvider).
    })
  }

  if (isEdicao && isLoadingLancamento) {
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
          {isEdicao ? 'Editar lançamento' : 'Novo lançamento'}
        </h1>
        {isEdicao && lancamento?.situacaoAdministrativa === 'Ativo' && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelar}
            disabled={cancelar.isPending}
          >
            {cancelar.isPending ? 'Cancelando...' : 'Cancelar lançamento'}
          </Button>
        )}
      </div>

      {lancamento?.situacaoAdministrativa === 'Cancelado' && (
        <p className="text-sm text-muted-foreground">
          Este lançamento está cancelado — os campos abaixo são só para consulta.
        </p>
      )}

      <LancamentoForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          lancamento
            ? {
                tipo: lancamento.tipo,
                empresaId: lancamento.empresaId,
                categoriaId: lancamento.categoriaId,
                fornecedorId: lancamento.fornecedorId ?? '',
                clienteId: lancamento.clienteId ?? '',
                obraId: lancamento.obraId ?? '',
                veiculoId: lancamento.veiculoId ?? '',
                valor: lancamento.valor,
                dataCompetencia: lancamento.dataCompetencia,
                vencimento: lancamento.vencimento,
                descricao: lancamento.descricao ?? '',
                documento: lancamento.documento ?? '',
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar lançamento'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
