import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCompraCartao } from '../hooks/useCompraCartao'
import { useCriarCompraCartao } from '../hooks/useCriarCompraCartao'
import { useAtualizarCompraCartao } from '../hooks/useAtualizarCompraCartao'
import { CompraCartaoForm, type CompraCartaoFormValues } from '../components/CompraCartaoForm'

export function CompraCartaoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: compra, isLoading: isLoadingCompra } = useCompraCartao(id)
  const criar = useCriarCompraCartao()
  const atualizar = useAtualizarCompraCartao()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: CompraCartaoFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    // `obraId`/`veiculoId` chegam do <select> como string vazia quando não preenchidos — o
    // backend espera `null`, não `""`, para "ausente" (mesmo padrão de `LancamentoFormPage`).
    const obraId = values.obraId || null
    const veiculoId = values.veiculoId || null

    if (isEdicao && id) {
      // `cartaoId`/`valor`/`numeroParcelas` não existem em `AtualizarCompraCartaoRequest` —
      // nunca enviados na edição.
      atualizar.mutate(
        {
          id,
          values: {
            fornecedorId: values.fornecedorId,
            data: values.data,
            categoriaId: values.categoriaId,
            classificacao: values.classificacao,
            obraId,
            veiculoId,
          },
        },
        {
          onError,
          onSuccess: () => {
            toast.success('Compra de cartão atualizada com sucesso.')
            navigate('/compras-cartao')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        cartaoId: values.cartaoId as string,
        fornecedorId: values.fornecedorId,
        valor: values.valor as number,
        data: values.data,
        categoriaId: values.categoriaId,
        classificacao: values.classificacao,
        obraId,
        veiculoId,
        numeroParcelas: values.numeroParcelas as number,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Compra de cartão criada com sucesso.')
          navigate('/compras-cartao')
        },
      },
    )
  }

  if (isEdicao && isLoadingCompra) {
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
      <h1 className="text-lg font-semibold">{isEdicao ? 'Editar compra de cartão' : 'Nova compra de cartão'}</h1>
      <CompraCartaoForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          compra
            ? {
                cartaoId: undefined,
                fornecedorId: compra.fornecedorId,
                valor: undefined,
                data: compra.data,
                categoriaId: compra.categoriaId,
                classificacao: compra.classificacao,
                obraId: compra.obraId ?? '',
                veiculoId: compra.veiculoId ?? '',
                numeroParcelas: undefined,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar compra'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
