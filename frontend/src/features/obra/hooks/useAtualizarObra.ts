import { useMutation, useQueryClient } from '@tanstack/react-query'
import { obraApi } from '../api/obraApi'
import { obraKeys } from './queryKeys'
import type { ObraAtualizarValues } from '../types'

export function useAtualizarObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ObraAtualizarValues }) =>
      obraApi.atualizar(id, values),
    onSuccess: (obra) => {
      queryClient.invalidateQueries({ queryKey: obraKeys.all })
      queryClient.invalidateQueries({ queryKey: obraKeys.detail(obra.id) })
    },
  })
}
