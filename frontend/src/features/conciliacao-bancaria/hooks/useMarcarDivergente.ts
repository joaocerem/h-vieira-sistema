import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'

/** Só válido quando o Vínculo já tem uma Liquidação candidata — nunca resolve divergência sozinho. */
export function useMarcarDivergente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vinculoConciliacaoApi.marcarDivergente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
