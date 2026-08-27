import { apiClient } from '@/shared/api/client'
import type { Obra, ObraAtualizarValues, ObraCriarValues } from '../types'

const BASE_PATH = '/api/obras'

export const obraApi = {
  listar: async (): Promise<Obra[]> => {
    const { data } = await apiClient.get<Obra[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Obra> => {
    const { data } = await apiClient.get<Obra>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: ObraCriarValues): Promise<Obra> => {
    const { data } = await apiClient.post<Obra>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: ObraAtualizarValues): Promise<Obra> => {
    const { data } = await apiClient.put<Obra>(`${BASE_PATH}/${id}`, values)
    return data
  },
  /** Só as transições confirmadas em `ObraService.TRANSICOES_VALIDAS` — validado pelo backend. */
  transicionarStatus: async (id: string, novoStatus: Obra['status']): Promise<Obra> => {
    const { data } = await apiClient.post<Obra>(`${BASE_PATH}/${id}/status`, { novoStatus })
    return data
  },
}
