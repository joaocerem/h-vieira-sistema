import { useQuery } from '@tanstack/react-query'
import { parcelaApi, type ListarParcelasFiltro } from '../api/parcelaApi'
import { parcelaKeys } from './queryKeys'

/** `compraCartaoId`/`contratoFinanceiroId` são os únicos filtros reais expostos por `GET /api/parcelas`. */
export function useParcelas(filtro: ListarParcelasFiltro = {}) {
  return useQuery({
    queryKey: parcelaKeys.list(filtro),
    queryFn: () => parcelaApi.listar(filtro),
  })
}
