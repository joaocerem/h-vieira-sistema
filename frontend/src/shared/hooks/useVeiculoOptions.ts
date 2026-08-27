import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface VeiculoOption {
  id: string
  empresaId: string
  nomeIdentificacao: string
  tipo: string
}

/**
 * Lista de Veículos para uso em campo de seleção (Lançamento Financeiro — `veiculoId`,
 * opcional). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada com
 * `features/frota/hooks/queryKeys.ts` (`veiculoKeys.all`).
 */
export function useVeiculoOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.veiculos,
    queryFn: async () => {
      const { data } = await apiClient.get<VeiculoOption[]>('/api/veiculos')
      return data
    },
  })
}
