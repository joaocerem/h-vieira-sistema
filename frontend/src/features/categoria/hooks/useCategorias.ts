import { useQuery } from '@tanstack/react-query'
import { categoriaApi } from '../api/categoriaApi'
import { categoriaKeys } from './queryKeys'

export function useCategorias() {
  return useQuery({ queryKey: categoriaKeys.all, queryFn: categoriaApi.listar })
}
