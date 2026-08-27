import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ContaBancariaOption {
  id: string
  banco: string
  apelido: string
}

/**
 * Lista de Contas Bancárias para uso em campo de seleção (ex. Cartão de Crédito, que exige
 * `contaBancariaId` na criação). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada
 * com `features/conta-bancaria/hooks/queryKeys.ts` (`contaBancariaKeys.all`).
 */
export function useContaBancariaOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.contasBancarias,
    queryFn: async () => {
      const { data } = await apiClient.get<ContaBancariaOption[]>('/api/contas-bancarias')
      return data
    },
  })
}
