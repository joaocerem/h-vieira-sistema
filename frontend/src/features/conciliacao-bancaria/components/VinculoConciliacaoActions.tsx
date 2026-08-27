import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { SelectField } from '@/shared/components/form/SelectField'
import { useLiquidacaoOptions } from '@/shared/hooks/useLiquidacaoOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { VinculoConciliacao } from '../types'

/**
 * Botões calculados a partir das mesmas guardas que `VinculoConciliacaoService` aplica
 * (backend) — mesmo espírito de `ObraStatusActions.tsx`: decide só quais controles mostrar; quem
 * valida de fato continua sendo o backend (`BusinessException` → toast global em qualquer
 * tentativa inválida).
 *
 * - Confirmar: só quando `estadoConciliacao === 'Sugerido'` (`VinculoConciliacaoService#confirmar`).
 * - Marcar divergente: só quando já existe uma Liquidação candidata (`liquidacaoFinanceiraId`
 *   presente) — `VinculoConciliacaoService#marcarDivergente` não olha o estado, só isso.
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
  onVincularManualmente: (liquidacaoFinanceiraId: string) => void
  isPending: boolean
}) {
  const [vinculando, setVinculando] = useState(false)
  const [liquidacaoEscolhida, setLiquidacaoEscolhida] = useState('')
  const { data: liquidacoes, isLoading: isLoadingLiquidacoes } = useLiquidacaoOptions()

  const podeConfirmar = vinculo.estadoConciliacao === 'Sugerido'
  const podeMarcarDivergente = vinculo.liquidacaoFinanceiraId !== null
  const podeMarcarSemCorrespondencia = vinculo.estadoConciliacao === 'Não Vinculado'
  const podeVincularManualmente = vinculo.estadoConciliacao !== 'Confirmado'

  if (vinculo.estadoConciliacao === 'Confirmado') {
    return <span className="text-sm text-muted-foreground">—</span>
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
        <div className="flex items-end gap-2">
          <SelectField
            id={`vincular-${vinculo.id}`}
            label=""
            placeholder={isLoadingLiquidacoes ? 'Carregando...' : 'Selecione a liquidação'}
            options={(liquidacoes ?? []).map((liquidacao) => ({
              value: liquidacao.id,
              label: `${liquidacao.tipo} • ${formatCurrency(liquidacao.valor)} • ${formatDate(liquidacao.dataEfetiva)}`,
            }))}
            disabled={isLoadingLiquidacoes}
            value={liquidacaoEscolhida}
            onChange={(event) => setLiquidacaoEscolhida(event.target.value)}
            className="w-64"
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !liquidacaoEscolhida}
            onClick={() => {
              onVincularManualmente(liquidacaoEscolhida)
              setVinculando(false)
              setLiquidacaoEscolhida('')
            }}
          >
            Vincular
          </Button>
        </div>
      )}
    </div>
  )
}
