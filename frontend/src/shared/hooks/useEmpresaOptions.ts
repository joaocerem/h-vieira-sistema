import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface EmpresaOption {
  id: string
  nome: string
}

/**
 * Lista de Empresas para uso em campo de seleção (ex. Conta Bancária, que exige `empresaId`
 * na criação). Usa a mesma chave de `features/empresa/hooks/queryKeys.ts` (`empresaKeys.all`)
 * — as duas leituras compartilham o mesmo cache do TanStack Query, sem requisição duplicada.
 * Fica em `shared/` porque é consumida por mais de uma feature; a listagem/CRUD completo de
 * Empresa continua em `features/empresa/`.
 */
export function useEmpresaOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.empresas,
    queryFn: async () => {
      const { data } = await apiClient.get<EmpresaOption[]>('/api/empresas')
      return data
    },
  })
}
