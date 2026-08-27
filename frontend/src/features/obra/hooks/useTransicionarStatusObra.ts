import { useMutation, useQueryClient } from '@tanstack/react-query'
import { obraApi } from '../api/obraApi'
import { obraKeys } from './queryKeys'
import type { Obra } from '../types'

/**
 * Transições confirmadas (D9, `decisions.md` decisão #30): A executar → Em andamento;
 * Em andamento ⇄ Pausada; Em andamento → Concluída. Validado pelo backend
 * (`ObraService.TRANSICOES_VALIDAS`) — qualquer tentativa fora dessas chega como
 * `BusinessException` (422) e aparece no toast global.
 */
export function useTransicionarStatusObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: Obra['status'] }) =>
      obraApi.transicionarStatus(id, novoStatus),
    onSuccess: (obra) => {
      queryClient.invalidateQueries({ queryKey: obraKeys.all })
      queryClient.invalidateQueries({ queryKey: obraKeys.detail(obra.id) })
    },
  })
}
