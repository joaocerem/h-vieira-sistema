import { useQuery } from '@tanstack/react-query'
import { liquidacaoFinanceiraApi } from '../api/liquidacaoFinanceiraApi'
import { liquidacaoFinanceiraKeys } from './queryKeys'

export function useLiquidacoes() {
  return useQuery({
    queryKey: liquidacaoFinanceiraKeys.all,
    queryFn: liquidacaoFinanceiraApi.listar,
  })
}
