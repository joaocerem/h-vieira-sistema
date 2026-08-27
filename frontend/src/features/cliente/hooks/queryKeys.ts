import { sharedQueryKeys } from '@/shared/queryKeys'

/**
 * Reusa `sharedQueryKeys.clientes` — mesma lógica de `features/categoria/hooks/queryKeys.ts`:
 * essa lista também é lida por `shared/hooks/useClienteOptions.ts` (formulário de Lançamento
 * Financeiro).
 */
export const clienteKeys = {
  all: sharedQueryKeys.clientes,
  detail: (id: string) => [...sharedQueryKeys.clientes, id] as const,
}
