import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useLancamentos } from '../hooks/useLancamentos'
import { LancamentoTable } from '../components/LancamentoTable'

export function LancamentoListPage() {
  const { data: lancamentos, isLoading, isError } = useLancamentos()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lançamentos Financeiros</h1>
        <Button asChild>
          <Link to="/lancamentos-financeiros/novo">Novo lançamento</Link>
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
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os lançamentos financeiros.
        </p>
      )}

      {Array.isArray(lancamentos) && <LancamentoTable lancamentos={lancamentos} />}
    </div>
  )
}
