import { useMutation, useQueryClient } from '@tanstack/react-query'
import { obraApi } from '../api/obraApi'
import { obraKeys } from './queryKeys'

export function useCriarObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: obraApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: obraKeys.all }),
  })
}
