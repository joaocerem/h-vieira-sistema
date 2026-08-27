import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contratoFinanceiroApi } from '../api/contratoFinanceiroApi'
import { contratoFinanceiroKeys } from './queryKeys'
import type { ContratoFinanceiroAtualizarValues } from '../types'

/**
 * Diferente de `CompraCartaoService#atualizar` (D5), `ContratoFinanceiroService#atualizar` não
 * propaga a correção de `fornecedorId`/`veiculoId` para Lançamentos já gerados — sem regra
 * equivalente documentada para este módulo. Por isso, sem invalidar `sharedQueryKeys.lancamentosFinanceiros`
 * aqui (seria inventar um comportamento que o backend não tem).
 */
export function useAtualizarContratoFinanceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ContratoFinanceiroAtualizarValues }) =>
      contratoFinanceiroApi.atualizar(id, values),
    onSuccess: (contrato) => {
      queryClient.invalidateQueries({ queryKey: contratoFinanceiroKeys.all })
      queryClient.invalidateQueries({ queryKey: contratoFinanceiroKeys.detail(contrato.id) })
    },
  })
}
