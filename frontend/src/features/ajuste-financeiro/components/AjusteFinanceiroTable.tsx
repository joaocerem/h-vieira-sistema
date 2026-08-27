import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { useUsuarioOptions } from '@/shared/hooks/useUsuarioOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { AjusteFinanceiro } from '../types'

/** Sem coluna de Ações — Ajuste Financeiro é imutável desde a criação (D13), sem `editar`/`excluir`. */
export function AjusteFinanceiroTable({ ajustes }: { ajustes: AjusteFinanceiro[] }) {
  const { data: lancamentos } = useLancamentoOptions()
  const { data: usuarios } = useUsuarioOptions()

  if (ajustes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum ajuste financeiro registrado ainda.</p>
  }

  function lancamentoDescricao(lancamentoId: string) {
    const lancamento = lancamentos?.find((l) => l.id === lancamentoId)
    return lancamento ? `${lancamento.tipo} • ${formatCurrency(lancamento.valor)}` : lancamentoId
  }

  function usuarioNome(usuarioId: string) {
    return usuarios?.find((usuario) => usuario.id === usuarioId)?.nome ?? '—'
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lançamento original</TableHead>
            <TableHead>Lançamento de ajuste</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ajustes.map((ajuste) => (
            <TableRow key={ajuste.id}>
              <TableCell>{lancamentoDescricao(ajuste.lancamentoOriginalId)}</TableCell>
              <TableCell>{lancamentoDescricao(ajuste.lancamentoAjusteId)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{ajuste.tipoAjuste}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(ajuste.valor)}</TableCell>
              <TableCell>{formatDate(ajuste.data)}</TableCell>
              <TableCell>{usuarioNome(ajuste.usuarioId)}</TableCell>
              <TableCell>{ajuste.observacao || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
