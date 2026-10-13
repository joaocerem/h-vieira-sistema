import { apiClient } from '@/shared/api/client'
import type { Fatura, FecharCicloValues } from '../types'

const BASE_PATH = '/api/faturas'

/**
 * Sem `POST` de criação direta genérica — a criação de Fatura é sempre o fechamento de um ciclo
 * (`fecharCiclo`); sem `atualizar` — imutável desde o fechamento (`FaturaController`, backend).
 * Sem `pagar` (decisão de negócio, Sprint 3) — não existe mais ação "Pagar fatura"; `fatura.paga`
 * é sempre derivado da conciliação bancária das Parcelas do ciclo.
 */
export const faturaApi = {
  listar: async (): Promise<Fatura[]> => {
    const { data } = await apiClient.get<Fatura[]>(BASE_PATH)
    return data
  },
  buscarPorId: async (id: string): Promise<Fatura> => {
    const { data } = await apiClient.get<Fatura>(`${BASE_PATH}/${id}`)
    return data
  },
  fecharCiclo: async (values: FecharCicloValues): Promise<Fatura> => {
    const { data } = await apiClient.post<Fatura>(`${BASE_PATH}/fechar-ciclo`, values)
    return data
  },
}
