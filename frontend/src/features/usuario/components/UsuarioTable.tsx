import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Usuario } from '../types'

export function UsuarioTable({ usuarios }: { usuarios: Usuario[] }) {
  if (usuarios.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Identificador de acesso</TableHead>
          <TableHead>Situação</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell>{usuario.nome}</TableCell>
            <TableCell>{usuario.identificadorDeAcesso}</TableCell>
            <TableCell>{usuario.situacaoDeAcesso ?? '—'}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`/usuarios/${usuario.id}/editar`}
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
