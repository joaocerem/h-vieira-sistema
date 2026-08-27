import { useQuery } from '@tanstack/react-query'
import { categoriaApi } from '../api/categoriaApi'
import { categoriaKeys } from './queryKeys'

export function useCategoria(id: string | undefined) {
  return useQuery({
    queryKey: categoriaKeys.detail(id ?? ''),
    queryFn: () => categoriaApi.buscarPorId(id as string),
    enabled: Boolean(id),
  })
}
