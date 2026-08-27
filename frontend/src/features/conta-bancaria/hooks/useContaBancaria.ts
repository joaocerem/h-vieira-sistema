import { useQuery } from '@tanstack/react-query'
import { contaBancariaApi } from '../api/contaBancariaApi'
import { contaBancariaKeys } from './queryKeys'

export function useContaBancaria(id: string | undefined) {
  return useQuery({
    queryKey: contaBancariaKeys.detail(id ?? ''),
    queryFn: () => contaBancariaApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
