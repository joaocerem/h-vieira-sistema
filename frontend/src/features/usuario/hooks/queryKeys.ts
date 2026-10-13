import { sharedQueryKeys } from '@/shared/queryKeys'

/** Reusa `sharedQueryKeys.usuarios` como fonte única da chave. */
export const usuarioKeys = {
  all: sharedQueryKeys.usuarios,
  detail: (id: string) => [...sharedQueryKeys.usuarios, id] as const,
}
