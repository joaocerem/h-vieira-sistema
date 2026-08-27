import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface CompraCartaoOption {
  id: string
  cartaoId: string
  fornecedorId: string
  valor: number
  data: string
  categoriaId: string
  classificacao: string
  obraId: string | null
  veiculoId: string | null
  numeroParcelas: number
}

/**
 * Lista de Compras Cartão para uso como referência — Parcela resolve, na sua tabela, o
 * Fornecedor/valor da Compra de origem (`features/parcela/`); filtro por Compra na lista de
 * Parcelas (`GET /api/parcelas?compraCartaoId=`, único filtro real exposto pelo backend). Mesmo
 * padrão de `useLancamentoOptions.ts` — chave compartilhada com
 * `features/compra-cartao/hooks/queryKeys.ts` (`compraCartaoKeys.all`).
 */
export function useCompraCartaoOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.comprasCartao,
    queryFn: async () => {
      const { data } = await apiClient.get<CompraCartaoOption[]>('/api/compras-cartao')
      return data
    },
  })
}
