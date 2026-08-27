import { apiClient } from '@/shared/api/client'
import type {
  CartaoCredito,
  CartaoCreditoAtualizarValues,
  CartaoCreditoCriarValues,
} from '../types'

const BASE_PATH = '/api/cartoes-credito'

export const cartaoCreditoApi = {
  listar: async (): Promise<CartaoCredito[]> => {
    const { data } = await apiClient.get<CartaoCredito[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<CartaoCredito> => {
    const { data } = await apiClient.get<CartaoCredito>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: CartaoCreditoCriarValues): Promise<CartaoCredito> => {
    const { data } = await apiClient.post<CartaoCredito>(BASE_PATH, values)
    return data
  },
  atualizar: async (id: string, values: CartaoCreditoAtualizarValues): Promise<CartaoCredito> => {
    const { data } = await apiClient.put<CartaoCredito>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
