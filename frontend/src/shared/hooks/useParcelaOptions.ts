import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ParcelaOption {
  id: string
  origem: 'Compra Cartão' | 'Contrato Financeiro'
  compraCartaoId: string | null
  contratoFinanceiroId: string | null
  numero: number
  total: number
  valor: number
  vencimento: string
  faturaId: string | null
  lancamentoFinanceiroId: string | null
}

/**
 * Lista completa de Parcelas para uso como referência — `features/fatura/` cruza esta lista no
 * cliente (`p.faturaId === fatura.id`) para exibir as Parcelas de um ciclo em
 * `FaturaDetailPage`, já que o backend não expõe `faturaId` como filtro de
 * `GET /api/parcelas` (só `compraCartaoId`/`contratoFinanceiroId`) — mesmo padrão de leitura de
 * referência completa + cruzamento no cliente já usado em `LiquidacaoDetailPage`. Chave
 * compartilhada com `features/parcela/hooks/queryKeys.ts` (`parcelaKeys.all`).
 */
export function useParcelaOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.parcelas,
    queryFn: async () => {
      const { data } = await apiClient.get<ParcelaOption[]>('/api/parcelas')
      return data
    },
  })
}
