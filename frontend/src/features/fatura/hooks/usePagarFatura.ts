import { useMutation, useQueryClient } from '@tanstack/react-query'
import { faturaApi } from '../api/faturaApi'
import { faturaKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'
import type { PagarFaturaValues } from '../types'

/**
 * `FaturaService#pagar` cria uma Liquidação Financeira (Aplicações cobrindo os Lançamentos já
 * gerados pelas Parcelas do ciclo) — que, por sua vez, gera automaticamente uma Movimentação
 * Bancária já `Confirmada` (mesma cadeia de integração já corrigida em `useCriarLiquidacao`,
 * `features/liquidacao-financeira/`, mas disparada aqui a partir de um ponto de entrada
 * diferente — pagar uma Fatura, não criar uma Liquidação diretamente). Invalida as quatro
 * listas afetadas: Liquidação (nova), Movimentação/Vínculo (gerados em cascata) e Lançamento
 * (`statusFinanceiro` recalculado para os Lançamentos aplicados).
 */
export function usePagarFatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PagarFaturaValues }) => faturaApi.pagar(id, values),
    onSuccess: (fatura) => {
      queryClient.invalidateQueries({ queryKey: faturaKeys.all })
      queryClient.invalidateQueries({ queryKey: faturaKeys.detail(fatura.id) })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.liquidacoesFinanceiras })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.movimentacoesBancarias })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.vinculosConciliacao })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.lancamentosFinanceiros })
    },
  })
}
