import { useQuery } from '@tanstack/react-query'
import { empresaApi } from '../api/empresaApi'
import { empresaKeys } from './queryKeys'

export function useEmpresa(id: string | undefined) {
  return useQuery({
    queryKey: empresaKeys.detail(id ?? ''),
    queryFn: () => empresaApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
