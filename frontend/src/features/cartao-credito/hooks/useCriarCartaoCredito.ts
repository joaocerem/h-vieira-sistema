import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { cartaoCreditoKeys } from './queryKeys'

export function useCriarCartaoCredito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartaoCreditoApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartaoCreditoKeys.all }),
  })
}
