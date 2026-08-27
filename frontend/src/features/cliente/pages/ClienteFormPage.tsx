import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoForm } from '@/shared/components/crud/NomeUnicoForm'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCliente } from '../hooks/useCliente'
import { useCriarCliente } from '../hooks/useCriarCliente'
import { useAtualizarCliente } from '../hooks/useAtualizarCliente'
import type { ClienteFormValues } from '../types'

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: cliente, isLoading: isLoadingCliente } = useCliente(id)
  const criar = useCriarCliente()
  const atualizar = useAtualizarCliente()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: ClienteFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      atualizar.mutate(
        { id, values },
        {
          onError,
          onSuccess: () => {
            toast.success('Cliente atualizado com sucesso.')
            navigate('/clientes')
          },
        },
      )
      return
    }

    criar.mutate(values, {
      onError,
      onSuccess: () => {
        toast.success('Cliente criado com sucesso.')
        navigate('/clientes')
      },
    })
  }

  if (isEdicao && isLoadingCliente) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">{isEdicao ? 'Editar cliente' : 'Novo cliente'}</h1>
      <NomeUnicoForm
        defaultValues={cliente ? { nome: cliente.nome } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar cliente'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
