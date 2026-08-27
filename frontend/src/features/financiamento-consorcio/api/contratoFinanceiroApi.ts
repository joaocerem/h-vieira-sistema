import { apiClient } from '@/shared/api/client'
import type {
  ContratoFinanceiro,
  ContratoFinanceiroAtualizarValues,
  ContratoFinanceiroCriarValues,
} from '../types'

const BASE_PATH = '/api/contratos-financeiros'

export const contratoFinanceiroApi = {
  listar: async (): Promise<ContratoFinanceiro[]> => {
    const { data } = await apiClient.get<ContratoFinanceiro[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<ContratoFinanceiro> => {
    const { data } = await apiClient.get<ContratoFinanceiro>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: ContratoFinanceiroCriarValues): Promise<ContratoFinanceiro> => {
    const { data } = await apiClient.post<ContratoFinanceiro>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: ContratoFinanceiroAtualizarValues): Promise<ContratoFinanceiro> => {
    const { data } = await apiClient.put<ContratoFinanceiro>(`${BASE_PATH}/${id}`, values)
    return data
  },
  /** Transição Não → Sim, exclusivamente para `tipo` = Consórcio (`ContratoFinanceiroService#contemplar`). */
  contemplar: async (id: string): Promise<ContratoFinanceiro> => {
    const { data } = await apiClient.post<ContratoFinanceiro>(`${BASE_PATH}/${id}/contemplar`)
    return data
  },
}
