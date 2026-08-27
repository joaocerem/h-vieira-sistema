import { useQuery } from '@tanstack/react-query'
import { compraCartaoApi } from '../api/compraCartaoApi'
import { compraCartaoKeys } from './queryKeys'

export function useComprasCartao() {
  return useQuery({
    queryKey: compraCartaoKeys.all,
    queryFn: compraCartaoApi.listar,
  })
}
