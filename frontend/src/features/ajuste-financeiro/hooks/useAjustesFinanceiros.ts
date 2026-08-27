import { useQuery } from '@tanstack/react-query'
import { ajusteFinanceiroApi } from '../api/ajusteFinanceiroApi'
import { ajusteFinanceiroKeys } from './queryKeys'

/** `lancamentoOriginalId` é o único filtro real exposto por `GET /api/ajustes-financeiros`. */
export function useAjustesFinanceiros(lancamentoOriginalId?: string) {
  return useQuery({
    queryKey: ajusteFinanceiroKeys.list(lancamentoOriginalId),
    queryFn: () => ajusteFinanceiroApi.listar(lancamentoOriginalId),
  })
}
