import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { Classificacao, CompraCartao } from '../types'

const CLASSIFICACAO_VARIANT: Record<Classificacao, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Terraplanagem: 'default',
  'Fora da Operação': 'outline',
  'Transferência Interna': 'secondary',
  'Retirada do Patrão': 'secondary',
  'Não Classificada': 'outline',
}

export function CompraCartaoTable({ compras }: { compras: CompraCartao[] }) {
  const { data: fornecedores } = useFornecedorOptions()
  const { data: categorias } = useCategoriaOptions()

  if (compras.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma compra de cartão cadastrada ainda.</p>
  }

  function fornecedorNome(fornecedorId: string) {
    return fornecedores?.find((fornecedor) => fornecedor.id === fornecedorId)?.nome ?? '—'
  }

  function categoriaNome(categoriaId: string) {
    return categorias?.find((categoria) => categoria.id === categoriaId)?.nome ?? '—'
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead className="w-40 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compras.map((compra) => (
            <TableRow key={compra.id}>
              <TableCell>{fornecedorNome(compra.fornecedorId)}</TableCell>
              <TableCell>{formatCurrency(compra.valor)}</TableCell>
              <TableCell>{formatDate(compra.data)}</TableCell>
              <TableCell>{categoriaNome(compra.categoriaId)}</TableCell>
              <TableCell>
                <Badge variant={CLASSIFICACAO_VARIANT[compra.classificacao]}>{compra.classificacao}</Badge>
              </TableCell>
              <TableCell>{compra.numeroParcelas}x</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    to={`/parcelas?compraCartaoId=${compra.id}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Ver parcelas
                  </Link>
                  <Link
                    to={`/compras-cartao/${compra.id}/editar`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
