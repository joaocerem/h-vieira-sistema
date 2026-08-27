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
import { useCategoriaOptions } from '@/shared/hooks/useCategoriaOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { LancamentoFinanceiro } from '../types'

const STATUS_FINANCEIRO_VARIANT = {
  Aberto: 'secondary',
  'Parcialmente Pago-Recebido': 'outline',
  'Pago-Recebido': 'default',
} as const

export function LancamentoTable({ lancamentos }: { lancamentos: LancamentoFinanceiro[] }) {
  const { data: categorias } = useCategoriaOptions()

  if (lancamentos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum lançamento cadastrado ainda.</p>
    )
  }

  function categoriaNome(categoriaId: string) {
    return categorias?.find((categoria) => categoria.id === categoriaId)?.nome ?? '—'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Situação</TableHead>
          <TableHead>Status financeiro</TableHead>
          <TableHead className="w-32 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lancamentos.map((lancamento) => (
          <TableRow key={lancamento.id}>
            <TableCell>{lancamento.tipo}</TableCell>
            <TableCell>{categoriaNome(lancamento.categoriaId)}</TableCell>
            <TableCell>{lancamento.descricao ?? '—'}</TableCell>
            <TableCell>{formatCurrency(lancamento.valor)}</TableCell>
            <TableCell>{formatDate(lancamento.vencimento)}</TableCell>
            <TableCell>
              <Badge variant={lancamento.situacaoAdministrativa === 'Cancelado' ? 'destructive' : 'secondary'}>
                {lancamento.situacaoAdministrativa}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_FINANCEIRO_VARIANT[lancamento.statusFinanceiro as keyof typeof STATUS_FINANCEIRO_VARIANT] ?? 'outline'}>
                {lancamento.statusFinanceiro}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-3">
                <Link
                  to={`/ajustes-financeiros?lancamentoOriginalId=${lancamento.id}`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Ajustes
                </Link>
                <Link
                  to={`/lancamentos-financeiros/${lancamento.id}/editar`}
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
  )
}
