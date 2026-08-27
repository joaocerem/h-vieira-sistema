import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.veiculos` — a mesma lista também é lida por `shared/hooks/
 * useVeiculoOptions.ts` (formulário de Lançamento Financeiro).
 */
export const veiculoKeys = {
  all: sharedQueryKeys.veiculos,
  detail: (id: string) => [...sharedQueryKeys.veiculos, id] as const,
}
