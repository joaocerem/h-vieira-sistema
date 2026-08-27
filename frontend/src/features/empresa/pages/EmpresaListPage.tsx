import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoTable } from '@/shared/components/crud/NomeUnicoTable'
import { useEmpresas } from '../hooks/useEmpresas'

export function EmpresaListPage() {
  const { data: empresas, isLoading, isError } = useEmpresas()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Empresas</h1>
        <Button asChild>
          <Link to="/empresas/nova">Nova empresa</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {/* Erro já é exibido globalmente via toast (QueryProvider) — aqui só o estado local
          impede tentar renderizar a tabela com dado inexistente. */}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar as empresas.
        </p>
      )}

      {Array.isArray(empresas) && (
        <NomeUnicoTable
          itens={empresas}
          editarHref={(id) => `/empresas/${id}/editar`}
          mensagemVazio="Nenhuma empresa cadastrada ainda."
        />
      )}
    </div>
  )
}
