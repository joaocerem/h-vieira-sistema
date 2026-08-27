import { useQuery } from '@tanstack/react-query'
import { fornecedorApi } from '../api/fornecedorApi'
import { fornecedorKeys } from './queryKeys'

export function useFornecedores() {
  return useQuery({ queryKey: fornecedorKeys.all, queryFn: fornecedorApi.listar })
}
