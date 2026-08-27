import { useMutation, useQueryClient } from '@tanstack/react-query'
import { compraCartaoApi } from '../api/compraCartaoApi'
import { compraCartaoKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * `CompraCartaoService#criar` gera automaticamente, na mesma transação, as `numeroParcelas`
 * Parcelas do parcelamento (`ParcelaService#gerarParcelasParaCompra`, decisão #39) — invalida
 * também a lista de Parcelas para que `features/parcela/` reflita isso sem refresh manual.
 */
export function useCriarCompraCartao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: compraCartaoApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compraCartaoKeys.all })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.parcelas })
    },
  })
}
