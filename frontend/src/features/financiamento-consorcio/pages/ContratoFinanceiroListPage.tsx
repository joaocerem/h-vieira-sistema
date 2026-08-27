import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useContratosFinanceiros } from '../hooks/useContratosFinanceiros'
import { ContratoFinanceiroTable } from '../components/ContratoFinanceiroTable'

export function ContratoFinanceiroListPage() {
  const { data: contratos, isLoading, isError } = useContratosFinanceiros()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Financiamentos e Consórcios</h1>
        <Button asChild>
          <Link to="/contratos-financeiros/novo">Novo contrato</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">Não foi possível carregar os contratos financeiros.</p>
      )}

      {Array.isArray(contratos) && <ContratoFinanceiroTable contratos={contratos} />}
    </div>
  )
}
