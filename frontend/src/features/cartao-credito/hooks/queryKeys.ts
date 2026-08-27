import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.cartoesCredito` — a mesma lista também é lida por
 * `shared/hooks/useCartaoCreditoOptions.ts` (formulários de Compra Cartão e Fatura).
 */
export const cartaoCreditoKeys = {
  all: sharedQueryKeys.cartoesCredito,
  detail: (id: string) => [...sharedQueryKeys.cartoesCredito, id] as const,
}
