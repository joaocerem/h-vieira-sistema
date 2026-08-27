import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'

/**
 * Sugestão determinística por valor+data (T6, tolerância configurável no backend) — nunca
 * confirma sozinha, só marca `Sugerido` (candidata encontrada) ou `Sem Correspondência`.
 */
export function useRodarSugestaoAutomatica() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: vinculoConciliacaoApi.rodarSugestaoAutomatica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
