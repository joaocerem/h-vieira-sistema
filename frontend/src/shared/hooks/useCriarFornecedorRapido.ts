import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'
import type { FornecedorOption } from './useFornecedorOptions'

/**
 * Cadastro rápido de Fornecedor (decisão de negócio, Sprint 2 — "Fluxo completo de
 * Lançamentos": usuário cadastra um Fornecedor novo sem sair da tela de Lançamento, via
 * `AutocompleteField.tsx`). Mesmo endpoint de `features/fornecedor/api/fornecedorApi.ts#criar`
 * (`POST /api/fornecedores`), chamado direto via `apiClient` — `shared/` nunca importa de
 * `features/*`, mesmo padrão já usado em `useFornecedorOptions.ts` ao lado (chave de query
 * compartilhada, `sharedQueryKeys.fornecedores`, garante que o cache invalidado aqui seja o
 * mesmo lido por `useFornecedorOptions`).
 */
export function useCriarFornecedorRapido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data } = await apiClient.post<FornecedorOption>('/api/fornecedores', { nome })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sharedQueryKeys.fornecedores }),
  })
}
