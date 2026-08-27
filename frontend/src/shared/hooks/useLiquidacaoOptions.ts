import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface LiquidacaoOption {
  id: string
  tipo: 'Pagamento' | 'Recebimento'
  dataEfetiva: string
  valor: number
  contaBancariaId: string
}

/**
 * Lista de Liquidações Financeiras para uso no formulário de "vincular manualmente" de
 * Conciliação Bancária (`VinculoConciliacaoService#vincularManualmente`, escolher a qual
 * Liquidação uma Movimentação corresponde). Mesmo padrão de `useLancamentoOptions.ts` — chave
 * compartilhada com `features/liquidacao-financeira/hooks/queryKeys.ts`
 * (`liquidacaoFinanceiraKeys.all`).
 */
export function useLiquidacaoOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.liquidacoesFinanceiras,
    queryFn: async () => {
      const { data } = await apiClient.get<LiquidacaoOption[]>('/api/liquidacoes-financeiras')
      return data
    },
  })
}
