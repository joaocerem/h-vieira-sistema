import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteApi } from '../api/clienteApi'
import { clienteKeys } from './queryKeys'
import type { ClienteFormValues } from '../types'

export function useAtualizarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ClienteFormValues }) =>
      clienteApi.atualizar(id, values),
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: clienteKeys.all })
      queryClient.invalidateQueries({ queryKey: clienteKeys.detail(cliente.id) })
    },
  })
}
