import { useQuery } from '@tanstack/react-query'
import { empresaApi } from '../api/empresaApi'
import { empresaKeys } from './queryKeys'

export function useEmpresas() {
  return useQuery({
    queryKey: empresaKeys.all,
    queryFn: empresaApi.listar,
  })
}
