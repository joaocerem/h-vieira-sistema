import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCriarTransferenciaInterna } from '../hooks/useCriarTransferenciaInterna'
import {
  TransferenciaInternaForm,
  type TransferenciaInternaFormValues,
} from '../components/TransferenciaInternaForm'

export function TransferenciaInternaFormPage() {
  const navigate = useNavigate()
  const criar = useCriarTransferenciaInterna()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  function handleSubmit(values: TransferenciaInternaFormValues) {
    setFieldErrors([])

    criar.mutate(values, {
      onError: (error) => setFieldErrors(translateApiError(error).fieldErrors),
      onSuccess: () => {
        toast.success('Transferência interna criada com sucesso.')
        navigate('/conciliacao-bancaria/transferencias')
      },
    })
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Nova transferência interna</h1>
      <TransferenciaInternaForm
        onSubmit={handleSubmit}
        isSubmitting={criar.isPending}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
