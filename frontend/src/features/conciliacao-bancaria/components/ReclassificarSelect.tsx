import { Badge } from '@/shared/components/ui/badge'
import type { Classificacao, MovimentacaoBancaria } from '../types'

const OPCOES_RECLASSIFICACAO: Classificacao[] = [
  'Terraplanagem',
  'Fora da Operação',
  'Retirada do Patrão',
  'Não Classificada',
]

/**
 * `'Transferência Interna'` nunca é oferecida como destino — só atribuída via
 * `POST /api/transferencias-internas` (`MovimentacaoBancariaService#reclassificar` recusa
 * explicitamente essa atribuição por aqui — `movimentacaoBancariaApi.ts`). Uma Movimentação já
 * classificada assim aparece como rótulo fixo, não como select editável: o backend não impede
 * reclassificá-la para outro valor por este mesmo endpoint, mas o domínio não descreve
 * "desfazer" uma Transferência Interna como um fluxo real (`docs/domain-model/
 * 13-transferencia-interna.md` não define esse caminho) — expor um select ali sugeriria uma
 * funcionalidade que não existe de fato, então o rótulo fixo é a representação mais fiel.
 */
export function ReclassificarSelect({
  movimentacao,
  onReclassificar,
  isPending,
}: {
  movimentacao: MovimentacaoBancaria
  onReclassificar: (classificacao: Classificacao) => void
  isPending: boolean
}) {
  if (movimentacao.classificacao === 'Transferência Interna') {
    return <Badge variant="secondary">Transferência Interna</Badge>
  }

  return (
    <select
      aria-label={`Classificação de ${movimentacao.descricao}`}
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
      value={movimentacao.classificacao}
      disabled={isPending}
      onChange={(event) => onReclassificar(event.target.value as Classificacao)}
    >
      {OPCOES_RECLASSIFICACAO.map((opcao) => (
        <option key={opcao} value={opcao}>
          {opcao}
        </option>
      ))}
    </select>
  )
}
