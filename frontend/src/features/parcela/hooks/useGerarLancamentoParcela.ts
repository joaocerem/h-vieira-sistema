import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parcelaApi } from '../api/parcelaApi'
import { parcelaKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'

/** Gera um novo Lançamento Financeiro — invalida a lista de referência de Lançamentos também. */
export function useGerarLancamentoParcela() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: parcelaApi.gerarLancamento,
    onSuccess: (parcela) => {
      queryClient.invalidateQueries({ queryKey: parcelaKeys.all })
      queryClient.invalidateQueries({ queryKey: parcelaKeys.detail(parcela.id) })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.lancamentosFinanceiros })
    },
  })
}
