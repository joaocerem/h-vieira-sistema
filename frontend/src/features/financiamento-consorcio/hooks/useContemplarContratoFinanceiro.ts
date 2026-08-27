import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { contratoFinanceiroKeys } from './queryKeys'

/**
 * Só afeta Lançamentos gerados a partir de agora (`gerarLancamento` lê `contemplado` no momento
 * da chamada, D6 — decisão #28) — Parcelas e Lançamentos já existentes não mudam, então sem
 * invalidar `parcelas`/`lancamentosFinanceiros` aqui.
 */
export function useContemplarContratoFinanceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contratoFinanceiroApi.contemplar,
    onSuccess: (contrato) => {
      queryClient.invalidateQueries({ queryKey: contratoFinanceiroKeys.all })
      queryClient.invalidateQueries({ queryKey: contratoFinanceiroKeys.detail(contrato.id) })
    },
  })
}
