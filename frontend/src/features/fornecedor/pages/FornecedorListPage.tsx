import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NomeUnicoTable } from '@/shared/components/crud/NomeUnicoTable'
import { useFornecedores } from '../hooks/useFornecedores'

export function FornecedorListPage() {
  const { data: fornecedores, isLoading, isError } = useFornecedores()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fornecedores</h1>
        <Button asChild>
          <Link to="/fornecedores/novo">Novo fornecedor</Link>
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
          Não foi possível carregar os fornecedores.
        </p>
      )}

      {Array.isArray(fornecedores) && (
        <NomeUnicoTable
          itens={fornecedores}
          editarHref={(id) => `/fornecedores/${id}/editar`}
          mensagemVazio="Nenhum fornecedor cadastrado ainda."
        />
      )}
    </div>
  )
}
