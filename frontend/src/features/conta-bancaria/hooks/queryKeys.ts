import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.contasBancarias` — mesma lógica de `features/empresa/hooks/
 * queryKeys.ts`: essa lista também é lida por `shared/hooks/useContaBancariaOptions.ts`
 * (formulário de Cartão de Crédito), e as duas leituras precisam compartilhar o mesmo cache.
 */
export const contaBancariaKeys = {
  all: sharedQueryKeys.contasBancarias,
  detail: (id: string) => [...sharedQueryKeys.contasBancarias, id] as const,
}
