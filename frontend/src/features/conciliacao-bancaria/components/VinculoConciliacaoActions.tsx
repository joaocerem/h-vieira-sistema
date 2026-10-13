import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { VinculoConciliacao } from '../types'

/**
 * Botões calculados a partir das mesmas guardas que `VinculoConciliacaoService` aplica
 * (backend) — mesmo espírito de `ObraStatusActions.tsx`: decide só quais controles mostrar; quem
 * valida de fato continua sendo o backend (`BusinessException` → toast global em qualquer
 * tentativa inválida).
 *
 * A partir da Sprint 3 (rodada de evolução operacional): vínculo com Lançamento Financeiro
 * diretamente (N:N, substitui Liquidação Financeira) — a vinculação manual escolhe um ou mais
 * Lançamentos de uma vez (ex. pagamento de fatura de cartão cobrindo várias Parcelas).
 *
 * - Confirmar: só quando `estadoConciliacao === 'Sugerido'` (`VinculoConciliacaoService#confirmar`).
 * - Marcar divergente: só quando já existe ao menos um Lançamento candidato
 *   (`lancamentosFinanceirosIds` não vazio) — `VinculoConciliacaoService#marcarDivergente` não olha
 *   o estado, só isso.
 * - Sem correspondência: só quando `estadoConciliacao === 'Não Vinculado'`
 *   (`VinculoConciliacaoService#marcarSemCorrespondencia`).
 * - Vincular manualmente: sempre, exceto quando já `Confirmado`
 *   (`VinculoConciliacaoService#vincularManualmente`).
 */
export function VinculoConciliacaoActions({
  vinculo,
  onConfirmar,
  onMarcarDivergente,
  onMarcarSemCorrespondencia,
  onVincularManualmente,
  isPending,
}: {
  vinculo: VinculoConciliacao
  onConfirmar: () => void
  onMarcarDivergente: () => void
  onMarcarSemCorrespondencia: () => void
  onVincularManualmente: (lancamentoFinanceiroIds: string[]) => void
  isPending: boolean
}) {
  const [vinculando, setVinculando] = useState(false)
  const [lancamentosEscolhidos, setLancamentosEscolhidos] = useState<string[]>([])
  const { data: lancamentos, isLoading: isLoadingLancamentos } = useLancamentoOptions()

  const podeConfirmar = vinculo.estadoConciliacao === 'Sugerido'
  const podeMarcarDivergente = vinculo.lancamentosFinanceirosIds.length > 0
  const podeMarcarSemCorrespondencia = vinculo.estadoConciliacao === 'Não Vinculado'
  const podeVincularManualmente = vinculo.estadoConciliacao !== 'Confirmado'

  if (vinculo.estadoConciliacao === 'Confirmado') {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  function alternarLancamento(id: string) {
    setLancamentosEscolhidos((atual) =>
      atual.includes(id) ? atual.filter((escolhidoId) => escolhidoId !== id) : [...atual, id],
    )
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {podeConfirmar && (
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onConfirmar}>
            Confirmar
          </Button>
        )}
        {podeMarcarDivergente && (
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onMarcarDivergente}>
            Marcar divergente
          </Button>
        )}
        {podeMarcarSemCorrespondencia && (
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onMarcarSemCorrespondencia}>
            Sem correspondência
          </Button>
        )}
        {podeVincularManualmente && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setVinculando((atual) => !atual)}
          >
            {vinculando ? 'Cancelar' : 'Vincular manualmente'}
          </Button>
        )}
      </div>

      {vinculando && podeVincularManualmente && (
        <div className="grid gap-2 rounded-lg border border-input p-2">
          {isLoadingLancamentos && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!isLoadingLancamentos && (lancamentos ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum Lançamento Financeiro disponível.</p>
          )}
          <div className="grid max-h-48 gap-1 overflow-y-auto">
            {(lancamentos ?? []).map((lancamento) => (
              <label key={lancamento.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lancamentosEscolhidos.includes(lancamento.id)}
                  onChange={() => alternarLancamento(lancamento.id)}
                  className="size-4 rounded border-input"
                />
                {lancamento.tipo} • {formatCurrency(lancamento.valor)} • vence {formatDate(lancamento.vencimento)}
                {lancamento.situacaoAdministrativa === 'Cancelado' ? ' • Cancelado' : ''}
              </label>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            className="w-fit"
            disabled={isPending || lancamentosEscolhidos.length === 0}
            onClick={() => {
              onVincularManualmente(lancamentosEscolhidos)
              setVinculando(false)
              setLancamentosEscolhidos([])
            }}
          >
            Vincular
          </Button>
        </div>
      )}
    </div>
  )
}
