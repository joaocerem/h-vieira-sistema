import { useQuery } from '@tanstack/react-query'
import { usuarioApi } from '../api/usuarioApi'
import { usuarioKeys } from './queryKeys'

export function useUsuarios() {
  return useQuery({ queryKey: usuarioKeys.all, queryFn: usuarioApi.listar })
}
