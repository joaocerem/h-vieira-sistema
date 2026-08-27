import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'

/** Só válido quando o Vínculo está `Sugerido` — `VinculoConciliacaoActions` só mostra o botão nesse estado. */
export function useConfirmarVinculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vinculoConciliacaoApi.confirmar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
