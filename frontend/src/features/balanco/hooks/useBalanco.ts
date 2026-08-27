import { useQuery } from '@tanstack/react-query'
import { balancoApi } from '../api/balancoApi'
import { balancoKeys } from './queryKeys'

export function useBalanco(empresaId?: string) {
  return useQuery({
    queryKey: balancoKeys.calcular(empresaId),
    queryFn: () => balancoApi.calcular(empresaId),
  })
}
