import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { lancamentoFinanceiroKeys } from './queryKeys'

export function useCriarLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: lancamentoFinanceiroApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lancamentoFinanceiroKeys.all }),
  })
}
