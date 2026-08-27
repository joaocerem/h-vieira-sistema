import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contaBancariaApi } from '../api/contaBancariaApi'
import { contaBancariaKeys } from './queryKeys'

export function useCriarContaBancaria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contaBancariaApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contaBancariaKeys.all }),
  })
}
