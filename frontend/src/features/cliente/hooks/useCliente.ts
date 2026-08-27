import { useQuery } from '@tanstack/react-query'
import { clienteApi } from '../api/clienteApi'
import { clienteKeys } from './queryKeys'

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: clienteKeys.detail(id ?? ''),
    queryFn: () => clienteApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
