import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoForm } from '@/shared/components/crud/NomeUnicoForm'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useFornecedor } from '../hooks/useFornecedor'
import { useCriarFornecedor } from '../hooks/useCriarFornecedor'
import { useAtualizarFornecedor } from '../hooks/useAtualizarFornecedor'
import type { FornecedorFormValues } from '../types'

export function FornecedorFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: fornecedor, isLoading: isLoadingFornecedor } = useFornecedor(id)
  const criar = useCriarFornecedor()
  const atualizar = useAtualizarFornecedor()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: FornecedorFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      atualizar.mutate(
        { id, values },
        {
          onError,
          onSuccess: () => {
            toast.success('Fornecedor atualizado com sucesso.')
            navigate('/fornecedores')
          },
        },
      )
      return
    }

    criar.mutate(values, {
      onError,
      onSuccess: () => {
        toast.success('Fornecedor criado com sucesso.')
        navigate('/fornecedores')
      },
    })
  }

  if (isEdicao && isLoadingFornecedor) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">
        {isEdicao ? 'Editar fornecedor' : 'Novo fornecedor'}
      </h1>
      <NomeUnicoForm
        defaultValues={fornecedor ? { nome: fornecedor.nome } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar fornecedor'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
