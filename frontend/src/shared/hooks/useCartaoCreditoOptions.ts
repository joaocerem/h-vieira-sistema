import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface CartaoCreditoOption {
  id: string
  contaBancariaId: string
  banco: string
  apelido: string
  diaFechamento: number
  diaVencimento: number
}

/**
 * Lista de Cartões de Crédito para uso em campo de seleção (Compra Cartão exige `cartaoId` na
 * criação; Fatura exige `cartaoId` ao fechar um ciclo). Mesmo padrão de `useContaBancariaOptions`
 * — chave compartilhada com `features/cartao-credito/hooks/queryKeys.ts` (`cartaoCreditoKeys.all`).
 */
export function useCartaoCreditoOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.cartoesCredito,
    queryFn: async () => {
      const { data } = await apiClient.get<CartaoCreditoOption[]>('/api/cartoes-credito')
      return data
    },
  })
}
