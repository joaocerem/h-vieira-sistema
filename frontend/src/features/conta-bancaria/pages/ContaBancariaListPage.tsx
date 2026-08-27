import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useContasBancarias } from '../hooks/useContasBancarias'
import { ContaBancariaTable } from '../components/ContaBancariaTable'

export function ContaBancariaListPage() {
  const { data: contasBancarias, isLoading, isError } = useContasBancarias()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Contas Bancárias</h1>
        <Button asChild>
          <Link to="/contas-bancarias/nova">Nova conta bancária</Link>
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
          Não foi possível carregar as contas bancárias.
        </p>
      )}

      {Array.isArray(contasBancarias) && (
        <ContaBancariaTable contasBancarias={contasBancarias} />
      )}
    </div>
  )
}
