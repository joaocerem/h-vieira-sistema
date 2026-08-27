import { apiClient } from '@/shared/api/client'
import type { CompraCartao, CompraCartaoAtualizarValues, CompraCartaoCriarValues } from '../types'

const BASE_PATH = '/api/compras-cartao'

export const compraCartaoApi = {
  listar: async (): Promise<CompraCartao[]> => {
    const { data } = await apiClient.get<CompraCartao[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<CompraCartao> => {
    const { data } = await apiClient.get<CompraCartao>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: CompraCartaoCriarValues): Promise<CompraCartao> => {
    const { data } = await apiClient.post<CompraCartao>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: CompraCartaoAtualizarValues): Promise<CompraCartao> => {
    const { data } = await apiClient.put<CompraCartao>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
