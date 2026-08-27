import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface FornecedorOption {
  id: string
  nome: string
}

/**
 * Lista de Fornecedores para uso em campo de seleção (Lançamento Financeiro do tipo Despesa
 * exige `fornecedorId`). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada com
 * `features/fornecedor/hooks/queryKeys.ts` (`fornecedorKeys.all`).
 */
export function useFornecedorOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.fornecedores,
    queryFn: async () => {
      const { data } = await apiClient.get<FornecedorOption[]>('/api/fornecedores')
      return data
    },
  })
}
