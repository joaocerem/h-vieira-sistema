import { apiClient } from '@/shared/api/client'
import type {
  ContaBancaria,
  ContaBancariaAtualizarValues,
  ContaBancariaCriarValues,
} from '../types'

const BASE_PATH = '/api/contas-bancarias'

export const contaBancariaApi = {
  listar: async (): Promise<ContaBancaria[]> => {
    const { data } = await apiClient.get<ContaBancaria[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<ContaBancaria> => {
    const { data } = await apiClient.get<ContaBancaria>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: ContaBancariaCriarValues): Promise<ContaBancaria> => {
    const { data } = await apiClient.post<ContaBancaria>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: ContaBancariaAtualizarValues): Promise<ContaBancaria> => {
    const { data } = await apiClient.put<ContaBancaria>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
