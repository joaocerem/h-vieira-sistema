import { useState, type ReactNode } from 'react'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { toast } from 'sonner'
import { translateApiError } from '@/shared/api/errors'

/**
 * Estado de servidor via TanStack Query (`decisions.md`, decisão #47). `QueryCache`/
 * `MutationCache` centralizam o tratamento de erro de toda query/mutation da aplicação —
 * nenhuma feature precisa tratar erro de requisição individualmente; o `ApiError` do backend
 * já chega traduzido (`shared/api/errors.ts`) e é exibido via toast (loading/erro globais).
 */
function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const appError = translateApiError(error)
        toast.error(appError.message)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        const appError = translateApiError(error)
        toast.error(appError.message)
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
      },
    },
  })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
