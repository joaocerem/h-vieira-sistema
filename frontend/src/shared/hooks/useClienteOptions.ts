import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ClienteOption {
  id: string
  nome: string
}

/**
 * Lista de Clientes para uso em campo de seleção (Lançamento Financeiro do tipo Receita exige
 * `clienteId`). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada com
 * `features/cliente/hooks/queryKeys.ts` (`clienteKeys.all`).
 */
export function useClienteOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.clientes,
    queryFn: async () => {
      const { data } = await apiClient.get<ClienteOption[]>('/api/clientes')
      return data
    },
  })
}
