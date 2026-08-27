import { apiClient } from '@/shared/api/client'
import type { Fatura, FecharCicloValues, PagarFaturaValues } from '../types'

const BASE_PATH = '/api/faturas'

/**
 * Sem `POST` de criação direta genérica — a criação de Fatura é sempre o fechamento de um ciclo
 * (`fecharCiclo`); sem `atualizar` — imutável desde o fechamento (`FaturaController`, backend).
 */
export const faturaApi = {
  listar: async (): Promise<Fatura[]> => {
    const { data } = await apiClient.get<Fatura[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Fatura> => {
    const { data } = await apiClient.get<Fatura>(`${BASE_PATH}/${id}`)
    return data
  },
  fecharCiclo: async (values: FecharCicloValues): Promise<Fatura> => {
    const { data } = await apiClient.post<Fatura>(`${BASE_PATH}/fechar-ciclo`, values)
    return data
  },
  pagar: async (id: string, values: PagarFaturaValues): Promise<Fatura> => {
    const { data } = await apiClient.post<Fatura>(`${BASE_PATH}/${id}/pagar`, values)
    return data
  },
}
