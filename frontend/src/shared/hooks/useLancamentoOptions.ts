import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface LancamentoOption {
  id: string
  tipo: 'Despesa' | 'Receita'
  valor: number
  vencimento: string
  situacaoAdministrativa: 'Ativo' | 'Cancelado'
  statusFinanceiro: string
}

/**
 * Lista de Lançamentos Financeiros para uso como referência (ex. vinculação manual na
 * Conciliação Bancária, que escolhe quais Lançamentos um Vínculo cobre). Mesmo padrão de
 * `useEmpresaOptions.ts` — chave compartilhada com `features/lancamento-financeiro/hooks/
 * queryKeys.ts` (`lancamentoFinanceiroKeys.all`).
 */
export function useLancamentoOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.lancamentosFinanceiros,
    queryFn: async () => {
      const { data } = await apiClient.get<LancamentoOption[]>('/api/lancamentos-financeiros')
      return data
    },
  })
}
