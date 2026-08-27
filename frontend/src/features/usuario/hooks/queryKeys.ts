import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.usuarios` — a mesma lista também é lida por
 * `shared/hooks/useUsuarioOptions.ts` (Ajuste Financeiro exige `usuarioId` na criação).
 */
export const usuarioKeys = {
  all: sharedQueryKeys.usuarios,
  detail: (id: string) => [...sharedQueryKeys.usuarios, id] as const,
}
