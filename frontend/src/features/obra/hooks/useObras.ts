import { useQuery } from '@tanstack/react-query'
import { obraApi } from '../api/obraApi'
import { obraKeys } from './queryKeys'

export function useObras() {
  return useQuery({ queryKey: obraKeys.all, queryFn: obraApi.listar })
}
