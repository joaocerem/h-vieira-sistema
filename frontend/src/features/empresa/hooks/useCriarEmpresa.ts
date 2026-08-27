import { useMutation, useQueryClient } from '@tanstack/react-query'
import { empresaApi } from '../api/empresaApi'
import { empresaKeys } from './queryKeys'

export function useCriarEmpresa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: empresaApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresaKeys.all })
    },
  })
}
