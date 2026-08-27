import { useMutation, useQueryClient } from '@tanstack/react-query'
import { veiculoApi } from '../api/veiculoApi'
import { veiculoKeys } from './queryKeys'
import type { VeiculoAtualizarValues } from '../types'

export function useAtualizarVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: VeiculoAtualizarValues }) =>
      veiculoApi.atualizar(id, values),
    onSuccess: (veiculo) => {
      queryClient.invalidateQueries({ queryKey: veiculoKeys.all })
      queryClient.invalidateQueries({ queryKey: veiculoKeys.detail(veiculo.id) })
    },
  })
}
