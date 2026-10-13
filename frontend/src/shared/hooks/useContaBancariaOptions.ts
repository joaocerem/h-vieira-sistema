import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface ContaBancariaOption {
  id: string
  empresaId: string
  banco: string
}

/**
 * Lista de Contas Bancárias para uso em campo de seleção (ex. Cartão de Crédito, que exige
 * `contaBancariaId` na criação). Mesmo padrão de `useEmpresaOptions.ts` — chave compartilhada
 * com `features/conta-bancaria/hooks/queryKeys.ts` (`contaBancariaKeys.all`).
 *
 * Sem `apelido` (decisão de negócio, Sprint 3 — rodada de evolução operacional): identificação
 * passa a ser Empresa + Banco — quem consome esta lista resolve o nome da Empresa via
 * `useEmpresaOptions`, mesmo padrão já usado em `ContaBancariaTable.tsx`.
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
