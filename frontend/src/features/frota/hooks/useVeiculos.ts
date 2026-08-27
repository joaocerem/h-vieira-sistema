import { useQuery } from '@tanstack/react-query'
import { veiculoApi } from '../api/veiculoApi'
import { veiculoKeys } from './queryKeys'

export function useVeiculos() {
  return useQuery({ queryKey: veiculoKeys.all, queryFn: veiculoApi.listar })
}
