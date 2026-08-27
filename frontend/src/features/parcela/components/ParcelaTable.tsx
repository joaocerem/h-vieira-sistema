import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { useCompraCartaoOptions } from '@/shared/hooks/useCompraCartaoOptions'
import { useContratoFinanceiroOptions } from '@/shared/hooks/useContratoFinanceiroOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { Parcela } from '../types'

export function ParcelaTable({
  parcelas,
  onGerarLancamento,
  isPending,
}: {
  parcelas: Parcela[]
  onGerarLancamento: (id: string) => void
  isPending: boolean
}) {
  const { data: comprasCartao } = useCompraCartaoOptions()
  const { data: contratosFinanceiros } = useContratoFinanceiroOptions()
  const { data: fornecedores } = useFornecedorOptions()

  if (parcelas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma parcela encontrada.</p>
  }

  function origemDescricao(parcela: Parcela) {
    if (parcela.origem === 'Compra Cartão' && parcela.compraCartaoId) {
      const compra = comprasCartao?.find((c) => c.id === parcela.compraCartaoId)
      const fornecedor = compra && fornecedores?.find((f) => f.id === compra.fornecedorId)
      return fornecedor ? `Compra — ${fornecedor.nome}` : 'Compra Cartão'
    }
    if (parcela.origem === 'Contrato Financeiro' && parcela.contratoFinanceiroId) {
      const contrato = contratosFinanceiros?.find((c) => c.id === parcela.contratoFinanceiroId)
      const fornecedor = contrato && fornecedores?.find((f) => f.id === contrato.fornecedorId)
      return fornecedor ? `${contrato.tipo} — ${fornecedor.nome}` : 'Contrato Financeiro'
    }
    return parcela.origem
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Origem</TableHead>
            <TableHead>Nº</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Fatura</TableHead>
            <TableHead>Lançamento</TableHead>
            <TableHead className="w-40 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((parcela) => (
            <TableRow key={parcela.id}>
              <TableCell>{origemDescricao(parcela)}</TableCell>
              <TableCell>
                {parcela.numero}/{parcela.total}
              </TableCell>
              <TableCell>{formatCurrency(parcela.valor)}</TableCell>
              <TableCell>{formatDate(parcela.vencimento)}</TableCell>
              <TableCell>
                {parcela.origem !== 'Compra Cartão' ? (
                  // Parcela de Contrato Financeiro nunca se relaciona com Fatura
                  // (`docs/domain-model/21-parcela.md`, Seção 2) — coluna não se aplica.
                  '—'
                ) : parcela.faturaId ? (
                  <Badge variant="secondary">Vinculada</Badge>
                ) : (
                  <Badge variant="outline">Aguardando</Badge>
                )}
              </TableCell>
              <TableCell>
                {parcela.lancamentoFinanceiroId ? (
                  <Badge variant="default">Gerado</Badge>
                ) : (
                  <Badge variant="outline">Pendente</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {!parcela.lancamentoFinanceiroId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onGerarLancamento(parcela.id)}
                  >
                    Gerar lançamento
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
