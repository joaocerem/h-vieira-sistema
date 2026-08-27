import { useQuery } from '@tanstack/react-query'
import { liquidacaoFinanceiraApi } from '../api/liquidacaoFinanceiraApi'
import { liquidacaoFinanceiraKeys } from './queryKeys'

export function useLiquidacao(id: string | undefined) {
  return useQuery({
    queryKey: liquidacaoFinanceiraKeys.detail(id ?? ''),
    queryFn: () => liquidacaoFinanceiraApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
