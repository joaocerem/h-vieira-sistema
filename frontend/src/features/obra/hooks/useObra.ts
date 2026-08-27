import { useQuery } from '@tanstack/react-query'
import { obraApi } from '../api/obraApi'
import { obraKeys } from './queryKeys'

export function useObra(id: string | undefined) {
  return useQuery({
    queryKey: obraKeys.detail(id ?? ''),
    queryFn: () => obraApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
