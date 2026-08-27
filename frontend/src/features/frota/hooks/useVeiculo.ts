import { useQuery } from '@tanstack/react-query'
import { veiculoApi } from '../api/veiculoApi'
import { veiculoKeys } from './queryKeys'

export function useVeiculo(id: string | undefined) {
  return useQuery({
    queryKey: veiculoKeys.detail(id ?? ''),
    queryFn: () => veiculoApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
