import { useQuery } from '@tanstack/react-query'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { cartaoCreditoKeys } from './queryKeys'

export function useCartaoCredito(id: string | undefined) {
  return useQuery({
    queryKey: cartaoCreditoKeys.detail(id ?? ''),
    queryFn: () => cartaoCreditoApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
