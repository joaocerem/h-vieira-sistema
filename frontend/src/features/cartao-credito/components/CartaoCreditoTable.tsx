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
import type { CartaoCredito } from '../types'

export function CartaoCreditoTable({ cartoes }: { cartoes: CartaoCredito[] }) {
  const { data: contasBancarias } = useContaBancariaOptions()

  if (cartoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum cartão de crédito cadastrado ainda.</p>
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
          <TableHead>Apelido</TableHead>
          <TableHead>Banco</TableHead>
          <TableHead>Conta bancária</TableHead>
          <TableHead>Fechamento</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cartoes.map((cartao) => (
          <TableRow key={cartao.id}>
            <TableCell>{cartao.apelido}</TableCell>
            <TableCell>{cartao.banco}</TableCell>
            <TableCell>{contaBancariaLabel(cartao.contaBancariaId)}</TableCell>
            <TableCell>{cartao.diaFechamento}</TableCell>
            <TableCell>{cartao.diaVencimento}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`/cartoes-credito/${cartao.id}/editar`}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Editar
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
