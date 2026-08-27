import { useQuery } from '@tanstack/react-query'
import { faturaApi } from '../api/faturaApi'
import { faturaKeys } from './queryKeys'

export function useFaturas() {
  return useQuery({
    queryKey: faturaKeys.all,
    queryFn: faturaApi.listar,
  })
}
