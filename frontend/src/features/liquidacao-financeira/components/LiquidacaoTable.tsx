import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { LiquidacaoFinanceira } from '../types'

/**
 * Sem link de "Editar" — Liquidação Financeira é imutável desde a criação (D12). O link leva
 * para uma página de detalhes só leitura (`LiquidacaoDetailPage`), não um formulário de edição.
 */
export function LiquidacaoTable({ liquidacoes }: { liquidacoes: LiquidacaoFinanceira[] }) {
  const { data: contasBancarias } = useContaBancariaOptions()

  if (liquidacoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma liquidação registrada ainda.</p>
    )
  }

  function contaBancariaLabel(contaBancariaId: string) {
    const conta = contasBancarias?.find((c) => c.id === contaBancariaId)
    return conta ? `${conta.banco} — ${conta.apelido}` : '—'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Data efetiva</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Conta bancária</TableHead>
          <TableHead>Lançamentos cobertos</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {liquidacoes.map((liquidacao) => (
          <TableRow key={liquidacao.id}>
            <TableCell>{liquidacao.tipo}</TableCell>
            <TableCell>{formatDate(liquidacao.dataEfetiva)}</TableCell>
            <TableCell>{formatCurrency(liquidacao.valor)}</TableCell>
            <TableCell>{contaBancariaLabel(liquidacao.contaBancariaId)}</TableCell>
            <TableCell>{liquidacao.aplicacoes.length}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`/liquidacoes-financeiras/${liquidacao.id}`}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Ver detalhes
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
