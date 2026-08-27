import { useQuery } from '@tanstack/react-query'
import { vinculoConciliacaoApi } from '../api/vinculoConciliacaoApi'
import { vinculoConciliacaoKeys } from './queryKeys'
import type { EstadoConciliacao } from '../types'

/**
 * Sem filtro por Conta Bancária no backend (`VinculoConciliacaoController` só filtra por
 * `estado`) — a tela de lista busca todos os Vínculos e faz o cruzamento com as Movimentações
 * da conta selecionada no cliente (mesmo padrão de leitura de referência já usado em
 * `LiquidacaoDetailPage`).
 */
export function useVinculosConciliacao(estado?: EstadoConciliacao) {
  return useQuery({
    queryKey: vinculoConciliacaoKeys.list(estado),
    queryFn: () => vinculoConciliacaoApi.listar(estado),
  })
}
