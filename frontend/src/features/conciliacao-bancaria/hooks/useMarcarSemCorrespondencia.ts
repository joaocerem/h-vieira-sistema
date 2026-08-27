import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'

/** Só válido quando o Vínculo está `Não Vinculado`. */
export function useMarcarSemCorrespondencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vinculoConciliacaoApi.marcarSemCorrespondencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
