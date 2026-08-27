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
import { useClienteOptions } from '@/shared/hooks/useClienteOptions'
import { formatCurrency } from '@/shared/lib/formatters'
import type { Obra } from '../types'

const STATUS_VARIANT = {
  'A executar': 'secondary',
  'Em andamento': 'default',
  Pausada: 'outline',
  Concluída: 'secondary',
} as const

export function ObraTable({ obras }: { obras: Obra[] }) {
  const { data: clientes } = useClienteOptions()

  if (obras.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma obra cadastrada ainda.</p>
  }

  function clienteNome(clienteId: string) {
    return clientes?.find((cliente) => cliente.id === clienteId)?.nome ?? '—'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Valor contratado</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {obras.map((obra) => (
          <TableRow key={obra.id}>
            <TableCell>{obra.nome}</TableCell>
            <TableCell>{clienteNome(obra.clienteId)}</TableCell>
            <TableCell>{formatCurrency(obra.valorContratado)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[obra.status] ?? 'outline'}>{obra.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link
                to={`/obras/${obra.id}/editar`}
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
