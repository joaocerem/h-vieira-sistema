import { apiClient } from '@/shared/api/client'
import type { AjusteFinanceiro, AjusteFinanceiroCriarValues } from '../types'

const BASE_PATH = '/api/ajustes-financeiros'

/** Sem `atualizar` — Ajuste Financeiro é imutável desde a criação (D13, decisão #34); sem exclusão física ("nada desaparece"). */
export const ajusteFinanceiroApi = {
  listar: async (lancamentoOriginalId?: string): Promise<AjusteFinanceiro[]> => {
    const { data } = await apiClient.get<AjusteFinanceiro[]>(BASE_PATH, {
      params: lancamentoOriginalId ? { lancamentoOriginalId } : undefined,
    })
    return data
  },
  buscarPorId: async (id: string): Promise<AjusteFinanceiro> => {
    const { data } = await apiClient.get<AjusteFinanceiro>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: AjusteFinanceiroCriarValues): Promise<AjusteFinanceiro> => {
    const { data } = await apiClient.post<AjusteFinanceiro>(BASE_PATH, values)
    return data
  },
}
