import { apiClient } from '@/shared/api/client'
import type { EstadoConciliacao, ResultadoSugestaoAutomatica, VinculoConciliacao } from '../types'

const BASE_PATH = '/api/vinculos-conciliacao'

/**
 * Espelha `VinculoConciliacaoController`. Sem `criar` — gerado automaticamente para toda
 * Movimentação Bancária que existir (`docs/domain-model/14-vinculo-conciliacao.md`, Seção 4),
 * na mesma transação de `movimentacaoBancariaApi.importar`/geração via Liquidação.
 */
export const vinculoConciliacaoApi = {
  listar: async (estado?: EstadoConciliacao): Promise<VinculoConciliacao[]> => {
    const { data } = await apiClient.get<VinculoConciliacao[]>(BASE_PATH, {
      params: estado ? { estado } : undefined,
    })
    return data
  },
  buscarPorMovimentacao: async (movimentacaoBancariaId: string): Promise<VinculoConciliacao> => {
    const { data } = await apiClient.get<VinculoConciliacao>(
      `${BASE_PATH}/movimentacao/${movimentacaoBancariaId}`,
    )
    return data
  },
  /**
   * Sugestão determinística por valor+data (nunca `SUGESTÃO_IA`) — casa cada Vínculo `Não
   * Vinculado` contra Liquidações da mesma Conta, mesmo valor absoluto, dentro da tolerância
   * configurável (T6, `ConciliacaoProperties`). Nunca confirma sozinha.
   */
  rodarSugestaoAutomatica: async (): Promise<ResultadoSugestaoAutomatica> => {
    const { data } = await apiClient.post<ResultadoSugestaoAutomatica>(`${BASE_PATH}/sugestao-automatica`)
    return data
  },
  /** Só válido quando o Vínculo está `Sugerido` — validado pelo backend. */
  confirmar: async (id: string): Promise<VinculoConciliacao> => {
    const { data } = await apiClient.post<VinculoConciliacao>(`${BASE_PATH}/${id}/confirmar`)
    return data
  },
  /** Só válido quando o Vínculo já tem uma Liquidação candidata — validado pelo backend. */
  marcarDivergente: async (id: string): Promise<VinculoConciliacao> => {
    const { data } = await apiClient.post<VinculoConciliacao>(`${BASE_PATH}/${id}/divergente`)
    return data
  },
  /** Só válido quando o Vínculo está `Não Vinculado` — validado pelo backend. */
  marcarSemCorrespondencia: async (id: string): Promise<VinculoConciliacao> => {
    const { data } = await apiClient.post<VinculoConciliacao>(`${BASE_PATH}/${id}/sem-correspondencia`)
    return data
  },
  /** Recusado pelo backend quando o Vínculo já está `Confirmado`. */
  vincularManualmente: async (id: string, liquidacaoFinanceiraId: string): Promise<VinculoConciliacao> => {
    const { data } = await apiClient.post<VinculoConciliacao>(`${BASE_PATH}/${id}/vincular`, {
      liquidacaoFinanceiraId,
    })
    return data
  },
}
