import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCriarAjusteFinanceiro } from '../hooks/useCriarAjusteFinanceiro'
import {
  AjusteFinanceiroForm,
  type AjusteFinanceiroFormValues,
} from '../components/AjusteFinanceiroForm'

/** Só criação — Ajuste Financeiro é imutável desde a criação (D13), sem página de edição. */
export function AjusteFinanceiroFormPage() {
  const [searchParams] = useSearchParams()
  const lancamentoOriginalId = searchParams.get('lancamentoOriginalId') ?? undefined
  const navigate = useNavigate()
  const criar = useCriarAjusteFinanceiro()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  function handleSubmit(values: AjusteFinanceiroFormValues) {
    setFieldErrors([])
    criar.mutate(
      { ...values, observacao: values.observacao || null },
      {
        onError: (error) => setFieldErrors(translateApiError(error).fieldErrors),
        onSuccess: () => {
          toast.success('Ajuste financeiro criado com sucesso.')
          navigate('/ajustes-financeiros')
        },
      },
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Novo ajuste financeiro</h1>
      <AjusteFinanceiroForm
        defaultLancamentoOriginalId={lancamentoOriginalId}
        onSubmit={handleSubmit}
        isSubmitting={criar.isPending}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
