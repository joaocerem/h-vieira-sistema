import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usuarioApi } from '../api/usuarioApi'
import { usuarioKeys } from './queryKeys'

export function useCriarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usuarioApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuarioKeys.all }),
  })
}
