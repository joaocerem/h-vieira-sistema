import { sharedQueryKeys } from '@/shared/queryKeys'

/** Reusa `sharedQueryKeys.movimentacoesBancarias` como fonte única da chave. */
export const movimentacaoBancariaKeys = {
  all: sharedQueryKeys.movimentacoesBancarias,
  list: (contaBancariaId?: string) =>
    [...sharedQueryKeys.movimentacoesBancarias, { contaBancariaId }] as const,
  detail: (id: string) => [...sharedQueryKeys.movimentacoesBancarias, id] as const,
}

/** Reusa `sharedQueryKeys.vinculosConciliacao` — mesmo motivo de `movimentacaoBancariaKeys`. */
export const vinculoConciliacaoKeys = {
  all: sharedQueryKeys.vinculosConciliacao,
  list: (estado?: string) => [...sharedQueryKeys.vinculosConciliacao, { estado }] as const,
  detail: (id: string) => [...sharedQueryKeys.vinculosConciliacao, id] as const,
  porMovimentacao: (movimentacaoBancariaId: string) =>
    [...sharedQueryKeys.vinculosConciliacao, 'movimentacao', movimentacaoBancariaId] as const,
}

/** Chave local, não compartilhada — nenhuma outra feature precisa ler Transferência Interna. */
export const transferenciaInternaKeys = {
  all: ['transferencias-internas'] as const,
  detail: (id: string) => ['transferencias-internas', id] as const,
}
