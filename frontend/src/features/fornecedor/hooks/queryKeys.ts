import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.fornecedores` — mesma lógica de `features/categoria/hooks/
 * queryKeys.ts`: essa lista também é lida por `shared/hooks/useFornecedorOptions.ts`
 * (formulário de Lançamento Financeiro).
 */
export const fornecedorKeys = {
  all: sharedQueryKeys.fornecedores,
  detail: (id: string) => [...sharedQueryKeys.fornecedores, id] as const,
}
