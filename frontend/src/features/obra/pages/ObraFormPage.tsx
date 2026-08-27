import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useObra } from '../hooks/useObra'
import { useCriarObra } from '../hooks/useCriarObra'
import { useAtualizarObra } from '../hooks/useAtualizarObra'
import { useTransicionarStatusObra } from '../hooks/useTransicionarStatusObra'
import { ObraForm, type ObraFormValues } from '../components/ObraForm'
import { ObraStatusActions } from '../components/ObraStatusActions'
import type { Obra } from '../types'

export function ObraFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: obra, isLoading: isLoadingObra } = useObra(id)
  const criar = useCriarObra()
  const atualizar = useAtualizarObra()
  const transicionarStatus = useTransicionarStatusObra()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: ObraFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)
    const dataRealTermino = values.dataRealTermino || null

    if (isEdicao && id) {
      atualizar.mutate(
        {
          id,
          values: {
            nome: values.nome,
            valorContratado: values.valorContratado,
            dataInicio: values.dataInicio,
            dataPrevistaTermino: values.dataPrevistaTermino,
            dataRealTermino,
          },
        },
        {
          onError,
          onSuccess: () => {
            toast.success('Obra atualizada com sucesso.')
            navigate('/obras')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        clienteId: values.clienteId as string,
        nome: values.nome,
        valorContratado: values.valorContratado,
        dataInicio: values.dataInicio,
        dataPrevistaTermino: values.dataPrevistaTermino,
        dataRealTermino,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Obra criada com sucesso.')
          navigate('/obras')
        },
      },
    )
  }

  function handleTransicionar(novoStatus: Obra['status']) {
    if (!id) return
    transicionarStatus.mutate(
      { id, novoStatus },
      { onSuccess: () => toast.success(`Obra marcada como "${novoStatus}".`) },
    )
  }

  if (isEdicao && isLoadingObra) {
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
        <h1 className="text-lg font-semibold">{isEdicao ? 'Editar obra' : 'Nova obra'}</h1>
        {isEdicao && obra && (
          <ObraStatusActions
            statusAtual={obra.status}
            onTransicionar={handleTransicionar}
            isPending={transicionarStatus.isPending}
          />
        )}
      </div>

      <ObraForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          obra
            ? {
                clienteId: undefined,
                nome: obra.nome,
                valorContratado: obra.valorContratado,
                dataInicio: obra.dataInicio,
                dataPrevistaTermino: obra.dataPrevistaTermino,
                dataRealTermino: obra.dataRealTermino ?? '',
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar obra'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
