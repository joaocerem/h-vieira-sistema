import { useQuery } from '@tanstack/react-query'
import { movimentacaoBancariaApi } from '../api/movimentacaoBancariaApi'
import { movimentacaoBancariaKeys } from './queryKeys'

export function useMovimentacoes(contaBancariaId?: string) {
  return useQuery({
    queryKey: movimentacaoBancariaKeys.list(contaBancariaId),
    queryFn: () => movimentacaoBancariaApi.listar(contaBancariaId),
  })
}
