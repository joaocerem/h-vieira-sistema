import { useQuery } from '@tanstack/react-query'
import { fornecedorApi } from '../api/fornecedorApi'
import { fornecedorKeys } from './queryKeys'

export function useFornecedor(id: string | undefined) {
  return useQuery({
    queryKey: fornecedorKeys.detail(id ?? ''),
    queryFn: () => fornecedorApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
