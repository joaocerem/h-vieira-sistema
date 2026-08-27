import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteApi } from '../api/clienteApi'
import { clienteKeys } from './queryKeys'

export function useCriarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clienteApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clienteKeys.all }),
  })
}
