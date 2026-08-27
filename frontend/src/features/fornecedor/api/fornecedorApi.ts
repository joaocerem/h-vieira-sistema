import { apiClient } from '@/shared/api/client'
import type { Fornecedor, FornecedorFormValues } from '../types'

const BASE_PATH = '/api/fornecedores'

export const fornecedorApi = {
  listar: async (): Promise<Fornecedor[]> => {
    const { data } = await apiClient.get<Fornecedor[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Fornecedor> => {
    const { data } = await apiClient.get<Fornecedor>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: FornecedorFormValues): Promise<Fornecedor> => {
    const { data } = await apiClient.post<Fornecedor>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: FornecedorFormValues): Promise<Fornecedor> => {
    const { data } = await apiClient.put<Fornecedor>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
