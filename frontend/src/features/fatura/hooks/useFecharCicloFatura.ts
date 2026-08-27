import { useMutation, useQueryClient } from '@tanstack/react-query'
import { faturaApi } from '../api/faturaApi'
import { faturaKeys } from './queryKeys'
import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * `FaturaService#fecharCiclo` atribui, na mesma transação, todas as Parcelas elegíveis do ciclo
 * a esta Fatura (`ParcelaService#atribuirFatura`) — invalida também a lista de Parcelas.
 */
export function useFecharCicloFatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: faturaApi.fecharCiclo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faturaKeys.all })
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.parcelas })
    },
  })
}
