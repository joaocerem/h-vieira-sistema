import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.contratosFinanceiros` — a mesma lista também é lida por
 * `shared/hooks/useContratoFinanceiroOptions.ts` (Parcela resolve o Contrato de origem).
 */
export const contratoFinanceiroKeys = {
  all: sharedQueryKeys.contratosFinanceiros,
  detail: (id: string) => [...sharedQueryKeys.contratosFinanceiros, id] as const,
}
