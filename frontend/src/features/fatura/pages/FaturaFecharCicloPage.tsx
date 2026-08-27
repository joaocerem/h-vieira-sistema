import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useFecharCicloFatura } from '../hooks/useFecharCicloFatura'
import { FaturaFecharCicloForm, type FaturaFecharCicloFormValues } from '../components/FaturaFecharCicloForm'

export function FaturaFecharCicloPage() {
  const navigate = useNavigate()
  const fecharCiclo = useFecharCicloFatura()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  function handleSubmit(values: FaturaFecharCicloFormValues) {
    setFieldErrors([])
    fecharCiclo.mutate(values, {
      onError: (error) => setFieldErrors(translateApiError(error).fieldErrors),
      onSuccess: (fatura) => {
        toast.success('Ciclo fechado — Fatura criada com sucesso.')
        navigate(`/faturas/${fatura.id}`)
      },
    })
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Fechar ciclo</h1>
      <FaturaFecharCicloForm
        onSubmit={handleSubmit}
        isSubmitting={fecharCiclo.isPending}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
