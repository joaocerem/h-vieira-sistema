import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { SelectField } from '@/shared/components/form/SelectField'
import { useContaBancariaOptions } from '@/shared/hooks/useContaBancariaOptions'
import { useMovimentacoes } from '../hooks/useMovimentacoes'
import { useVinculosConciliacao } from '../hooks/useVinculosConciliacao'
import { useReclassificarMovimentacao } from '../hooks/useReclassificarMovimentacao'
import { useConfirmarVinculo } from '../hooks/useConfirmarVinculo'
import { useMarcarDivergente } from '../hooks/useMarcarDivergente'
import { useMarcarSemCorrespondencia } from '../hooks/useMarcarSemCorrespondencia'
import { useVincularManualmente } from '../hooks/useVincularManualmente'
import { useRodarSugestaoAutomatica } from '../hooks/useRodarSugestaoAutomatica'
import { MovimentacaoBancariaTable } from '../components/MovimentacaoBancariaTable'

/**
 * Tela central do módulo — combina Movimentação Bancária e Vínculo Conciliação numa única
 * tabela, refletindo a relação 1:1 obrigatória entre as duas (`docs/domain-model/
 * 14-vinculo-conciliacao.md`, Seção 3: "toda Movimentação tem exatamente um Vínculo") — não é
 * uma tela artificial, é a forma real da relação. Sem filtro por conta no backend para Vínculo
 * (`VinculoConciliacaoController` só filtra por `estado`) — a lista completa de Vínculos é lida
 * e cruzada no cliente com as Movimentações já filtradas por conta, mesmo padrão de referência
 * já usado em `LiquidacaoDetailPage`.
 */
export function MovimentacaoListPage() {
  const [contaBancariaId, setContaBancariaId] = useState('')
  const { data: contasBancarias } = useContaBancariaOptions()
  const { data: movimentacoes, isLoading, isError } = useMovimentacoes(contaBancariaId || undefined)
  const { data: vinculos } = useVinculosConciliacao()

  const reclassificar = useReclassificarMovimentacao()
  const confirmar = useConfirmarVinculo()
  const marcarDivergente = useMarcarDivergente()
  const marcarSemCorrespondencia = useMarcarSemCorrespondencia()
  const vincularManualmente = useVincularManualmente()
  const sugestaoAutomatica = useRodarSugestaoAutomatica()

  const isMutating =
    reclassificar.isPending ||
    confirmar.isPending ||
    marcarDivergente.isPending ||
    marcarSemCorrespondencia.isPending ||
    vincularManualmente.isPending

  function handleSugestaoAutomatica() {
    sugestaoAutomatica.mutate(undefined, {
      onSuccess: (resultado) => {
        toast.success(
          `${resultado.processados} processada(s): ${resultado.sugeridos} sugerida(s), ${resultado.semCorrespondencia} sem correspondência.`,
        )
      },
    })
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Conciliação Bancária</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSugestaoAutomatica} disabled={sugestaoAutomatica.isPending}>
            {sugestaoAutomatica.isPending ? 'Processando...' : 'Rodar sugestão automática'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/conciliacao-bancaria/transferencias">Transferências internas</Link>
          </Button>
          <Button asChild>
            <Link to="/conciliacao-bancaria/importar">Importar extrato</Link>
          </Button>
        </div>
      </div>

      <SelectField
        id="filtro-conta-bancaria"
        label="Filtrar por conta bancária"
        placeholder="Todas as contas"
        options={(contasBancarias ?? []).map((conta) => ({
          value: conta.id,
          label: `${conta.banco} — ${conta.apelido}`,
        }))}
        value={contaBancariaId}
        onChange={(event) => setContaBancariaId(event.target.value)}
        className="max-w-xs"
      />

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar as movimentações bancárias.
        </p>
      )}

      {Array.isArray(movimentacoes) && (
        <MovimentacaoBancariaTable
          movimentacoes={movimentacoes}
          vinculos={vinculos}
          onReclassificar={(id, classificacao) => reclassificar.mutate({ id, classificacao })}
          onConfirmar={(id) => confirmar.mutate(id)}
          onMarcarDivergente={(id) => marcarDivergente.mutate(id)}
          onMarcarSemCorrespondencia={(id) => marcarSemCorrespondencia.mutate(id)}
          onVincularManualmente={(id, liquidacaoFinanceiraId) =>
            vincularManualmente.mutate({ id, liquidacaoFinanceiraId })
          }
          isMutating={isMutating}
        />
      )}
    </div>
  )
}
