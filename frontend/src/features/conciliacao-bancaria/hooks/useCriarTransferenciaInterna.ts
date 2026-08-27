import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transferenciaInternaApi } from '../api/transferenciaInternaApi'
import { transferenciaInternaKeys, movimentacaoBancariaKeys } from './queryKeys'

/**
 * Criar uma Transferência Interna reclassifica as duas Movimentações envolvidas para
 * `'Transferência Interna'`, na mesma transação (`TransferenciaInternaService#criar`) — invalida
 * também a lista de Movimentações para refletir isso sem exigir refresh manual.
 */
export function useCriarTransferenciaInterna() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transferenciaInternaApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferenciaInternaKeys.all })
      queryClient.invalidateQueries({ queryKey: movimentacaoBancariaKeys.all })
    },
  })
}
