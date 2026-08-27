import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useLiquidacoes } from '../hooks/useLiquidacoes'
import { LiquidacaoTable } from '../components/LiquidacaoTable'

export function LiquidacaoListPage() {
  const { data: liquidacoes, isLoading, isError } = useLiquidacoes()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Liquidações Financeiras</h1>
        <Button asChild>
          <Link to="/liquidacoes-financeiras/nova">Nova liquidação</Link>
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
          Não foi possível carregar as liquidações financeiras.
        </p>
      )}

      {Array.isArray(liquidacoes) && <LiquidacaoTable liquidacoes={liquidacoes} />}
    </div>
  )
}
