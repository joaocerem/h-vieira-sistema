import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCartoesCredito } from '../hooks/useCartoesCredito'
import { CartaoCreditoTable } from '../components/CartaoCreditoTable'

export function CartaoCreditoListPage() {
  const { data: cartoes, isLoading, isError } = useCartoesCredito()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Cartões de Crédito</h1>
        <Button asChild>
          <Link to="/cartoes-credito/novo">Novo cartão</Link>
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
          Não foi possível carregar os cartões de crédito.
        </p>
      )}

      {Array.isArray(cartoes) && <CartaoCreditoTable cartoes={cartoes} />}
    </div>
  )
}
