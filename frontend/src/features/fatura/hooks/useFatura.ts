import { useQuery } from '@tanstack/react-query'
import { faturaApi } from '../api/faturaApi'
import { faturaKeys } from './queryKeys'

export function useFatura(id: string | undefined) {
  return useQuery({
    queryKey: faturaKeys.detail(id ?? ''),
    queryFn: () => faturaApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
