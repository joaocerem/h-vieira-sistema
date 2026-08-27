import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { usePagarFatura } from '../hooks/usePagarFatura'
import { FaturaPagarForm, type FaturaPagarFormValues } from '../components/FaturaPagarForm'

export function FaturaPagarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pagar = usePagarFatura()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  function handleSubmit(values: FaturaPagarFormValues) {
    if (!id) return
    setFieldErrors([])
    pagar.mutate(
      { id, values },
      {
        onError: (error) => setFieldErrors(translateApiError(error).fieldErrors),
        onSuccess: () => {
          toast.success('Fatura paga com sucesso.')
          navigate(`/faturas/${id}`)
        },
      },
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Pagar fatura</h1>
      <FaturaPagarForm onSubmit={handleSubmit} isSubmitting={pagar.isPending} serverFieldErrors={fieldErrors} />
    </div>
  )
}
