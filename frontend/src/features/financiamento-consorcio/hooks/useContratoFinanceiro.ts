import { useQuery } from '@tanstack/react-query'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { contratoFinanceiroKeys } from './queryKeys'

export function useContratoFinanceiro(id: string | undefined) {
  return useQuery({
    queryKey: contratoFinanceiroKeys.detail(id ?? ''),
    queryFn: () => contratoFinanceiroApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
