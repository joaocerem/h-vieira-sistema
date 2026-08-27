import { useParams } from 'react-router'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { useLiquidacao } from '../hooks/useLiquidacao'

/**
 * Só leitura — Liquidação Financeira é imutável desde a criação (D12), sem formulário de
 * edição. Mostra também as Aplicações de Liquidação vinculadas (sem tela própria — ver
 * `features/liquidacao-financeira/types.ts`).
 */
export function LiquidacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: liquidacao, isLoading } = useLiquidacao(id)
  const { data: contasBancarias } = useContaBancariaOptions()
  const { data: lancamentos } = useLancamentoOptions()

  if (isLoading) {
    return (
      <div className="grid max-w-2xl gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!liquidacao) {
    return <p className="text-sm text-muted-foreground">Liquidação não encontrada.</p>
  }

  const contaBancaria = contasBancarias?.find((c) => c.id === liquidacao.contaBancariaId)

  return (
    <div className="grid max-w-2xl gap-4">
      <h1 className="text-lg font-semibold">Liquidação — {liquidacao.tipo}</h1>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Data efetiva</dt>
        <dd>{formatDate(liquidacao.dataEfetiva)}</dd>
        <dt className="text-muted-foreground">Valor</dt>
        <dd>{formatCurrency(liquidacao.valor)}</dd>
        <dt className="text-muted-foreground">Conta bancária</dt>
        <dd>{contaBancaria ? `${contaBancaria.banco} — ${contaBancaria.apelido}` : '—'}</dd>
      </dl>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Lançamentos cobertos</span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lançamento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor aplicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liquidacao.aplicacoes.map((aplicacao) => {
              const lancamento = lancamentos?.find((l) => l.id === aplicacao.lancamentoFinanceiroId)
              return (
                <TableRow key={aplicacao.id}>
                  <TableCell>{lancamento ? lancamento.tipo : aplicacao.lancamentoFinanceiroId}</TableCell>
                  <TableCell>{lancamento ? formatDate(lancamento.vencimento) : '—'}</TableCell>
                  <TableCell>{formatCurrency(aplicacao.valorAplicado)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
