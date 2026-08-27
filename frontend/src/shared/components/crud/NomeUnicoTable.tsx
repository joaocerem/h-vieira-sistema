import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export interface NomeUnicoItem {
  id: string
  nome: string
}

/**
 * Tabela compartilhada para entidades de cadastro simples com um único campo (`nome`) —
 * mesma extração de `NomeUnicoForm`. Tabela HTML simples (`decisions.md`, decisão #49).
 */
export function NomeUnicoTable({
  itens,
  editarHref,
  mensagemVazio,
}: {
  itens: NomeUnicoItem[]
  editarHref: (id: string) => string
  mensagemVazio: string
}) {
  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">{mensagemVazio}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.nome}</TableCell>
            <TableCell className="text-right">
              <Link
                to={editarHref(item.id)}
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
