import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCategoria } from '../hooks/useCategoria'
import { useCriarCategoria } from '../hooks/useCriarCategoria'
import { useAtualizarCategoria } from '../hooks/useAtualizarCategoria'
import { CategoriaForm } from '../components/CategoriaForm'
import type { CategoriaFormValues } from '../types'

export function CategoriaFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: categoria, isLoading: isLoadingCategoria } = useCategoria(id)
  const criar = useCriarCategoria()
  const atualizar = useAtualizarCategoria()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: CategoriaFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      atualizar.mutate(
        { id, values },
        {
          onError,
          onSuccess: () => {
            toast.success('Categoria atualizada com sucesso.')
            navigate('/categorias')
          },
        },
      )
      return
    }

    criar.mutate(values, {
      onError,
      onSuccess: () => {
        toast.success('Categoria criada com sucesso.')
        navigate('/categorias')
      },
    })
  }

  if (isEdicao && isLoadingCategoria) {
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
        {isEdicao ? 'Editar categoria' : 'Nova categoria'}
      </h1>
      <CategoriaForm
        defaultValues={categoria ? { nome: categoria.nome, tipo: categoria.tipo } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar categoria'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
