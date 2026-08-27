import { useMutation, useQueryClient } from '@tanstack/react-query'
import { empresaApi } from '../api/empresaApi'
import { empresaKeys } from './queryKeys'
import type { EmpresaFormValues } from '../types'

export function useAtualizarEmpresa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: EmpresaFormValues }) =>
      empresaApi.atualizar(id, values),
    onSuccess: (empresa) => {
      queryClient.invalidateQueries({ queryKey: empresaKeys.all })
      queryClient.invalidateQueries({ queryKey: empresaKeys.detail(empresa.id) })
    },
  })
}
