import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoForm } from '@/shared/components/crud/NomeUnicoForm'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useEmpresa } from '../hooks/useEmpresa'
import { useCriarEmpresa } from '../hooks/useCriarEmpresa'
import { useAtualizarEmpresa } from '../hooks/useAtualizarEmpresa'
import type { EmpresaFormValues } from '../types'

/**
 * Página única para criação e edição — `/empresas/nova` (sem `id`) e
 * `/empresas/:id/editar` (com `id`), mesmo padrão repetido nas demais features.
 */
export function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: empresa, isLoading: isLoadingEmpresa } = useEmpresa(id)
  const criar = useCriarEmpresa()
  const atualizar = useAtualizarEmpresa()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: EmpresaFormValues) {
    setFieldErrors([])

    const onError = (error: unknown) => {
      // Erro genérico já é exibido globalmente via toast (QueryProvider) — aqui só se
      // extrai o detalhe por campo para refletir no formulário.
      setFieldErrors(translateApiError(error).fieldErrors)
    }

    if (isEdicao && id) {
      atualizar.mutate(
        { id, values },
        {
          onError,
          onSuccess: () => {
            toast.success('Empresa atualizada com sucesso.')
            navigate('/empresas')
          },
        },
      )
      return
    }

    criar.mutate(values, {
      onError,
      onSuccess: () => {
        toast.success('Empresa criada com sucesso.')
        navigate('/empresas')
      },
    })
  }

  if (isEdicao && isLoadingEmpresa) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">{isEdicao ? 'Editar empresa' : 'Nova empresa'}</h1>
      <NomeUnicoForm
        defaultValues={empresa ? { nome: empresa.nome } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar empresa'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
