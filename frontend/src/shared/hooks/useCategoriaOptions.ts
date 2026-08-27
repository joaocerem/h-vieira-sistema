import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface CategoriaOption {
  id: string
  nome: string
  tipo: string
}

/**
 * Lista de Categorias para uso em campo de seleção (Lançamento Financeiro exige `categoriaId`
 * na criação/edição). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada com
 * `features/categoria/hooks/queryKeys.ts` (`categoriaKeys.all`).
 */
export function useCategoriaOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.categorias,
    queryFn: async () => {
      const { data } = await apiClient.get<CategoriaOption[]>('/api/categorias')
      return data
    },
  })
}
