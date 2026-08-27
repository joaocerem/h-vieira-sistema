import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ObraOption {
  id: string
  nome: string
}

/**
 * Lista de Obras para uso em campo de seleção (Veículo — `obraAtualId`; Lançamento Financeiro
 * — `obraId`, ambos opcionais). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada
 * com `features/obra/hooks/queryKeys.ts` (`obraKeys.all`).
 */
export function useObraOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.obras,
    queryFn: async () => {
      const { data } = await apiClient.get<ObraOption[]>('/api/obras')
      return data
    },
  })
}
