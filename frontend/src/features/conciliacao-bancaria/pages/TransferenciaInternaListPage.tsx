import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useTransferenciasInternas } from '../hooks/useTransferenciasInternas'
import { TransferenciaInternaTable } from '../components/TransferenciaInternaTable'

export function TransferenciaInternaListPage() {
  const { data: transferencias, isLoading, isError } = useTransferenciasInternas()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Transferências Internas</h1>
        <Button asChild>
          <Link to="/conciliacao-bancaria/transferencias/nova">Nova transferência</Link>
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
          Não foi possível carregar as transferências internas.
        </p>
      )}

      {Array.isArray(transferencias) && <TransferenciaInternaTable transferencias={transferencias} />}
    </div>
  )
}
