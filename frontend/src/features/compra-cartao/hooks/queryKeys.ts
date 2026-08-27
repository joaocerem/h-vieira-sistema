import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.comprasCartao` — a mesma lista também é lida por
 * `shared/hooks/useCompraCartaoOptions.ts` (Parcela resolve a Compra de origem).
 */
export const compraCartaoKeys = {
  all: sharedQueryKeys.comprasCartao,
  detail: (id: string) => [...sharedQueryKeys.comprasCartao, id] as const,
}
