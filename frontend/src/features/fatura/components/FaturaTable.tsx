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
import { useCartaoCreditoOptions } from '@/shared/hooks/useCartaoCreditoOptions'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { formatCurrency } from '@/shared/lib/formatters'
import type { Fatura } from '../types'

export function FaturaTable({ faturas }: { faturas: Fatura[] }) {
  const { data: cartoes } = useCartaoCreditoOptions()
  const { data: contasBancarias } = useContaBancariaOptions()
  const { data: empresas } = useEmpresaOptions()

  if (faturas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma fatura fechada ainda.</p>
  }

  // Identificação do Cartão vira Empresa + Banco (decisão de negócio, Sprint 3) — Empresa
  // resolvida em duas etapas: `contaBancariaId` → Conta Bancária → `empresaId` → Empresa.
  function cartaoDescricao(cartaoId: string) {
    const cartao = cartoes?.find((c) => c.id === cartaoId)
    if (!cartao) return '—'
    const conta = contasBancarias?.find((c) => c.id === cartao.contaBancariaId)
    const empresa = conta ? empresas?.find((e) => e.id === conta.empresaId) : undefined
    return `${empresa?.nome ?? '—'} — ${cartao.banco}`
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cartão</TableHead>
            <TableHead>Ciclo</TableHead>
            <TableHead>Valor calculado</TableHead>
            <TableHead>Valor cobrado</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faturas.map((fatura) => (
            <TableRow key={fatura.id}>
              <TableCell>{cartaoDescricao(fatura.cartaoId)}</TableCell>
              <TableCell>{fatura.ciclo}</TableCell>
              <TableCell>{formatCurrency(fatura.valorTotalCalculado)}</TableCell>
              <TableCell>{formatCurrency(fatura.valorCobrado)}</TableCell>
              <TableCell>
                <Badge variant={fatura.paga ? 'default' : 'outline'}>
                  {fatura.paga ? 'Paga' : 'Aguardando pagamento'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link to={`/faturas/${fatura.id}`} className="text-sm text-primary underline-offset-4 hover:underline">
                  Ver detalhe
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
