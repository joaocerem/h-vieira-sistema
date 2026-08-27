import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ajusteFinanceiroApi } from '../api/ajusteFinanceiroApi'
import { ajusteFinanceiroKeys } from './queryKeys'

/**
 * Só formaliza o vínculo entre dois Lançamentos já existentes — não altera nenhum dos dois
 * (`AjusteFinanceiroService#criar` não escreve em `LANÇAMENTO_FINANCEIRO`), então sem invalidar
 * `sharedQueryKeys.lancamentosFinanceiros` aqui.
 */
export function useCriarAjusteFinanceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ajusteFinanceiroApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ajusteFinanceiroKeys.all })
    },
  })
}
