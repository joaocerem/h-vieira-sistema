import { useQuery } from '@tanstack/react-query'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { lancamentoFinanceiroKeys } from './queryKeys'

export function useLancamentos() {
  return useQuery({
    queryKey: lancamentoFinanceiroKeys.all,
    queryFn: lancamentoFinanceiroApi.listar,
  })
}
