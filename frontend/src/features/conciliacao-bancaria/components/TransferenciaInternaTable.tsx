import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { useMovimentacoes } from '../hooks/useMovimentacoes'
import type { TransferenciaInterna } from '../types'

export function TransferenciaInternaTable({ transferencias }: { transferencias: TransferenciaInterna[] }) {
  const { data: movimentacoes } = useMovimentacoes()

  if (transferencias.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma transferência interna registrada ainda.</p>
  }

  function descricaoMovimentacao(movimentacaoId: string) {
    const movimentacao = movimentacoes?.find((m) => m.id === movimentacaoId)
    return movimentacao ? `${formatDate(movimentacao.data)} • ${movimentacao.descricao}` : movimentacaoId
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transferencias.map((transferencia) => (
            <TableRow key={transferencia.id}>
              <TableCell>{formatDate(transferencia.data)}</TableCell>
              <TableCell>{descricaoMovimentacao(transferencia.movimentacaoOrigemId)}</TableCell>
              <TableCell>{descricaoMovimentacao(transferencia.movimentacaoDestinoId)}</TableCell>
              <TableCell>{formatCurrency(transferencia.valor)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
