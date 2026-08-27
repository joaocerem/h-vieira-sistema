import { apiClient } from '@/shared/api/client'
import type { Usuario, UsuarioAtualizarValues, UsuarioCriarValues } from '../types'

const BASE_PATH = '/api/usuarios'

export const usuarioApi = {
  listar: async (): Promise<Usuario[]> => {
    const { data } = await apiClient.get<Usuario[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Usuario> => {
    const { data } = await apiClient.get<Usuario>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: UsuarioCriarValues): Promise<Usuario> => {
    const { data } = await apiClient.post<Usuario>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: UsuarioAtualizarValues): Promise<Usuario> => {
    const { data } = await apiClient.put<Usuario>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
