import { useQuery } from '@tanstack/react-query'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { lancamentoFinanceiroKeys } from './queryKeys'

export function useLancamento(id: string | undefined) {
  return useQuery({
    queryKey: lancamentoFinanceiroKeys.detail(id ?? ''),
    queryFn: () => lancamentoFinanceiroApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
