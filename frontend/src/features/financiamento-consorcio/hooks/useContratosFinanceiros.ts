import { useQuery } from '@tanstack/react-query'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { contratoFinanceiroKeys } from './queryKeys'

export function useContratosFinanceiros() {
  return useQuery({
    queryKey: contratoFinanceiroKeys.all,
    queryFn: contratoFinanceiroApi.listar,
  })
}
