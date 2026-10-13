import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'

/** Recusado pelo backend quando o Vínculo já está `Confirmado` — `VinculoConciliacaoActions` já não mostra o controle nesse estado. */
export function useVincularManualmente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, lancamentoFinanceiroIds }: { id: string; lancamentoFinanceiroIds: string[] }) =>
      vinculoConciliacaoApi.vincularManualmente(id, lancamentoFinanceiroIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
