import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.empresas` (não uma chave própria) — a mesma lista também é lida por
 * `shared/hooks/useEmpresaOptions.ts` (ex. formulário de Conta Bancária), e as duas precisam
 * compartilhar o mesmo cache do TanStack Query.
 */
export const empresaKeys = {
  all: sharedQueryKeys.empresas,
  detail: (id: string) => [...sharedQueryKeys.empresas, id] as const,
}
