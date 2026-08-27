import { apiClient } from '@/shared/api/client'
import type { TransferenciaInterna, TransferenciaInternaCriarValues } from '../types'

const BASE_PATH = '/api/transferencias-internas'

/**
 * Espelha `TransferenciaInternaController`. Sem `atualizar` — "Regras de alteração: não
 * definidas" no documento de domínio (`13-transferencia-interna.md`, Seção 4); tratada com a
 * mesma cautela já aplicada a `LiquidacaoFinanceira` (sem expor edição sem confirmação de
 * negócio).
 */
export const transferenciaInternaApi = {
  listar: async (): Promise<TransferenciaInterna[]> => {
    const { data } = await apiClient.get<TransferenciaInterna[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<TransferenciaInterna> => {
    const { data } = await apiClient.get<TransferenciaInterna>(`${BASE_PATH}/${id}`)
    return data
  },
  criar: async (values: TransferenciaInternaCriarValues): Promise<TransferenciaInterna> => {
    const { data } = await apiClient.post<TransferenciaInterna>(BASE_PATH, values)
    return data
  },
}
