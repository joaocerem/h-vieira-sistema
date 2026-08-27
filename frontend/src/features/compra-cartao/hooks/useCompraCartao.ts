import { useQuery } from '@tanstack/react-query'
import { compraCartaoApi } from '../api/compraCartaoApi'
import { compraCartaoKeys } from './queryKeys'

export function useCompraCartao(id: string | undefined) {
  return useQuery({
    queryKey: compraCartaoKeys.detail(id ?? ''),
    queryFn: () => compraCartaoApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
