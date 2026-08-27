import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { ReclassificarSelect } from './ReclassificarSelect'
import { VinculoConciliacaoActions } from './VinculoConciliacaoActions'
import type { Classificacao, EstadoConciliacao, MovimentacaoBancaria, VinculoConciliacao } from '../types'

const ESTADO_VARIANT: Record<EstadoConciliacao, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  'Não Vinculado': 'outline',
  Sugerido: 'secondary',
  Confirmado: 'default',
  Divergente: 'destructive',
  'Sem Correspondência': 'outline',
}

export function MovimentacaoBancariaTable({
  movimentacoes,
  vinculos,
  onReclassificar,
  onConfirmar,
  onMarcarDivergente,
  onMarcarSemCorrespondencia,
  onVincularManualmente,
  isMutating,
}: {
  movimentacoes: MovimentacaoBancaria[]
  vinculos: VinculoConciliacao[] | undefined
  onReclassificar: (id: string, classificacao: Classificacao) => void
  onConfirmar: (id: string) => void
  onMarcarDivergente: (id: string) => void
  onMarcarSemCorrespondencia: (id: string) => void
  onVincularManualmente: (id: string, liquidacaoFinanceiraId: string) => void
  isMutating: boolean
}) {
  if (movimentacoes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma movimentação importada ainda.</p>
  }

  function vinculoDaMovimentacao(movimentacaoId: string) {
    return vinculos?.find((vinculo) => vinculo.movimentacaoBancariaId === movimentacaoId)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Conciliação</TableHead>
            <TableHead className="min-w-72">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimentacoes.map((movimentacao) => {
            const vinculo = vinculoDaMovimentacao(movimentacao.id)
            return (
              <TableRow key={movimentacao.id}>
                <TableCell>{formatDate(movimentacao.data)}</TableCell>
                <TableCell>{movimentacao.descricao}</TableCell>
                <TableCell>{formatCurrency(movimentacao.valor)}</TableCell>
                <TableCell>
                  <ReclassificarSelect
                    movimentacao={movimentacao}
                    onReclassificar={(classificacao) => onReclassificar(movimentacao.id, classificacao)}
                    isPending={isMutating}
                  />
                </TableCell>
                <TableCell>
                  {vinculo ? (
                    <Badge variant={ESTADO_VARIANT[vinculo.estadoConciliacao]}>{vinculo.estadoConciliacao}</Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {vinculo && (
                    <VinculoConciliacaoActions
                      vinculo={vinculo}
                      onConfirmar={() => onConfirmar(vinculo.id)}
                      onMarcarDivergente={() => onMarcarDivergente(vinculo.id)}
                      onMarcarSemCorrespondencia={() => onMarcarSemCorrespondencia(vinculo.id)}
                      onVincularManualmente={(liquidacaoFinanceiraId) =>
                        onVincularManualmente(vinculo.id, liquidacaoFinanceiraId)
                      }
                      isPending={isMutating}
                    />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
