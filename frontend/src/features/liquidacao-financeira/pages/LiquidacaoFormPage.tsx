import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { translateApiError, type FieldError } from '@/shared/api/errors'
import { useCriarLiquidacao } from '../hooks/useCriarLiquidacao'
import { LiquidacaoForm, type LiquidacaoFormValues } from '../components/LiquidacaoForm'

/** Só criação — Liquidação Financeira é imutável desde a criação (D12), sem página de edição. */
export function LiquidacaoFormPage() {
  const navigate = useNavigate()
  const criar = useCriarLiquidacao()
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  function handleSubmit(values: LiquidacaoFormValues) {
    setFieldErrors([])

    criar.mutate(values, {
      onError: (error) => setFieldErrors(translateApiError(error).fieldErrors),
      onSuccess: (liquidacao) => {
        toast.success('Liquidação criada com sucesso.')
        navigate(`/liquidacoes-financeiras/${liquidacao.id}`)
      },
    })
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Nova liquidação</h1>
      <LiquidacaoForm
        onSubmit={handleSubmit}
        isSubmitting={criar.isPending}
        serverFieldErrors={fieldErrors}
      />
    </div>
  )
}
