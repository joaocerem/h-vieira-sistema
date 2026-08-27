import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useImportarMovimentacoes } from '../hooks/useImportarMovimentacoes'
import {
  ImportarMovimentacoesForm,
  type ImportarMovimentacoesFormValues,
} from '../components/ImportarMovimentacoesForm'

export function MovimentacaoImportarPage() {
  const navigate = useNavigate()
  const importar = useImportarMovimentacoes()

  function handleSubmit(values: ImportarMovimentacoesFormValues) {
    importar.mutate(values, {
      onSuccess: (movimentacoes) => {
        toast.success(`${movimentacoes.length} movimentação(ões) importada(s) com sucesso.`)
        navigate('/conciliacao-bancaria')
      },
    })
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Importar extrato bancário</h1>
      <ImportarMovimentacoesForm onSubmit={handleSubmit} isSubmitting={importar.isPending} />
    </div>
  )
}
