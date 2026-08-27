import { apiClient } from '@/shared/api/client'
import type {
  Classificacao,
  ImportarMovimentacoesValues,
  MovimentacaoBancaria,
} from '../types'

const BASE_PATH = '/api/movimentacoes-bancarias'

/**
 * Sem `criar`/`atualizar` — Movimentação Bancária nunca é digitada livremente como fato novo
 * (`docs/domain-model/12-movimentacao-bancaria.md`, Seção 4); só `importar` (lote de extrato) e
 * `reclassificar` (único campo mutável) são casos de uso reais do backend
 * (`MovimentacaoBancariaController`).
 */
export const movimentacaoBancariaApi = {
  listar: async (contaBancariaId?: string): Promise<MovimentacaoBancaria[]> => {
    const { data } = await apiClient.get<MovimentacaoBancaria[]>(BASE_PATH, {
      params: contaBancariaId ? { contaBancariaId } : undefined,
    })
    return data
  },
  buscarPorId: async (id: string): Promise<MovimentacaoBancaria> => {
    const { data } = await apiClient.get<MovimentacaoBancaria>(`${BASE_PATH}/${id}`)
    return data
  },
  importar: async (values: ImportarMovimentacoesValues): Promise<MovimentacaoBancaria[]> => {
    const { data } = await apiClient.post<MovimentacaoBancaria[]>(`${BASE_PATH}/importar`, values)
    return data
  },
  /**
   * `Classificacao` inclui 'Transferência Interna' no tipo (é um valor real do enum de
   * `classificacao`), mas o backend recusa explicitamente essa atribuição por aqui —
   * `MovimentacaoBancariaService#reclassificar` só a aceita via
   * `POST /api/transferencias-internas` (`transferenciaInternaApi.criar`). O formulário
   * (`ReclassificarSelect`) já não a oferece como opção, então esta função nunca deveria
   * recebê-la na prática — mas o tipo do parâmetro reflete o enum real do domínio, não o
   * subconjunto permitido aqui, para não duplicar a lista de valores.
   */
  reclassificar: async (id: string, classificacao: Classificacao): Promise<MovimentacaoBancaria> => {
    const { data } = await apiClient.patch<MovimentacaoBancaria>(`${BASE_PATH}/${id}/classificacao`, {
      classificacao,
    })
    return data
  },
}
