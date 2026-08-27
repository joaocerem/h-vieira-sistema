import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useUsuario } from '../hooks/useUsuario'
import { useCriarUsuario } from '../hooks/useCriarUsuario'
import { useAtualizarUsuario } from '../hooks/useAtualizarUsuario'
import { UsuarioForm, type UsuarioFormValues } from '../components/UsuarioForm'

export function UsuarioFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()

  const { data: usuario, isLoading: isLoadingUsuario } = useUsuario(id)
  const criar = useCriarUsuario()
  const atualizar = useAtualizarUsuario()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const isSubmitting = criar.isPending || atualizar.isPending

  function handleSubmit(values: UsuarioFormValues) {
    setFieldErrors([])
    const onError = (error: unknown) => setFieldErrors(translateApiError(error).fieldErrors)

    if (isEdicao && id) {
      // `identificadorDeAcesso` não existe em `AtualizarUsuarioRequest` — nunca enviado na edição.
      atualizar.mutate(
        { id, values: { nome: values.nome, situacaoDeAcesso: values.situacaoDeAcesso } },
        {
          onError,
          onSuccess: () => {
            toast.success('Usuário atualizado com sucesso.')
            navigate('/usuarios')
          },
        },
      )
      return
    }

    criar.mutate(
      {
        nome: values.nome,
        identificadorDeAcesso: values.identificadorDeAcesso as string,
        situacaoDeAcesso: values.situacaoDeAcesso,
      },
      {
        onError,
        onSuccess: () => {
          toast.success('Usuário criado com sucesso.')
          navigate('/usuarios')
        },
      },
    )
  }

  if (isEdicao && isLoadingUsuario) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">{isEdicao ? 'Editar usuário' : 'Novo usuário'}</h1>
      <UsuarioForm
        modo={isEdicao ? 'editar' : 'criar'}
        defaultValues={
          usuario
            ? {
                nome: usuario.nome,
                identificadorDeAcesso: undefined,
                situacaoDeAcesso: usuario.situacaoDeAcesso ?? '',
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdicao ? 'Salvar alterações' : 'Criar usuário'}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
