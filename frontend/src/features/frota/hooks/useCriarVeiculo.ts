import { useMutation, useQueryClient } from '@tanstack/react-query'
import { veiculoApi } from '../api/veiculoApi'
import { veiculoKeys } from './queryKeys'

export function useCriarVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: veiculoApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: veiculoKeys.all }),
  })
}
