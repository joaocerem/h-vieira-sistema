import { apiClient } from '@/shared/api/client'
import type {
  LancamentoAtualizarValues,
  LancamentoCriarValues,
  LancamentoFinanceiro,
} from '../types'

const BASE_PATH = '/api/lancamentos-financeiros'

export const lancamentoFinanceiroApi = {
  listar: async (): Promise<LancamentoFinanceiro[]> => {
    const { data } = await apiClient.get<LancamentoFinanceiro[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<LancamentoFinanceiro> => {
    const { data } = await apiClient.get<LancamentoFinanceiro>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: LancamentoCriarValues): Promise<LancamentoFinanceiro> => {
    const { data } = await apiClient.post<LancamentoFinanceiro>(BASE_PATH, values)
    return data
  },
  atualizar: async (
    id: string,
    values: LancamentoAtualizarValues,
  ): Promise<LancamentoFinanceiro> => {
    const { data } = await apiClient.put<LancamentoFinanceiro>(`${BASE_PATH}/${id}`, values)
    return data
  },
  /** Só permitido quando a soma de Aplicações vinculadas for exatamente zero — validado pelo backend. */
  cancelar: async (id: string): Promise<LancamentoFinanceiro> => {
    const { data } = await apiClient.post<LancamentoFinanceiro>(`${BASE_PATH}/${id}/cancelar`)
    return data
  },
}
