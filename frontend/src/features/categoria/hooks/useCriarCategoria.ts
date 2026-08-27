import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriaApi } from '../api/categoriaApi'
import { categoriaKeys } from './queryKeys'

export function useCriarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoriaApi.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriaKeys.all }),
  })
}
