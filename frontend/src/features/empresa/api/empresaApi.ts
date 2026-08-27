import { apiClient } from '@/shared/api/client'
import type { Empresa, EmpresaFormValues } from '../types'

const BASE_PATH = '/api/empresas'

/**
 * Chamadas HTTP do módulo Empresa — sempre via `shared/api/client` (`decisions.md`, decisão
 * #46), espelhando `EmpresaController` (backend). Nenhum componente/hook chama `apiClient`
 * diretamente, só através deste módulo.
 */
export const empresaApi = {
  listar: async (): Promise<Empresa[]> => {
    const { data } = await apiClient.get<Empresa[]>(BASE_PATH)
    return data
  },

  buscarPorId: async (id: string): Promise<Empresa> => {
    const { data } = await apiClient.get<Empresa>(`${BASE_PATH}/${id}`)
    return data
  },

  criar: async (values: EmpresaFormValues): Promise<Empresa> => {
    const { data } = await apiClient.post<Empresa>(BASE_PATH, values)
    return data
  },

  atualizar: async (id: string, values: EmpresaFormValues): Promise<Empresa> => {
    const { data } = await apiClient.put<Empresa>(`${BASE_PATH}/${id}`, values)
    return data
  },
}
