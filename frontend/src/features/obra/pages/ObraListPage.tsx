import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useObras } from '../hooks/useObras'
import { ObraTable } from '../components/ObraTable'

export function ObraListPage() {
  const { data: obras, isLoading, isError } = useObras()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Obras</h1>
        <Button asChild>
          <Link to="/obras/nova">Nova obra</Link>
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
        <p className="text-sm text-muted-foreground">Não foi possível carregar as obras.</p>
      )}

      {Array.isArray(obras) && <ObraTable obras={obras} />}
    </div>
  )
}
