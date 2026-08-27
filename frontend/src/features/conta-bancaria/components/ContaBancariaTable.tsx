import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import type { ContaBancaria } from '../types'

export function ContaBancariaTable({ contasBancarias }: { contasBancarias: ContaBancaria[] }) {
  // A resposta da API só traz `empresaId` (UUID) — resolvido aqui para o nome, client-side,
  // reaproveitando a mesma lista/cache já usada pelo formulário de criação.
  const { data: empresas } = useEmpresaOptions()

  if (contasBancarias.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma conta bancária cadastrada ainda.</p>
    )
  }

  function nomeDaEmpresa(empresaId: string) {
    return empresas?.find((empresa) => empresa.id === empresaId)?.nome ?? '—'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Banco</TableHead>
          <TableHead>Apelido</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contasBancarias.map((conta) => (
          <TableRow key={conta.id}>
            <TableCell>{nomeDaEmpresa(conta.empresaId)}</TableCell>
            <TableCell>{conta.banco}</TableCell>
            <TableCell>{conta.apelido}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`/contas-bancarias/${conta.id}/editar`}
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
