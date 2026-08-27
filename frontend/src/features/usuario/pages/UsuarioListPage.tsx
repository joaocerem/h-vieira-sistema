import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useUsuarios } from '../hooks/useUsuarios'
import { UsuarioTable } from '../components/UsuarioTable'

export function UsuarioListPage() {
  const { data: usuarios, isLoading, isError } = useUsuarios()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Usuários</h1>
        <Button asChild>
          <Link to="/usuarios/novo">Novo usuário</Link>
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
        <p className="text-sm text-muted-foreground">Não foi possível carregar os usuários.</p>
      )}

      {Array.isArray(usuarios) && <UsuarioTable usuarios={usuarios} />}
    </div>
  )
}
