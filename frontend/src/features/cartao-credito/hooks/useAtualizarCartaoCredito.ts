import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { cartaoCreditoKeys } from './queryKeys'
import type { CartaoCreditoAtualizarValues } from '../types'

export function useAtualizarCartaoCredito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CartaoCreditoAtualizarValues }) =>
      cartaoCreditoApi.atualizar(id, values),
    onSuccess: (cartao) => {
      queryClient.invalidateQueries({ queryKey: cartaoCreditoKeys.all })
      queryClient.invalidateQueries({ queryKey: cartaoCreditoKeys.detail(cartao.id) })
    },
  })
}
