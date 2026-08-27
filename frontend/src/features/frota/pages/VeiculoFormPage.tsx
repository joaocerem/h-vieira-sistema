import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useVeiculo } from '../hooks/useVeiculo'
import { useCriarVeiculo } from '../hooks/useCriarVeiculo'
import { useAtualizarVeiculo } from '../hooks/useAtualizarVeiculo'
import { VeiculoForm, type VeiculoFormValues } from '../components/VeiculoForm'

export function VeiculoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: veiculo, isLoading: isLoadingVeiculo } = useVeiculo(id)
  const criar = useCriarVeiculo()
  const atualizar = useAtualizarVeiculo()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: VeiculoFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)
    const obraAtualId = values.obraAtualId || null

    if (isEdicao && id) {
      atualizar.mutate(
        {
          id,
          values: { nomeIdentificacao: values.nomeIdentificacao, tipo: values.tipo, obraAtualId },
        },
        {
          onError,
          onSuccess: () => {
            toast.success('Veículo atualizado com sucesso.')
            navigate('/veiculos')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        empresaId: values.empresaId as string,
        nomeIdentificacao: values.nomeIdentificacao,
        tipo: values.tipo,
        obraAtualId,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Veículo criado com sucesso.')
          navigate('/veiculos')
        },
      },
    )
  }

  if (isEdicao && isLoadingVeiculo) {
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
      <h1 className="text-lg font-semibold">{isEdicao ? 'Editar veículo' : 'Novo veículo'}</h1>
      <VeiculoForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          veiculo
            ? {
                empresaId: undefined,
                nomeIdentificacao: veiculo.nomeIdentificacao,
                tipo: veiculo.tipo,
                obraAtualId: veiculo.obraAtualId ?? '',
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar veículo'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
