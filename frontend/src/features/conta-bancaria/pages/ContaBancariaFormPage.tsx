import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useContaBancaria } from '../hooks/useContaBancaria'
import { useCriarContaBancaria } from '../hooks/useCriarContaBancaria'
import { useAtualizarContaBancaria } from '../hooks/useAtualizarContaBancaria'
import { ContaBancariaForm, type ContaBancariaFormValues } from '../components/ContaBancariaForm'

export function ContaBancariaFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: contaBancaria, isLoading: isLoadingContaBancaria } = useContaBancaria(id)
  const criar = useCriarContaBancaria()
  const atualizar = useAtualizarContaBancaria()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: ContaBancariaFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      // `empresaId` não existe em `AtualizarContaBancariaRequest` — nunca enviado na edição.
      atualizar.mutate(
        { id, values: { banco: values.banco, apelido: values.apelido } },
        {
          onError,
          onSuccess: () => {
            toast.success('Conta bancária atualizada com sucesso.')
            navigate('/contas-bancarias')
          },
        },
      )
      return
    }

    criar.mutate(
      { empresaId: values.empresaId as string, banco: values.banco, apelido: values.apelido },
      {
        onError,
        onSuccess: () => {
          toast.success('Conta bancária criada com sucesso.')
          navigate('/contas-bancarias')
        },
      },
    )
  }

  if (isEdicao && isLoadingContaBancaria) {
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
        {isEdicao ? 'Editar conta bancária' : 'Nova conta bancária'}
      </h1>
      <ContaBancariaForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          contaBancaria
            ? { empresaId: undefined, banco: contaBancaria.banco, apelido: contaBancaria.apelido }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar conta bancária'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
