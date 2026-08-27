import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.lancamentosFinanceiros` — a mesma lista também é lida por
 * `shared/hooks/useLancamentoOptions.ts` (formulário de Liquidação Financeira, para escolher
 * quais Lançamentos ela cobre).
 */
export const lancamentoFinanceiroKeys = {
  all: sharedQueryKeys.lancamentosFinanceiros,
  detail: (id: string) => [...sharedQueryKeys.lancamentosFinanceiros, id] as const,
}
