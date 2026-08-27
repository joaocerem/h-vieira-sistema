import { apiClient } from '@/shared/api/client'
import type { Veiculo, VeiculoAtualizarValues, VeiculoCriarValues } from '../types'

const BASE_PATH = '/api/veiculos'

export const veiculoApi = {
  listar: async (): Promise<Veiculo[]> => {
    const { data } = await apiClient.get<Veiculo[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Veiculo> => {
    const { data } = await apiClient.get<Veiculo>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: VeiculoCriarValues): Promise<Veiculo> => {
    const { data } = await apiClient.post<Veiculo>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: VeiculoAtualizarValues): Promise<Veiculo> => {
    const { data } = await apiClient.put<Veiculo>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
