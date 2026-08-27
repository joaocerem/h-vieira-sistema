import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.liquidacoesFinanceiras` — a mesma lista também é lida por
 * `shared/hooks/useLiquidacaoOptions.ts` (formulário de "vincular manualmente" em Conciliação
 * Bancária, para escolher a qual Liquidação uma Movimentação corresponde).
 */
export const liquidacaoFinanceiraKeys = {
  all: sharedQueryKeys.liquidacoesFinanceiras,
  detail: (id: string) => [...sharedQueryKeys.liquidacoesFinanceiras, id] as const,
}
