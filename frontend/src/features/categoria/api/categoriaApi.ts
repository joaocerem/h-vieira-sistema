import { apiClient } from '@/shared/api/client'
import type { Categoria, CategoriaFormValues } from '../types'

const BASE_PATH = '/api/categorias'

export const categoriaApi = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Categoria> => {
    const { data } = await apiClient.get<Categoria>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: CategoriaFormValues): Promise<Categoria> => {
    const { data } = await apiClient.post<Categoria>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: CategoriaFormValues): Promise<Categoria> => {
    const { data } = await apiClient.put<Categoria>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
