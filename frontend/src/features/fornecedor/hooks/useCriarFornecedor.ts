import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fornecedorApi } from '../api/fornecedorApi'
import { fornecedorKeys } from './queryKeys'

export function useCriarFornecedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fornecedorApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fornecedorKeys.all }),
  })
}
