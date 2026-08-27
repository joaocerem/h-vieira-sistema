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
import { formatCurrency } from '@/shared/lib/formatters'
import type { ContratoFinanceiro } from '../types'

export function ContratoFinanceiroTable({ contratos }: { contratos: ContratoFinanceiro[] }) {
  const { data: fornecedores } = useFornecedorOptions()

  if (contratos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum contrato financeiro cadastrado ainda.</p>
  }

  function fornecedorNome(fornecedorId: string) {
    return fornecedores?.find((fornecedor) => fornecedor.id === fornecedorId)?.nome ?? '—'
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Valor contratado</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead>Detalhe</TableHead>
            <TableHead className="w-40 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell>
                <Badge variant={contrato.tipo === 'Financiamento' ? 'default' : 'secondary'}>{contrato.tipo}</Badge>
              </TableCell>
              <TableCell>{fornecedorNome(contrato.fornecedorId)}</TableCell>
              <TableCell>{formatCurrency(contrato.valorContratado)}</TableCell>
              <TableCell>{contrato.numeroParcelas}x</TableCell>
              <TableCell>
                {contrato.tipo === 'Financiamento' ? (
                  contrato.taxa !== null ? (
                    `${contrato.taxa}% a.m.`
                  ) : (
                    '—'
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{contrato.grupoCota ?? '—'}</span>
                    <Badge variant={contrato.contemplado ? 'default' : 'outline'}>
                      {contrato.contemplado ? 'Contemplado' : 'Não contemplado'}
                    </Badge>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    to={`/parcelas?contratoFinanceiroId=${contrato.id}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Ver parcelas
                  </Link>
                  <Link
                    to={`/contratos-financeiros/${contrato.id}/editar`}
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
