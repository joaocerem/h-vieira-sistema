import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { sharedQueryKeys } from '@/shared/queryKeys'

export interface UsuarioOption {
  id: string
  nome: string
  identificadorDeAcesso: string
  situacaoDeAcesso: string | null
}

/**
 * Lista de Usuários para uso em campo de seleção — Ajuste Financeiro exige `usuarioId` na
 * criação (o responsável pelo ajuste; sem sessão autenticada ainda, S1, o usuário escolhe
 * explicitamente quem está registrando). Mesmo padrão de `useEmpresaOptions.ts` — chave
 * compartilhada com `features/usuario/hooks/queryKeys.ts` (`usuarioKeys.all`).
 */
export function useUsuarioOptions() {
  return useQuery({
    queryKey: sharedQueryKeys.usuarios,
    queryFn: async () => {
      const { data } = await apiClient.get<UsuarioOption[]>('/api/usuarios')
      return data
    },
  })
}
