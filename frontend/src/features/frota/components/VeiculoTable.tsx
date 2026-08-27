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
import { useObraOptions } from '@/shared/hooks/useObraOptions'
import type { Veiculo } from '../types'

export function VeiculoTable({ veiculos }: { veiculos: Veiculo[] }) {
  const { data: empresas } = useEmpresaOptions()
  const { data: obras } = useObraOptions()

  if (veiculos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado ainda.</p>
  }

  function empresaNome(empresaId: string) {
    return empresas?.find((empresa) => empresa.id === empresaId)?.nome ?? '—'
  }

  function obraAtualNome(obraAtualId: string | null) {
    if (!obraAtualId) return '—'
    return obras?.find((obra) => obra.id === obraAtualId)?.nome ?? '—'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome/identificação</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Obra atual</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {veiculos.map((veiculo) => (
          <TableRow key={veiculo.id}>
            <TableCell>{veiculo.nomeIdentificacao}</TableCell>
            <TableCell>{veiculo.tipo}</TableCell>
            <TableCell>{empresaNome(veiculo.empresaId)}</TableCell>
            <TableCell>{obraAtualNome(veiculo.obraAtualId)}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`/veiculos/${veiculo.id}/editar`}
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
