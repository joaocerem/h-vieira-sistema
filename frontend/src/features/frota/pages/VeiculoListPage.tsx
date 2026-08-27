import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useVeiculos } from '../hooks/useVeiculos'
import { VeiculoTable } from '../components/VeiculoTable'

export function VeiculoListPage() {
  const { data: veiculos, isLoading, isError } = useVeiculos()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Veículos</h1>
        <Button asChild>
          <Link to="/veiculos/novo">Novo veículo</Link>
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
        <p className="text-sm text-muted-foreground">Não foi possível carregar os veículos.</p>
      )}

      {Array.isArray(veiculos) && <VeiculoTable veiculos={veiculos} />}
    </div>
  )
}
