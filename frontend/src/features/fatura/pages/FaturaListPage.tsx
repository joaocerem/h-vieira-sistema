import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFaturas } from '../hooks/useFaturas'
import { FaturaTable } from '../components/FaturaTable'

export function FaturaListPage() {
  const { data: faturas, isLoading, isError } = useFaturas()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Faturas</h1>
        <Button asChild>
          <Link to="/faturas/fechar-ciclo">Fechar ciclo</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && <p className="text-sm text-muted-foreground">Não foi possível carregar as faturas.</p>}

      {Array.isArray(faturas) && <FaturaTable faturas={faturas} />}
    </div>
  )
}
