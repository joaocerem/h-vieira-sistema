import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoTable } from '@/shared/components/crud/NomeUnicoTable'
import { useClientes } from '../hooks/useClientes'

export function ClienteListPage() {
  const { data: clientes, isLoading, isError } = useClientes()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <Button asChild>
          <Link to="/clientes/novo">Novo cliente</Link>
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
        <p className="text-sm text-muted-foreground">Não foi possível carregar os clientes.</p>
      )}

      {Array.isArray(clientes) && (
        <NomeUnicoTable
          itens={clientes}
          editarHref={(id) => `/clientes/${id}/editar`}
          mensagemVazio="Nenhum cliente cadastrado ainda."
        />
      )}
    </div>
  )
}
