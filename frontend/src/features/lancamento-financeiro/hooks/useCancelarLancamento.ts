import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lancamentoFinanceiroApi } from '../api/lancamentoFinanceiroApi'
import { lancamentoFinanceiroKeys } from './queryKeys'

/**
 * `situação_administrativa` → Cancelado — só permitido pelo backend quando a soma de
 * Aplicações de Liquidação vinculadas for exatamente zero (Decisão 2, `decisions.md`).
 * Qualquer violação chega como `BusinessException` (422) e aparece no toast global
 * (`QueryProvider`) — nenhuma checagem duplicada aqui.
 */
export function useCancelarLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: lancamentoFinanceiroApi.cancelar,
    onSuccess: (lancamento) => {
      queryClient.invalidateQueries({ queryKey: lancamentoFinanceiroKeys.all })
      queryClient.invalidateQueries({ queryKey: lancamentoFinanceiroKeys.detail(lancamento.id) })
    },
  })
}
