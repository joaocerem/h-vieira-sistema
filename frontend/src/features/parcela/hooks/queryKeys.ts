import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.parcelas` — a mesma lista também é lida por
 * `shared/hooks/useParcelaOptions.ts` (`features/fatura/`, cruzamento por `faturaId` no
 * cliente).
 */
export const parcelaKeys = {
  all: sharedQueryKeys.parcelas,
  list: (filtro: { compraCartaoId?: string; contratoFinanceiroId?: string } = {}) =>
    [...sharedQueryKeys.parcelas, filtro] as const,
  detail: (id: string) => [...sharedQueryKeys.parcelas, id] as const,
}
