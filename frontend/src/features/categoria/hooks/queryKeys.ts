import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.categorias` — a mesma lista também é lida por
 * `shared/hooks/useCategoriaOptions.ts` (formulário de Lançamento Financeiro), e as duas
 * precisam compartilhar o mesmo cache do TanStack Query.
 */
export const categoriaKeys = {
  all: sharedQueryKeys.categorias,
  detail: (id: string) => [...sharedQueryKeys.categorias, id] as const,
}
