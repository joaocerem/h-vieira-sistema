import { useMutation, useQueryClient } from '@tanstack/react-query'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'
import { movimentacaoBancariaKeys } from './queryKeys'
import type { Classificacao } from '../types'

/**
 * `classificacao` é o único campo mutável de Movimentação Bancária. `'Transferência Interna'`
 * é recusada pelo backend por aqui — o formulário (`ReclassificarSelect`) já não a oferece;
 * qualquer violação (ou outra regra futura) chega como `BusinessException` (422), exibida pelo
 * toast global (`QueryProvider`).
 */
export function useReclassificarMovimentacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, classificacao }: { id: string; classificacao: Classificacao }) =>
      movimentacaoBancariaApi.reclassificar(id, classificacao),
    onSuccess: (movimentacao) => {
      queryClient.invalidateQueries({ queryKey: movimentacaoBancariaKeys.all })
      queryClient.invalidateQueries({ queryKey: movimentacaoBancariaKeys.detail(movimentacao.id) })
    },
  })
}
