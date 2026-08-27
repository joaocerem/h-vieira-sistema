import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { contratoFinanceiroKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * `ContratoFinanceiroService#criar` gera automaticamente, na mesma transação, as
 * `numeroParcelas` Parcelas do parcelamento (`ParcelaService#gerarParcelasParaContrato`,
 * decisão #40) — invalida também a lista de Parcelas, mesmo padrão de `useCriarCompraCartao`.
 */
export function useCriarContratoFinanceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contratoFinanceiroApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contratoFinanceiroKeys.all })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.parcelas })
    },
  })
}
