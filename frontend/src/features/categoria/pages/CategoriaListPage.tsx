import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCategorias } from '../hooks/useCategorias'
import { CategoriaTable } from '../components/CategoriaTable'

export function CategoriaListPage() {
  const { data: categorias, isLoading, isError } = useCategorias()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categorias</h1>
        <Button asChild>
          <Link to="/categorias/nova">Nova categoria</Link>
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
          Não foi possível carregar as categorias.
        </p>
      )}

      {Array.isArray(categorias) && <CategoriaTable categorias={categorias} />}
    </div>
  )
}
