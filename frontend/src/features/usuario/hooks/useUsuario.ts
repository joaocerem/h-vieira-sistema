import { useQuery } from '@tanstack/react-query'
import { usuarioApi } from '../api/usuarioApi'
import { usuarioKeys } from './queryKeys'

export function useUsuario(id: string | undefined) {
  return useQuery({
    queryKey: usuarioKeys.detail(id ?? ''),
    queryFn: () => usuarioApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
