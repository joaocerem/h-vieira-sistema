import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contaBancariaApi } from '../api/contaBancariaApi'
import { contaBancariaKeys } from './queryKeys'
import type { ContaBancariaAtualizarValues } from '../types'

export function useAtualizarContaBancaria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ContaBancariaAtualizarValues }) =>
      contaBancariaApi.atualizar(id, values),
    onSuccess: (contaBancaria) => {
      queryClient.invalidateQueries({ queryKey: contaBancariaKeys.all })
      queryClient.invalidateQueries({ queryKey: contaBancariaKeys.detail(contaBancaria.id) })
    },
  })
}
