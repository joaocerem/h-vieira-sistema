import { useQuery } from '@tanstack/react-query'
import { cartaoCreditoApi } from '../api/cartaoCreditoApi'
import { cartaoCreditoKeys } from './queryKeys'

export function useCartoesCredito() {
  return useQuery({ queryKey: cartaoCreditoKeys.all, queryFn: cartaoCreditoApi.listar })
}
