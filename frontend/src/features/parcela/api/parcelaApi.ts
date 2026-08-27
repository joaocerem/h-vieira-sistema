import { apiClient } from '@/shared/api/client'
import type { Parcela } from '../types'

const BASE_PATH = '/api/parcelas'

/**
 * Sem `criar` — Parcela é sempre gerada pelo sistema (`docs/domain-model/21-parcela.md`,
 * Seção 1: "Sistema, ao calcular o parcelamento"), nunca por digitação do usuário
 * (`ParcelaController`, backend, não tem `POST` de criação direta).
 */
export interface ListarParcelasFiltro {
  compraCartaoId?: string
  contratoFinanceiroId?: string
}

export const parcelaApi = {
  /** Espelha `ParcelaController#listarTodas` — os dois filtros são mutuamente exclusivos (mesma regra do backend: `compraCartaoId` tem precedência se ambos vierem preenchidos). */
  listar: async (filtro: ListarParcelasFiltro = {}): Promise<Parcela[]> => {
    const { data } = await apiClient.get<Parcela[]>(BASE_PATH, {
      params: {
        ...(filtro.compraCartaoId ? { compraCartaoId: filtro.compraCartaoId } : {}),
        ...(filtro.contratoFinanceiroId ? { contratoFinanceiroId: filtro.contratoFinanceiroId } : {}),
      },
    })
    return data
  },
  buscarPorId: async (id: string): Promise<Parcela> => {
    const { data } = await apiClient.get<Parcela>(`${BASE_PATH}/${id}`)
    return data
  },
  /**
   * Gatilho manual do "vencimento" — não existe agendador automático no projeto
   * (`ParcelaService#gerarLancamento`, comentário do backend: "o chamador decide quando
   * invocar"). Recusado pelo backend quando a Parcela já gerou Lançamento, ou (para origem
   * Compra Cartão) quando a Compra não está classificada Terraplanagem.
   */
  gerarLancamento: async (id: string): Promise<Parcela> => {
    const { data } = await apiClient.post<Parcela>(`${BASE_PATH}/${id}/gerar-lancamento`)
    return data
  },
}
