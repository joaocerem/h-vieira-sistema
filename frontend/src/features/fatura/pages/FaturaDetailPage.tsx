import { Link, useParams } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useParcelaOptions } from '@/shared/hooks/useParcelaOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { useFatura } from '../hooks/useFatura'

/**
 * Parcelas do ciclo lidas da lista completa (`useParcelaOptions`) e cruzadas no cliente por
 * `faturaId` — o backend não expõe esse filtro em `GET /api/parcelas` (só `compraCartaoId`/
 * `contratoFinanceiroId`), mesmo padrão de cruzamento já usado em `LiquidacaoDetailPage`. Sem
 * botão "Gerar lançamento" aqui — essa ação vive só em `features/parcela/` (fonte única),
 * evitando duplicar o controle de mutação em duas features.
 */
export function FaturaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: fatura, isLoading } = useFatura(id)
  const { data: cartoes } = useCartaoCreditoOptions()
  const { data: parcelas } = useParcelaOptions()

  if (isLoading) {
    return (
      <div className="grid max-w-2xl gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!fatura) {
    return <p className="text-sm text-muted-foreground">Fatura não encontrada.</p>
  }

  const cartao = cartoes?.find((c) => c.id === fatura.cartaoId)
  const parcelasDoCiclo = parcelas?.filter((parcela) => parcela.faturaId === fatura.id) ?? []

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fatura — {fatura.ciclo}</h1>
        {!fatura.liquidacaoFinanceiraId && (
          <Button asChild>
            <Link to={`/faturas/${fatura.id}/pagar`}>Pagar fatura</Link>
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Cartão</dt>
        <dd>{cartao ? `${cartao.banco} — ${cartao.apelido}` : '—'}</dd>
        <dt className="text-muted-foreground">Valor total calculado</dt>
        <dd>{formatCurrency(fatura.valorTotalCalculado)}</dd>
        <dt className="text-muted-foreground">Valor cobrado</dt>
        <dd>{formatCurrency(fatura.valorCobrado)}</dd>
        <dt className="text-muted-foreground">Pagamento</dt>
        <dd>
          <Badge variant={fatura.liquidacaoFinanceiraId ? 'default' : 'outline'}>
            {fatura.liquidacaoFinanceiraId ? 'Paga' : 'Aguardando pagamento'}
          </Badge>
        </dd>
      </dl>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Parcelas do ciclo</span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Lançamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcelasDoCiclo.map((parcela) => (
              <TableRow key={parcela.id}>
                <TableCell>
                  {parcela.numero}/{parcela.total}
                </TableCell>
                <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                <TableCell>{formatDate(parcela.vencimento)}</TableCell>
                <TableCell>
                  <Badge variant={parcela.lancamentoFinanceiroId ? 'default' : 'outline'}>
                    {parcela.lancamentoFinanceiroId ? 'Gerado' : 'Pendente'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
