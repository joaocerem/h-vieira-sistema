import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'
import type { CategoriaOption } from './useCategoriaOptions'

/**
 * Cadastro rápido de Categoria (decisão de negócio, Sprint 2 — mesmo espírito de
 * `useCriarFornecedorRapido.ts`). `tipo` é obrigatório no backend
 * (`CategoriaRequest#tipo`, `@NotBlank`) — quem chama este hook (`LancamentoForm.tsx`) resolve
 * isso preenchendo `tipo` com o `tipo` (Despesa/Receita) já selecionado no próprio Lançamento,
 * sem pedir essa escolha de novo ao usuário; decisão de implementação, não de negócio (o campo
 * já existe e já é obrigatório, isso só evita perguntar duas vezes a mesma coisa).
 */
export function useCriarCategoriaRapida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ nome, tipo }: { nome: string; tipo: string }) => {
      const { data } = await apiClient.post<CategoriaOption>('/api/categorias', { nome, tipo })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sharedQueryKeys.categorias }),
  })
}
