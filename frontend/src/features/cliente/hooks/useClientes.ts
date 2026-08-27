import { useQuery } from '@tanstack/react-query'
import { clienteApi } from '../api/clienteApi'
import { clienteKeys } from './queryKeys'

export function useClientes() {
  return useQuery({ queryKey: clienteKeys.all, queryFn: clienteApi.listar })
}
