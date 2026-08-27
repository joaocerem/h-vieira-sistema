import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ContratoFinanceiroOption {
  id: string
  tipo: 'Financiamento' | 'Consórcio'
  empresaId: string
  contaBancariaId: string
  fornecedorId: string
  valorContratado: number
  numeroParcelas: number
  dataVencimentoPrimeiraParcela: string
  taxa: number | null
  grupoCota: string | null
  contemplado: boolean | null
  veiculoId: string | null
}

/**
 * Lista de Contratos Financeiros para uso como referência — `features/parcela/` resolve, na sua
 * tabela, o Fornecedor do Contrato de origem (mesmo padrão de `useCompraCartaoOptions.ts`).
 * Chave compartilhada com `features/financiamento-consorcio/hooks/queryKeys.ts`
 * (`contratoFinanceiroKeys.all`).
 */
export function useContratoFinanceiroOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.contratosFinanceiros,
    queryFn: async () => {
      const { data } = await apiClient.get<ContratoFinanceiroOption[]>('/api/contratos-financeiros')
      return data
    },
  })
}
