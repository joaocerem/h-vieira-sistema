import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCartaoCredito } from '../hooks/useCartaoCredito'
import { useCriarCartaoCredito } from '../hooks/useCriarCartaoCredito'
import { useAtualizarCartaoCredito } from '../hooks/useAtualizarCartaoCredito'
import { CartaoCreditoForm, type CartaoCreditoFormValues } from '../components/CartaoCreditoForm'

export function CartaoCreditoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: cartao, isLoading: isLoadingCartao } = useCartaoCredito(id)
  const criar = useCriarCartaoCredito()
  const atualizar = useAtualizarCartaoCredito()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: CartaoCreditoFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      // `contaBancariaId` não existe em `AtualizarCartaoCreditoRequest` — nunca enviado na edição.
      atualizar.mutate(
        {
          id,
          values: {
            banco: values.banco,
            apelido: values.apelido,
            diaFechamento: values.diaFechamento,
            diaVencimento: values.diaVencimento,
          },
        },
        {
          onError,
          onSuccess: () => {
            toast.success('Cartão de crédito atualizado com sucesso.')
            navigate('/cartoes-credito')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        contaBancariaId: values.contaBancariaId as string,
        banco: values.banco,
        apelido: values.apelido,
        diaFechamento: values.diaFechamento,
        diaVencimento: values.diaVencimento,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Cartão de crédito criado com sucesso.')
          navigate('/cartoes-credito')
        },
      },
    )
  }

  if (isEdicao && isLoadingCartao) {
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
      <h1 className="text-lg font-semibold">
        {isEdicao ? 'Editar cartão de crédito' : 'Novo cartão de crédito'}
      </h1>
      <CartaoCreditoForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          cartao
            ? {
                contaBancariaId: undefined,
                banco: cartao.banco,
                apelido: cartao.apelido,
                diaFechamento: cartao.diaFechamento,
                diaVencimento: cartao.diaVencimento,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar cartão de crédito'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
