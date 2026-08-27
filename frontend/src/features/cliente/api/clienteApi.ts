import { apiClient } from '@/shared/api/client'
import type { Cliente, ClienteFormValues } from '../types'

const BASE_PATH = '/api/clientes'

export const clienteApi = {
  listar: async (): Promise<Cliente[]> => {
    const { data } = await apiClient.get<Cliente[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Cliente> => {
    const { data } = await apiClient.get<Cliente>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: ClienteFormValues): Promise<Cliente> => {
    const { data } = await apiClient.post<Cliente>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: ClienteFormValues): Promise<Cliente> => {
    const { data } = await apiClient.put<Cliente>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
