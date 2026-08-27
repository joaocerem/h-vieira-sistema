import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { lancamentoFinanceiroKeys } from './queryKeys'
import type { LancamentoAtualizarValues } from '../types'

export function useAtualizarLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: LancamentoAtualizarValues }) =>
      lancamentoFinanceiroApi.atualizar(id, values),
    onSuccess: (lancamento) => {
      queryClient.invalidateQueries({ queryKey: lancamentoFinanceiroKeys.all })
      queryClient.invalidateQueries({ queryKey: lancamentoFinanceiroKeys.detail(lancamento.id) })
    },
  })
}
