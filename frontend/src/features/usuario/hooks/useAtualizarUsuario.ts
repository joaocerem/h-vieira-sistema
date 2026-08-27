import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usuarioApi } from '../api/usuarioApi'
import { usuarioKeys } from './queryKeys'
import type { UsuarioAtualizarValues } from '../types'

export function useAtualizarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UsuarioAtualizarValues }) =>
      usuarioApi.atualizar(id, values),
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
      queryClient.invalidateQueries({ queryKey: usuarioKeys.detail(usuario.id) })
    },
  })
}
