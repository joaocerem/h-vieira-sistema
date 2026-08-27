import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriaApi } from '../api/categoriaApi'
import { categoriaKeys } from './queryKeys'
import type { CategoriaFormValues } from '../types'

export function useAtualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoriaFormValues }) =>
      categoriaApi.atualizar(id, values),
    onSuccess: (categoria) => {
      queryClient.invalidateQueries({ queryKey: categoriaKeys.all })
      queryClient.invalidateQueries({ queryKey: categoriaKeys.detail(categoria.id) })
    },
  })
}
