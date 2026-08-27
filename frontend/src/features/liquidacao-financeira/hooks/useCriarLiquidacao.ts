import { useMutation, useQueryClient } from '@tanstack/react-query'
import { liquidacaoFinanceiraApi } from '../api/liquidacaoFinanceiraApi'
import { liquidacaoFinanceiraKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'

export function useCriarLiquidacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: liquidacaoFinanceiraApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liquidacaoFinanceiraKeys.all })
      // Registrar uma Liquidação muda `statusFinanceiro` (calculado) dos Lançamentos cobertos
      // — invalida a lista de referência para as telas de Lançamento refletirem o novo status.
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.lancamentosFinanceiros })
      // `LiquidacaoFinanceiraService#criar` gera automaticamente uma Movimentação Bancária (já
      // com Vínculo Conciliação `Confirmado`, sem passar por `Sugerido` — mesma transação, ver
      // `MovimentacaoBancariaService#gerarAPartirDeLiquidacao`) — invalida as duas listas para
      // que a tela de Conciliação Bancária reflita a nova Movimentação sem exigir refresh manual.
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.movimentacoesBancarias })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.vinculosConciliacao })
    },
  })
}
