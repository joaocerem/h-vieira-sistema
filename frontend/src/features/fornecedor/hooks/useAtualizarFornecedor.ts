import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fornecedorApi } from '../api/fornecedorApi'
import { fornecedorKeys } from './queryKeys'
import type { FornecedorFormValues } from '../types'

export function useAtualizarFornecedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: FornecedorFormValues }) =>
      fornecedorApi.atualizar(id, values),
    onSuccess: (fornecedor) => {
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.all })
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.detail(fornecedor.id) })
    },
  })
}
