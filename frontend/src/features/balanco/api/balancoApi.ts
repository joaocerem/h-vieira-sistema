import { apiClient } from '@/shared/api/client'
import type { Balanco } from '../types'

/**
 * Sem escrita — espelha `BalancoController`, único endpoint (`GET /api/balanco`).
 * `empresaId` opcional — omitido, soma todas as Empresas (mesmo comportamento do backend,
 * substituto pragmático do escopo automático por Empresa via Hibernate/JPA Filters, que
 * depende de autenticação ainda não implementada — S1-S3, `pendencias.md`, Seção 7).
 */
export const balancoApi = {
  calcular: async (empresaId?: string): Promise<Balanco> => {
    const { data } = await apiClient.get<Balanco>('/api/balanco', {
      params: empresaId ? { empresaId } : undefined,
    })
    return data
  },
}
