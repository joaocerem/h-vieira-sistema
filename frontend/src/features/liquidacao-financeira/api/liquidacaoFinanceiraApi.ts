import { apiClient } from '@/shared/api/client'
import type { LiquidacaoCriarValues, LiquidacaoFinanceira } from '../types'

const BASE_PATH = '/api/liquidacoes-financeiras'

/** Sem `atualizar` — Liquidação Financeira é imutável desde a criação (D12, `decisions.md` decisão #33). */
export const liquidacaoFinanceiraApi = {
  listar: async (): Promise<LiquidacaoFinanceira[]> => {
    const { data } = await apiClient.get<LiquidacaoFinanceira[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<LiquidacaoFinanceira> => {
    const { data } = await apiClient.get<LiquidacaoFinanceira>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: LiquidacaoCriarValues): Promise<LiquidacaoFinanceira> => {
    const { data } = await apiClient.post<LiquidacaoFinanceira>(BASE_PATH, values)
    return data
  },
}
