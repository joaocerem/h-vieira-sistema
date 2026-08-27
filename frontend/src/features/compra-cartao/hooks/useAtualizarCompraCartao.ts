import { useMutation, useQueryClient } from '@tanstack/react-query'
import { compraCartaoApi } from '../api/compraCartaoApi'
import { compraCartaoKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'
import type { CompraCartaoAtualizarValues } from '../types'

/**
 * Corrigir `categoriaId`/`obraId`/`veiculoId` propaga automaticamente para os Lançamentos já
 * gerados pelas Parcelas desta Compra, exceto os que já têm Rateio vinculado (D5, decisão #27,
 * `CompraCartaoService#propagarParaLancamentosJaGerados`) — invalida também a lista de
 * referência de Lançamentos, mesmo padrão já usado em `useCriarLiquidacao`.
 */
export function useAtualizarCompraCartao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CompraCartaoAtualizarValues }) =>
      compraCartaoApi.atualizar(id, values),
    onSuccess: (compra) => {
      queryClient.invalidateQueries({ queryKey: compraCartaoKeys.all })
      queryClient.invalidateQueries({ queryKey: compraCartaoKeys.detail(compra.id) })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.lancamentosFinanceiros })
    },
  })
}
