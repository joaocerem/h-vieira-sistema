import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.obras` — a mesma lista também é lida por `shared/hooks/
 * useObraOptions.ts` (formulários de Veículo e de Lançamento Financeiro).
 */
export const obraKeys = {
  all: sharedQueryKeys.obras,
  detail: (id: string) => [...sharedQueryKeys.obras, id] as const,
}
