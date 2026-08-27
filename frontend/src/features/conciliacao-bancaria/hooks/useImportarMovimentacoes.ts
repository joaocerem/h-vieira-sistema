import { useMutation, useQueryClient } from '@tanstack/react-query'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'
import { movimentacaoBancariaKeys, vinculoConciliacaoKeys } from './queryKeys'

/** Cada Movimentação importada ganha, na mesma transação (backend), um Vínculo `Não Vinculado`. */
export function useImportarMovimentacoes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: movimentacaoBancariaApi.importar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movimentacaoBancariaKeys.all })
      queryClient.invalidateQueries({ queryKey: vinculoConciliacaoKeys.all })
    },
  })
}
